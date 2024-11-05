import { database } from "../database/database"
import { detailsLapanganTable, lapanganTable } from "../database/schema/schema"
import { LapanganValidation } from "../validation/lapangan-validation"
import { Validation } from "../validation/validation"
import { and, eq, getTableColumns, ilike, or } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import * as fs from "fs"


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
            with: {
                detailsLapangan: {
                    columns: {
                        price: true,
                        type: true
                    }
                }
            },
            offset: skip,
            limit: limit || 10,
            columns: {
                userId: false,
                mapUrl: false,
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
                totalPage: Math.ceil(totalItem / (limit || 10)) || 0,
                prevPage: prevPage,
                nextPage: nextPage,
                lapangan: lapangan
            }
        }, 200)
    }

    async getLapanganById(context: Context) {
        
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
        const requestLapangan: any = Validation.validate(LapanganValidation.Create, await context.req.parseBody())
        
        const data  = await context.req.parseBody()
        const file = data['picture'] as File
        
        
        if(file) {
            const newFile = { ...file, name: `${new Date().getTime()}.${file.type.split("/")[1]}` } as File
    
            const SIZE = 5 * 1024 * 1024
            const FILETYPE = /png|jpeg|jpg/
    
            if (!FILETYPE.test(file.type)) {
                throw new HTTPException(400, { message: "Invalid file, image only" })
            }
    
            if (file.size > SIZE) {
                throw new HTTPException(400, { message: "File to large" })
            }
    
            const buffer = await file.arrayBuffer()
            requestLapangan.picture = newFile.name
            
            fs.writeFile(`./public/images/upload/${newFile.name}`, Buffer.from(buffer), (err) => {
                if(err) {
                    throw new HTTPException(500, { message: "Failed upload" })
                } else {
                    requestLapangan.picture = newFile.name
                }
            })
        }

        const openSplit: any = requestLapangan.open
        const closeSplit: any = requestLapangan.close
        
        requestLapangan.open = openSplit.split(":")[0] + ":" + "00"
        requestLapangan.close = closeSplit.split(":")[0] + ":" + "00"        
        
        const { userId, ...omitId } = getTableColumns(lapanganTable)

        const lapangan = await database.insert(lapanganTable).values({
            name: requestLapangan.name,
            picture: requestLapangan.picture,
            description: requestLapangan.description,
            open: requestLapangan.open,
            close: requestLapangan.close,
            userId: await context.get("jwt").id,
            mapUrl: requestLapangan.mapUrl,
            alamat: requestLapangan.alamat,
        }).returning(omitId)

        return context.json({
            message: "Success create lapangan",
            data: lapangan[0]
        }, 201)
    }

    async updateLapangan(context: Context) {
        const { userId, ...user_id } = getTableColumns(lapanganTable)
        const requestLapangan = Validation.validate(LapanganValidation.Update, await context.req.json())

        requestLapangan.open = requestLapangan.open.split(":")[0] + ":" + "00"
        requestLapangan.close = requestLapangan.close.split(":")[0] + ":" + "00"
        

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

        const findLapangan = await database.query.lapanganTable.findFirst({
            where: and(
                eq(lapanganTable.userId, context.get("jwt").id),
                eq(lapanganTable.id, context.req.param("id"))
            ),
            with: {
                detailsLapangan: true
            }
        })

        const deleteLapangan = await database.transaction(async () => {
            
            if(findLapangan?.detailsLapangan.length! > 0) {

                const lapanganTersedia = await database.delete(detailsLapanganTable).where(
                    eq(detailsLapanganTable.lapanganId, context.req.param("id")),
                )
    
                if (lapanganTersedia.length < 1) {
                    throw new HTTPException(404, { message: "Lapangan not found" })
                }
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
        })

        return context.json({
            message: "Success delete lapangan",
            data: deleteLapangan
        }, 200)
    }
}

export default new LapanganController