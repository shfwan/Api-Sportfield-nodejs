import { database } from "../database/database"
import { lapanganTable } from "../database/schema/schema"
import { LapanganValidation } from "../validation/lapangan-validation"
import { Validation } from "../validation/validation"
import { and, eq, getTableColumns, ilike, or } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"


class LapanganController {
    async getLapangan(context: Context) {
        type Query = {
            page: number,
            limit: number
        }

        const { page, limit }: Query | any = context.req.query()
        
        const skip: number = ((page < 1 ? 1 : page) - 1) * (limit || 10)
        

        const lapangan = await database.query.lapanganTable.findMany({
            where: or(
                ilike(lapanganTable.name, `%${context.req.query("value") || ""}%`)
            ),
            offset: skip,
            limit: limit || 10,
            columns: {
                userId: false,
                address: false,
                createdAt: false,
                updatedAt: false
            }
        })
        
        const totalItem = (await database.query.lapanganTable.findMany()).length
                
        const prevPage: boolean = skip > 1 ? true : false
        const nextPage: boolean = (page * limit) < totalItem
        
        return context.json({
            message: "Success get lapangan",
            data: {
                count: totalItem,
                page: +page || 1,
                totalPage: Math.ceil(totalItem / (limit || 10)),
                prevPage: prevPage,
                nextPage: nextPage,
                lapangan: lapangan
            }
        }, 200)
    }

    async getLapanganById(context: Context) {
        console.log(context.req.query("userId"));
        
        const lapangan = await database.query.lapanganTable.findFirst({
            where: or(
                eq(lapanganTable.id, context.req.param("id")),
                eq(lapanganTable.userId, context.req.param("id"))
            ),
            columns: {
                userId: false,
            },
        })

        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success get lapangan", data: lapangan })
    }

    async createLapangan(context: Context) {
        const requestLapangan = Validation.validate(LapanganValidation.Create, await context.req.json())
        const { userId, ...omitId } = getTableColumns(lapanganTable)

        const lapangan = await database.insert(lapanganTable).values({
            name: requestLapangan.name,
            picture: requestLapangan.picture,
            description: requestLapangan.description,
            address: requestLapangan.address,
            open: requestLapangan.open,
            close: requestLapangan.close,
            userId: await context.get("jwt").id
        }).returning(omitId)

        return context.json({
            message: "Success create lapangan",
            data: lapangan[0]
        }, 201)
    }

    async updateLapangan(context: Context) {
        const { userId, ...user_id } = getTableColumns(lapanganTable)
        const requestLapangan = Validation.validate(LapanganValidation.Update, await context.req.json())

        if (context.req.param("id").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }
        const lapangan = await database.update(lapanganTable).set(requestLapangan).where(
            and(
                eq(lapanganTable.userId, context.get("jwt").id),
                eq(lapanganTable.id, context.req.param("id"))
            )
        ).returning(user_id)

        if (lapangan.length < 1) {
            throw new HTTPException(404, { message: "Lapangan not found" })
        }
        return context.json({
            message: "Success update lapangan",
            data: lapangan[0]
        }, 200)
    }

    async deleteLapangan(context: Context) {
        if (context.req.param("id").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }

        const lapangan = await database.delete(lapanganTable).where(
            and(
                eq(lapanganTable.userId, context.get("jwt").id),
                eq(lapanganTable.id, context.req.param("id"))
            )
        ).returning()

        if (lapangan.length < 1) {
            throw new HTTPException(404, { message: "Lapangan not found" })
        }

        return context.json({
            message: "Success delete lapangan",
            data: lapangan[0]
        }, 200)
    }
}

export default new LapanganController