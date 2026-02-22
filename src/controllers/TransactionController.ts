import { Context } from "hono"
import { database } from "../database/database"
import { detailOrderTable, detailsLapanganTable, lapanganTable, notificationTable, ordersTable, userTable } from "../database/schema/schema"
import { and, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { MidtransClient } from "midtrans-node-client"
import { Validation } from "../validation/validation"
import { OrderValidation } from "../validation/order-validation"

class TransactionController {
    async Pembayaran(context: Context) {

        const findUser = await database.query.userTable.findFirst({
            where: eq(userTable.id, context.get("jwt").id),
        })
        if (!findUser) throw new HTTPException(404, { message: "User not found" })

        const findOrder = await database.query.ordersTable.findFirst({
            where: eq(ordersTable.id, context.req.query("orderId") as any),
            with: {
                detailOrder: true
            }
        })
        if (!findOrder) throw new HTTPException(404, { message: "Order not found" })



        const findLapangan = await database.query.lapanganTable.findFirst({
            where: eq(lapanganTable.id, context.req.param("lapanganId") as any),
        })
        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const findLapanganTersedia = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
            )
        })
        if (!findLapanganTersedia) throw new HTTPException(404, { message: "Lapangan not found" })

        type Item = {
            id: number;
            open: string;
            close: string;
        }


        const compareJam = (array1: [], array2: []) => {
            return (
                array1.every((item1: Item) => (
                    array2.some((item2: Item) => item1.id == item2.id)
                ))
            )
        }
        const date = new Date()


        const checkJamOrder = await database.query.detailOrderTable.findMany({
            where: and(
                eq(detailOrderTable.detailsLapanganId, context.req.param("id") as any),
                eq(detailOrderTable.date, date.toJSON().split("T")[0])
            ),
            with: {
                orders: {
                    columns: {
                        statusPembayaran: true
                    }
                }
            }
        })

        let shouldBreak = false;
        checkJamOrder.forEach((item) => {

            if (compareJam(findOrder.detailOrder?.jam as [], item.jam as []) && item.orders.statusPembayaran) {
                throw new HTTPException(400, { message: "Jam sudah Terbooking" })
                shouldBreak = true;
            }

            if (date.getHours() >= parseInt(item.jam[0].open)) {
                throw new HTTPException(400, { message: "Sudah melewati jam" })
            }

            if (shouldBreak) {
                return; // This will stop the iteration of the loop
            }
        });

        const snap = new MidtransClient.Snap({
            isProduction: false,
            clientKey: process.env.CLIENT_KEY,
            serverKey: process.env.SERVER_KEY
        })

        const token = await snap.createTransactionToken({

            item_details: {
                name: findLapangan.name,
                price: findLapanganTersedia.price,
                quantity: findOrder.detailOrder?.jam.length,
                category: findLapanganTersedia.type
            },
            transaction_details: {
                order_id: findOrder.id,
                gross_amount: findLapanganTersedia.price! * findOrder.detailOrder?.jam.length!
            },
            customer_details: {
                first_name: findUser?.firstname,
                last_name: findUser?.lastname,
                email: findUser?.email,
                phone: findUser?.phone
            },
        }).catch(err => { throw new HTTPException(500, { message: err }) })

        const result = {
            token: token
        }

        return context.json({ message: "Success order", data: result }, 201)
    }

    async Checkout(context: Context) {

        const body = await context.req.json()
        const merge = { ...body, "detailLapanganId": parseInt(context.req.param("id")) }

        if (context.req.param("lapanganId").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }

        const requestOrder = Validation.validate(OrderValidation.Checkout, merge)

        const tanggal = new Date(requestOrder.date)
        const checkJamOrder = await database.query.detailOrderTable.findMany({
            where: and(
                eq(detailOrderTable.detailsLapanganId, requestOrder.detailLapanganId),
                eq(detailOrderTable.date, tanggal.toJSON().split("T")[0])
            ),
            with: {
                orders: {
                    columns: {
                        statusPembayaran: true
                    }
                }
            }
        })

        type Item = {
            id: number;
            open: string;
            close: string;
        }
        //Sorting jam
        requestOrder.jam.sort((a: Item, b: Item) => a.id - b.id)

        const compareJam = (array1: [], array2: []) => {
            return (
                array1.every((item1: Item) => (
                    array2.some((item2: Item) => item1.id == item2.id)
                ))
            )
        }

        let shouldBreak = false;
        checkJamOrder.forEach((item) => {

            if (compareJam(requestOrder.jam, item.jam as []) && item.orders.statusPembayaran) {
                throw new HTTPException(400, { message: "Jam sudah terbooking" })
                shouldBreak = true;
            }
            if (shouldBreak) {
                return; // This will stop the iteration of the loop
            }
        });

        const role = await context.get("jwt").role

        const findUser = await database.query.userTable.findFirst({
            where: eq(userTable.id, context.get("jwt").id),
        })
        if (!findUser) throw new HTTPException(404, { message: "User not found" })

        const lapangan = await database.query.detailsLapanganTable.findFirst({ where: eq(detailsLapanganTable.id, requestOrder.detailLapanganId) })
        const user = await database.query.userTable.findFirst({ where: eq(userTable.id, context.get("jwt").id) })




        const snap = new MidtransClient.Snap({
            isProduction: false,
            clientKey: process.env.CLIENT_KEY,
            serverKey: process.env.SERVER_KEY
        })

        const token = await snap.createTransactionToken({

            item_details: {
                name: lapangan?.name,
                price: lapangan?.price,
                quantity: requestOrder.jam.length,
                category: lapangan?.type
            },
            transaction_details: {
                order_id: Math.random(),
                gross_amount: lapangan?.price! * requestOrder.jam.length
            },
            customer_details: {
                first_name: findUser?.firstname,
                last_name: findUser?.lastname,
                email: findUser?.email,
                phone: findUser?.phone
            },
        })

        if(!token) throw new HTTPException(500, {message: "Gagal checkout"})


        const data = await database.transaction(async () => {

            // const {id, orderId, detailsLapanganId, ...omit} = getTableColumns(detailOrderTable)

            const result = await database.insert(ordersTable).values(
                {
                    userId: context.get("jwt").id,
                    lapanganId: context.req.param("lapanganId") as any,
                    date: tanggal.toLocaleDateString(),
                    playStatus: role === "provider" ? false : false,
                    orderStatus: role === "provider" ? true : true,
                    statusPembayaran: role === "provider" ? true : false,
                    snapToken: token
                }
            ).returning()

            const detail = await database.insert(detailOrderTable).values({
                orderId: result[0].id,
                detailsLapanganId: requestOrder.detailLapanganId.toString(),
                date: tanggal.toLocaleDateString(),
                jam: requestOrder.jam,
            }).returning()


            return {
                order: result[0],
                detailOrder: detail[0],
                lapangan: lapangan,
                user: user
            }
        })

        return context.json({ message: "Success order", data: data }, 201)

    }

    async UpdateStatusPembayaran(context: Context) {

        const findLapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
            )
        })

        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const findOrder = await database.query.ordersTable.findFirst({
            where: and(
                eq(ordersTable.userId, context.get("jwt").id),
                eq(ordersTable.lapanganId, context.req.param("lapanganId")),
                eq(ordersTable.id, context.req.query("orderId") as any)
            )
        })
        if (!findOrder) throw new HTTPException(404, { message: "Order not found" })

        const order = await database.update(ordersTable).set({
            statusPembayaran: true,
            orderStatus: true
        }).where(
            and(
                eq(ordersTable.userId, context.get("jwt").id),
                eq(ordersTable.lapanganId, context.req.param("lapanganId")),
                eq(ordersTable.id, context.req.query("orderId") as any)
            )
        ).returning()

        if (order) {
            await database.insert(notificationTable).values({
                title: "info",
                userId: await context.get("jwt").id,
                lapanganId: await context.req.param("lapanganId"),
                description: ""
            })
        }

        return context.json({ message: "Success update status pembayaran", data: order })

    }
}

export default new TransactionController