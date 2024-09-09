import { database } from "../database/database"
import { detailsLapanganTable, lapanganTable } from "../database/schema/schema"
import { DetailsLapanganValidation } from "../validation/lapangan-validation"
import { Validation } from "../validation/validation"
import { eq, getTableColumns } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

class DetailsLapanganController {
    async getListDetailLapangan(context: Context) {
        const listLapangan = await database.query.detailsLapanganTable.findMany(
            {
                where: eq(detailsLapanganTable.lapanganId, context.req.param("id") as any),
            }
        )

        return context.json({ message: "Success get list detail lapangan", data: listLapangan }, 200)
    }

    async getDetailLapangan(context: Context) {
        const findLapangan = await database.query.lapanganTable.findFirst({
            where: eq(lapanganTable.id, context.req.param("id") as any),
        })

        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const detailLapangan = await database.query.detailsLapanganTable.findFirst({
            where: eq(detailsLapanganTable.id, context.req.query("id") as any),
        })

        if (!detailLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success get detail lapangan", lapangan: detailLapangan }, 200)
    }

    async createDetailLapangan(context: Context) {
        
        const { lapanganId, ...omitId } = getTableColumns(detailsLapanganTable)
        const requestLapangan = Validation.validate(DetailsLapanganValidation.Create, await context.req.json())

        if (context.req.param("id").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }

        const findLapangan = await database.query.lapanganTable.findFirst({
            where: eq(lapanganTable.id, context.req.param("id") as any),
        })

        if(!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const detailLapangan = await database.insert(detailsLapanganTable).values({
            name: requestLapangan.name,
            description: requestLapangan.description,
            statusLapangan: requestLapangan.statusLapangan,
            type: requestLapangan.type,
            price: requestLapangan.price,
            jam: [],
            lapanganId: context.req.param("id"),
        }).returning(omitId)

        if (!detailLapangan) throw new HTTPException(500, { message: "Failed add lapangan" })

        return context.json({ message: "Success create detail lapangan", data: detailLapangan[0] }, 201)
    }

    async updateDetailLapangan(context: Context) {

        const { lapanganId, id, ...omitId } = getTableColumns(detailsLapanganTable)
        const requestLapangan = Validation.validate(DetailsLapanganValidation.Update, await context.req.json())

        const detailLapangan = await database.update(detailsLapanganTable).set(requestLapangan).where(eq(detailsLapanganTable.id, context.req.param("id") as any)).returning(omitId)
        if (detailLapangan.length < 1) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success update lapangan", data: detailLapangan[0] }, 200)
    }

    async deleteDetailLapangan(context: Context) {        
        const detailLapangan = await database.delete(detailsLapanganTable).where(eq(detailsLapanganTable.id, context.req.param("id") as any)).returning()
        
        if (detailLapangan.length < 1) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success remove lapangan", data: detailLapangan[0] }, 200)
    }

}

export default new DetailsLapanganController