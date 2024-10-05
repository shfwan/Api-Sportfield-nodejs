import { database } from "../database/database"
import { detailsLapanganTable, lapanganTable } from "../database/schema/schema"
import { DetailsLapanganValidation } from "../validation/lapangan-validation"
import { Validation } from "../validation/validation"
import { and, eq, getTableColumns } from "drizzle-orm"
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

        return context.json({ message: "Success get detail lapangan", data: detailLapangan }, 200)
    }

    // async getDetailLapanganTersedia(context: Context) {
    //     const findLapanganTersedia = await database.query.deta
    // }

    async createDetailLapangan(context: Context) {

        const { lapanganId, ...omitId } = getTableColumns(detailsLapanganTable)
        const requestLapangan = Validation.validate(DetailsLapanganValidation.Create, await context.req.json())
        
        requestLapangan.open = requestLapangan.open.split(":")[0] + ":" + "00"
        requestLapangan.close = requestLapangan.close.split(":")[0] + ":" + "00"
                
        if (context.req.param("id").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }

        const findLapangan = await database.query.lapanganTable.findFirst({
            where: eq(lapanganTable.id, context.req.param("id") as any),
        })

        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        type Jam = {
            id: number
            open: string;
            close: string;
        }

        const jam: Jam[] = []
        let lenghtJam = 0
        let checkJam = "today"

        if(requestLapangan.open === requestLapangan.close) {
            throw new HTTPException(400, { message: "Jam tidak boleh sama" })
        }

        if (parseInt(requestLapangan.open) <= parseInt(requestLapangan.close)) {
            checkJam = "today"
        } else {
            checkJam = "tomorrow"
        }

        if (checkJam === "tomorrow") {
            lenghtJam = parseInt(requestLapangan.close) + 24
        } else if (checkJam === "today") {
            lenghtJam = parseInt(requestLapangan.close)
        } else {
            lenghtJam = parseInt(requestLapangan.close)
        }

        for (let i = parseInt(requestLapangan.open); i < lenghtJam; i++) {
            if (i >= 25) {
                jam.push({
                    id: jam.length + 1,
                    open: `0${i - 24}:00`,
                    close: `0${i - 23}:00`,
                })
            } else {
                if (i < 24) {
                    jam.push({
                        id: jam.length + 1,
                        open: `${i > 9 ? i : "0" + i}:00`,
                        close: `${i === 23 ? "00" : (i + 1) > 9 ? i + 1 : "0" + (i + 1)}:00`,
                    })

                } else {
                    jam.push({
                        id: jam.length + 1,
                        open: `0${i == 24 ? 0 : i}:00`,
                        close: `0${i - 23}:00`,
                    })
                }
            }
        }

        const detailLapangan = await database.insert(detailsLapanganTable).values({
            name: requestLapangan.name,
            description: requestLapangan.description,
            statusLapangan: requestLapangan.statusLapangan,
            type: requestLapangan.type,
            price: requestLapangan.price,
            jam: jam,
            lapanganId: context.req.param("id"),
        }).returning(omitId)

        if (!detailLapangan) throw new HTTPException(500, { message: "Failed add lapangan" })

        return context.json({ message: "Success create detail lapangan", data: detailLapangan[0] }, 201)
    }

    async updateDetailLapangan(context: Context) {

        const { lapanganId, id, ...omitId } = getTableColumns(detailsLapanganTable)
        const requestLapangan = Validation.validate(DetailsLapanganValidation.Update, await context.req.json())

        requestLapangan.open = requestLapangan.open.split(":")[0] + ":" + "00"
        requestLapangan.close = requestLapangan.close.split(":")[0] + ":" + "00"
        
        console.log(requestLapangan);
        

        type Jam = {
            id: number
            open: string;
            close: string;
        }

        const jam: Jam[] = []
        let lenghtJam = 0
        let checkJam = "today"

        if(requestLapangan.open === requestLapangan.close) {
            throw new HTTPException(400, { message: "Jam tidak boleh sama" })
        }

        if (parseInt(requestLapangan.open) <= parseInt(requestLapangan.close)) {
            checkJam = "today"
        } else {
            checkJam = "tomorrow"
        }

        if (checkJam === "tomorrow") {
            lenghtJam = parseInt(requestLapangan.close) + 24
        } else if (checkJam === "today") {
            lenghtJam = parseInt(requestLapangan.close)
        } else {
            lenghtJam = parseInt(requestLapangan.close)
        }

        for (let i = parseInt(requestLapangan.open); i < lenghtJam; i++) {
            if (i >= 25) {
                jam.push({
                    id: jam.length + 1,
                    open: `0${i - 24}:00`,
                    close: `0${i - 23}:00`,
                })
            } else {
                if (i < 24) {
                    jam.push({
                        id: jam.length + 1,
                        open: `${i > 9 ? i : "0" + i}:00`,
                        close: `${i === 23 ? "00" : (i + 1) > 9 ? i + 1 : "0" + (i + 1)}:00`,
                    })

                } else {
                    jam.push({
                        id: jam.length + 1,
                        open: `0${i == 24 ? 0 : i}:00`,
                        close: `0${i - 23}:00`,
                    })
                }
            }
        }

        const body = { ...requestLapangan, jam: jam }
        
        const detailLapangan = await database.update(detailsLapanganTable).set(body).where(
            and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any)
            )
        ).returning(omitId)
        if (detailLapangan.length < 1) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success update lapangan", data: detailLapangan[0] }, 200)
    }

    async deleteDetailLapangan(context: Context) {
        const detailLapangan = await database.delete(detailsLapanganTable).where(
            and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any)
            )
        ).returning()

        if (detailLapangan.length < 1) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success remove lapangan", data: detailLapangan[0] }, 200)
    }

    async deleteAllDetailLapangan(context: Context) {
        const detailLapangan = await database.delete(detailsLapanganTable).where(eq(detailsLapanganTable.lapanganId, context.req.param("id") as any)).returning()

        if (detailLapangan.length < 1) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json({ message: "Success remove all lapangan", data: detailLapangan[0] }, 200)
    }

}

export default new DetailsLapanganController