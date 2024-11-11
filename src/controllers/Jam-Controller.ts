import { database } from "../database/database";
import { detailOrderTable, detailsLapanganTable } from "../database/schema/schema";
import { JamValidation } from "../validation/jam-validation";
import { Validation } from "../validation/validation";
import { and, eq, or } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
    
class JamController {

    async getJam(context: Context) {

        const lapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            )
        })
        
        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const data = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            ),
            columns: {
                price: true,
                type: true,
                jam: true
            },
        })

        const { date } = context.req.query()
        const tanggal = new Date()
        const tomorrow = new Date(date)

        const order = await database.query.detailOrderTable.findMany({
            where: or(
                eq(detailOrderTable.detailsLapanganId, context.req.param("id") as any),
                eq(detailOrderTable.date, tomorrow.toJSON().split("T")[0])
            ),
            columns: {
                jam: true,
                date: true,
            },
            with: {
                orders: {
                    columns: {
                        statusPembayaran: true
                    }
                }
            }
        })
        
        if (!order) throw new HTTPException(404, { message: "Lapangan not found" })

        type Jam = {
            id: number
            open: string
            close: string
            isAvailable: boolean
        }

        const jam = data?.jam as Jam[]
        const available = jam.map((values) => {

            // Pengecekan jadwal
            if (tanggal.getDate() == tomorrow.getDate() && tanggal.getHours() >= parseInt(values.open.split(":")[0])) { //Sesuai hari dan jam
                values.isAvailable = false
            } else if (tomorrow.getDate() >= tanggal.getDate()) { //Sesuai hari
                values.isAvailable = true
            } else {
                values.isAvailable = false
            }

            // Pengecekan jadwal yang sudah terbooking            
            order.map((item) => {
                
                item.jam?.map((v) => {
                    if (new Date(item.date).getDate() == tomorrow.getDate()) {
                        if (values.id == v?.id) {
                            if(item.orders.statusPembayaran) {
                                values.isAvailable = false
                            }
                        }
                    }
                })
            })

            return values
        })        

        return context.json(
            {
                message: "Success get jam",
                data: {
                    date: tomorrow.toLocaleDateString(),
                    type: data?.type,
                    price: data?.price,
                    available: available.filter((a) => a.isAvailable === true).length,
                    jadwal: [...available]
                }

            }, 200)

    }

    async createJam(context: Context) {
        const lapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            )
        })

        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const { jam } = lapangan!
        const requestJam = Validation.validate(JamValidation.Create, await context.req.json())

        type Jam = {
            open: string;
            close: string;
        }

        requestJam.jam.map((item: Jam) => {

            jam?.push(
                {
                    id: jam.length + 1,
                    open: item.open,
                    close: item.close
                },
            )
        })



        const updateJamLapangan = await database
            .update(detailsLapanganTable)
            .set({ jam: jam })
            .where(
                and(
                    eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                    eq(detailsLapanganTable.id, context.req.param("id") as any)
                )
            ).returning()
        if (!updateJamLapangan) throw new HTTPException(500, { message: "Failed add jam" })

        return context.json({ message: "Success add jam", data: updateJamLapangan[0].jam }, 201)
    }

    async deleteJam(context: Context) {

        const lapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            )
        })
        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const { jam } = lapangan!
        const id = parseInt(context.req.query("id") as any)

        const index = jam?.findIndex((i) => {
            return i.id == id
        }) as number

        if (index > -1) {
            jam?.splice(index, 1)
        } else {
            throw new HTTPException(404, { message: "Jam not found" })
        }

        const updateJamLapangan = await database
            .update(detailsLapanganTable)
            .set({ jam })
            .where(
                and(
                    eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                    eq(detailsLapanganTable.id, context.req.param("id") as any)
                )
            ).returning()

        return context.json({ message: "Success remove jam", data: updateJamLapangan[0].jam }, 200)
    }

    async ResetJam(context: Context) {

        const lapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            )
        })
        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        let { jam } = lapangan!
        jam = []
        const updateJamLapangan = await database
            .update(detailsLapanganTable)
            .set({ jam })
            .where(
                and(
                    eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                    eq(detailsLapanganTable.id, context.req.param("id") as any)
                )
            ).returning()

        return context.json({ message: "Success remove jam", data: updateJamLapangan[0].jam }, 200)
    }
}

export default new JamController