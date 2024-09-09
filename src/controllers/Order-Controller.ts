import { database } from "../database/database";
import { detailOrderTable, detailsLapanganTable, lapanganTable, ordersTable, profileInfoTable, userTable } from "../database/schema/schema";
import { OrderValidation } from "../validation/order-validation";
import { Validation } from "../validation/validation";
import { and, eq, getTableColumns } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { MidtransClient } from "midtrans-node-client";

class OrderController {
    async List(context: Context) {
        const orders = await database.query.ordersTable.findMany({
            where: eq(ordersTable.userId, context.get("jwt").id),
            with: {
                detailOrder: true
            }
        })

        return context.json({ message: "Success get orders", orders }, 200)
    }

    async Detail(context: Context) {

        const order = await database.query.ordersTable.findFirst({
            where: and(
                eq(ordersTable.userId, context.get("jwt").id),
                eq(ordersTable.id, context.req.param("id") as any)
            ),
            with: {
                detailOrder: true
            }
        })
        if (!order) throw new HTTPException(404, { message: "Order not found" })

        return context.json(
            {
                message: "Succes get detail order",
                order: {
                    id: order.id,
                    playStatus: order.playStatus,
                    orderStatus: order.orderStatus,
                    tanggalBermain: order.detailOrder?.date as string,
                    price: 10000,
                    lamaBermain: [order.detailOrder?.jam].length,
                    jam: order.detailOrder?.jam,
                    total: [order.detailOrder?.jam].length * 10000,
                    tanggalOrder: order.createdAt.toLocaleString()
                }
            }
        )
    }

    async Checkout(context: Context) {

        const findUser = await database.query.userTable.findFirst({
            where: eq(userTable.id, context.get("jwt").id),
        })
        if (!findUser) throw new HTTPException(404, { message: "User not found" })

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

        const body = await context.req.json()
        const merge = { ...body, "detailLapanganId": parseInt(context.req.param("id")) }

        const requestOrder = Validation.validate(OrderValidation.Checkout, merge)

        const checkJamOrder = await database.query.detailOrderTable.findMany({
            where: eq(detailOrderTable.detailsLapanganId, context.req.param("id") as any),
        })

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

        let shouldBreak = false;
        checkJamOrder.forEach((item) => {
            if (compareJam(requestOrder.jam, item.jam)) {
                throw new HTTPException(400, { message: "Jam sudah terbooking" })
                shouldBreak = true;
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
                quantity: [requestOrder.jam].length,
                category: findLapanganTersedia.type
            },
            transaction_details: {
                order_id: "adssad",
                gross_amount: findLapanganTersedia.price! * [requestOrder.jam].length
            },
            customer_details: {
                first_name: findUser?.firstname,
                last_name: findUser?.lastname,
                email: findUser?.email,
                phone: findUser?.phone
            },
        }).catch(err => err)

        const result = {
            // order: { ...data.order, ...data.detailOrder },
            token: token
        }

        return context.json({ message: "Success order", data: result })
    }

    async Order(context: Context) {

        const body = await context.req.json()
        const merge = { ...body, "detailLapanganId": parseInt(context.req.param("id")) }

        const requestOrder = Validation.validate(OrderValidation.Checkout, merge)

        
        const data = await database.transaction(async () => {

            // const {id, orderId, detailsLapanganId, ...omit} = getTableColumns(detailOrderTable)

            const result = await database.insert(ordersTable).values({ userId: context.get("jwt").id, }).returning()

            const detail = await database.insert(detailOrderTable).values({
                orderId: result[0].id,
                detailsLapanganId: context.req.param("id") as any,
                date: requestOrder.date,
                jam: requestOrder.jam,
            }).returning()

            const lapangan = await database.query.detailsLapanganTable.findFirst({ where: eq(detailsLapanganTable.id, detail[0].detailsLapanganId) })
            const bio = await database.query.userTable.findFirst({ where: eq(userTable.id, context.get("jwt").id) })

            return {
                order: result[0],
                detailOrder: detail[0],
                lapangan: lapangan,
                bio: bio
            }
        })

    }

    async UpdateOrderPlay(context: Context) {
        // console.log(context.req.param());

        const findLapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
            )
        })

        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const checkStatus = await database.query.ordersTable.findFirst({
            where: and(
                eq(ordersTable.id, context.req.query("id") as any),
            )
        })

        if (checkStatus?.playStatus == true && checkStatus?.orderStatus == false) {
            throw new HTTPException(404, { message: "Game already played" })
        } else if (checkStatus?.playStatus == false && checkStatus?.orderStatus == false) {
            throw new HTTPException(404, { message: "Game over" })
        }


        const order = await database.update(ordersTable).set({
            orderStatus: false,
            playStatus: true
        }).where(
            eq(ordersTable.id, context.req.query("id") as any)
        ).returning()
        console.log(order);


        return context.json({ message: "Success update play game", data: order })
    }

    async UpdateOrderEnd(context: Context) {
        const findLapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.id, context.req.param("id") as any),
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),

            )
        })
        if (!findLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        const checkStatus = await database.query.ordersTable.findFirst({
            where: and(
                eq(ordersTable.id, context.req.query("id") as any),
            )
        })

        if (checkStatus?.playStatus == false && checkStatus?.orderStatus == false) {
            throw new HTTPException(404, { message: "Game over" })
        } else if (checkStatus?.playStatus == false && checkStatus?.orderStatus == true) {
            throw new HTTPException(404, { message: "Game not started yet" })
        }

        const order = await database.update(ordersTable).set({
            playStatus: false
        }).where(
            eq(ordersTable.id, context.req.query("id") as any)
        ).returning()

        return context.json({ message: "Success update end game", data: order })
    }

    async DeleteOrder(context: Context) {

        const findOrder = await database.query.ordersTable.findFirst({
            where: eq(ordersTable.id, context.req.param("id"))
        })
        if (!findOrder) throw new HTTPException(404, { message: "Order not found" })



        const order = await database.transaction(async () => {
            const detailOrder = await database.delete(detailOrderTable).where(eq(detailOrderTable.orderId, context.req.param("id")))
            const orderResult = await database.delete(ordersTable).where(eq(ordersTable.id, context.req.param("id")))
            return { detailOrder, orderResult }
        })

        return context.json({ message: "Success delete order" })
    }
}

export default new OrderController