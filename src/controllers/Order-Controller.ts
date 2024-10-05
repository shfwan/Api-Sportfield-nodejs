import { database } from "../database/database";
import { detailOrderTable, detailsLapanganTable, lapanganTable, ordersTable, userTable } from "../database/schema/schema";
import { OrderValidation } from "../validation/order-validation";
import { Validation } from "../validation/validation";
import { and, eq, getTableColumns, isNotNull, or } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { MidtransClient } from "midtrans-node-client";


class OrderController {
    async List(context: Context) {
        let status = context.req.query("status")
        const role = context.get("jwt").role

        let statusOrder = {
            play: false,
            order: true,
            bayar: false
        }

        if (status === "Belum Bayar") {
            statusOrder.bayar = false
        } else if (status === "Sudah Bayar") {
            statusOrder.bayar = true
        } else if (status === "Dibatalkan") {
            statusOrder.play = false
            statusOrder.order = false
            statusOrder.bayar = false
        } else if (status === "Selesai") {
            statusOrder.play = false
            statusOrder.order = false
            statusOrder.bayar = true
        } else if (status === "Sedang Bermain") {
            statusOrder.play = true
            statusOrder.order = false
            statusOrder.bayar = true
        } else if (status === "Belum Bermain") {
            statusOrder.play = false
            statusOrder.order = true
            statusOrder.bayar = true
        } else {
            statusOrder.play = null as any
            statusOrder.order = null as any

            if (role === "customer") {
                statusOrder.bayar = null as any
            } else if (role === "provider") {
                statusOrder.bayar = true as any
            }
        }

        type Query = {
            page: number,
            limit: number
        }

        const { page, limit }: Query | any = context.req.query()

        const skip: number = ((page < 1 ? 1 : page) - 1) * (limit || 5)

        console.log(statusOrder, context.req.query());

        const orders = await database.query.ordersTable.findMany({
            where: and(
                context.req.query("id") != undefined ? eq(ordersTable.lapanganId, context.req.query("id") as any) : eq(ordersTable.userId, context.get("jwt").id),

                statusOrder.order != null ? and(
                    eq(ordersTable.playStatus, statusOrder.play) || true,
                    eq(ordersTable.orderStatus, statusOrder.order) || true,
                    eq(ordersTable.statusPembayaran, statusOrder.bayar) || true,
                ) : role === "provider" ? eq(ordersTable.statusPembayaran, true) : isNotNull(ordersTable.statusPembayaran)
            ),

            offset: skip,
            limit: limit || 5,
            with: {
                detailOrder: true
            }
        })

        if (!orders) throw new HTTPException(404, { message: "Orders not found" })


        const totalItem = (await database.query.ordersTable.findMany()).length
        const prevPage: boolean = skip > 1 ? true : false
        const nextPage: boolean = (page * limit) < totalItem

        if (role === "provider") {
            const ordersData = await database.query.ordersTable.findMany({
                where: and(
                    eq(ordersTable.lapanganId, context.req.query("id") as any),
                    eq(ordersTable.statusPembayaran, true),
                ),
                with: {
                    detailOrder: {
                        columns: {
                            jam: true,
                        }
                    },
                    lapangan: {
                        with: {
                            detailsLapangan: true
                        }
                    }
                }
            })

            const income = ordersData.map((item) => {
                const price = item.lapangan.detailsLapangan.find((detail) => detail.lapanganId === item.lapanganId)?.price
                return item.detailOrder?.jam.length! * price!
            })


            const stat = {
                totalOrder: ordersData.length,
                confirmed: ordersData.filter((item) => { return item.playStatus === true && item.orderStatus === false || item.playStatus === false && item.orderStatus === false }).length,
                income: income.reduce((a, b) => a + b, 0)
            }

            return context.json({
                message: "Success get orders",
                data: {
                    count: totalItem,
                    page: +page || 1,
                    totalPage: Math.ceil(totalItem / (limit || 5)) || 0,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    order: orders,
                    stat
                }
            }, 200)

        } else if (role === "customer") {
            return context.json({
                message: "Success get orders",
                data: {
                    count: totalItem,
                    page: +page || 1,
                    totalPage: Math.ceil(totalItem / (limit || 5)) || 0,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    order: orders,
                }
            }, 200)
        }

    }

    async Stat(context: Context) {
        const orders = await database.query.ordersTable.findMany({
            where: and(
                eq(ordersTable.lapanganId, context.req.param("id")),
                eq(ordersTable.statusPembayaran, true),
            ),
            with: {
                detailOrder: {
                    columns: {
                        jam: true,
                    }
                },
                lapangan: {
                    with: {
                        detailsLapangan: true
                    }
                }
            }
        })

        const income = orders.map((item) => {
            const price = item.lapangan.detailsLapangan.find((detail) => detail.lapanganId === item.lapanganId)?.price
            return item.detailOrder?.jam.length! * price!
        })


        const stat = {
            totalOrder: orders.length,
            confirmed: orders.filter((item) => { return item.playStatus === true && item.orderStatus === false || item.playStatus === false && item.orderStatus === false }).length,
            income: income.reduce((a, b) => a + b, 0)
        }

        return context.json({
            message: "Success get orders",
            data: { ...stat }
        }, 200)
    }

    async Detail(context: Context) {

        const order = await database.query.ordersTable.findFirst({
            where: or(
                eq(ordersTable.userId, context.get("jwt").id),
                eq(ordersTable.id, context.req.param("id") as any)
            ),
            with: {
                detailOrder: true
            }
        })
        if (!order) throw new HTTPException(404, { message: "Order not found" })

        const findeDetailLapangan = await database.query.detailsLapanganTable.findFirst({
            where: eq(detailsLapanganTable.id, order.detailOrder?.detailsLapanganId as any)
        })
        if (!findeDetailLapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        return context.json(
            {
                message: "Succes get detail order",
                data: {
                    id: order.id,
                    statusPlay: order.playStatus,
                    statusOrder: order.orderStatus,
                    statusPembayaran: order.statusPembayaran,
                    tanggalBermain: order.detailOrder?.date as string,
                    price: findeDetailLapangan?.price as number,
                    lamaBermain: order.detailOrder?.jam.length,
                    jam: order.detailOrder?.jam,
                    total: order.detailOrder?.jam.length! * findeDetailLapangan?.price! as number,
                    tanggalOrder: order.createdAt.toLocaleString()
                }
            }
        )
    }

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

        const checkJamOrder = await database.query.detailOrderTable.findMany({
            where: eq(detailOrderTable.detailsLapanganId, context.req.param("id") as any),
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
        console.log(findLapangan, findOrder, findLapanganTersedia, findUser);

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

        return context.json({ message: "Success order", data: result })
    }

    async Checkout(context: Context) {

        const body = await context.req.json()
        const merge = { ...body, "detailLapanganId": parseInt(context.req.param("id")) }

        if (context.req.param("lapanganId").length < 36) {
            throw new HTTPException(400, { message: "Invalid id" })
        }

        const requestOrder = Validation.validate(OrderValidation.Checkout, merge)


        const checkJamOrder = await database.query.detailOrderTable.findMany({
            where: eq(detailOrderTable.detailsLapanganId, requestOrder.detailLapanganId),
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
        const compareJam = (array1: [], array2: []) => {
            return (
                array1.every((item1: Item) => (
                    array2.some((item2: Item) => item1.id == item2.id)
                ))
            )
        }


        let shouldBreak = false;
        checkJamOrder.forEach((item) => {
            console.log(compareJam(requestOrder.jam, item.jam as []), item.orders);

            if (compareJam(requestOrder.jam, item.jam as []) && item.orders.statusPembayaran) {
                throw new HTTPException(400, { message: "Jam sudah terbooking" })
                shouldBreak = true;
            }
            if (shouldBreak) {
                return; // This will stop the iteration of the loop
            }
        });


        const date = new Date(`09/${requestOrder.date}/2024`)


        const data = await database.transaction(async () => {

            // const {id, orderId, detailsLapanganId, ...omit} = getTableColumns(detailOrderTable)

            const result = await database.insert(ordersTable).values(
                {
                    userId: context.get("jwt").id,
                    lapanganId: context.req.param("lapanganId") as any,
                }
            ).returning()

            const detail = await database.insert(detailOrderTable).values({
                orderId: result[0].id,
                detailsLapanganId: requestOrder.detailLapanganId.toString(),
                date: date.toLocaleDateString(),
                jam: requestOrder.jam,
            }).returning()

            const lapangan = await database.query.detailsLapanganTable.findFirst({ where: eq(detailsLapanganTable.id, requestOrder.detailLapanganId) })
            const user = await database.query.userTable.findFirst({ where: eq(userTable.id, context.get("jwt").id) })

            return {
                order: result[0],
                detailOrder: detail[0],
                lapangan: lapangan,
                user: user
            }
        })

        return context.json({ message: "Success order", data: data })

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

        return context.json({ message: "Success update status pembayaran", data: order })

    }

    async UpdateOrderPlay(context: Context) {

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
            ),
            with: {
                detailOrder: true
            }
        })

        const date = new Date()
        const bookingDate = new Date(checkStatus?.detailOrder?.date as string + " " + checkStatus?.detailOrder?.jam[checkStatus?.detailOrder?.jam.length - 1] as string)

        const checkDate = date.getDate() <= bookingDate.getDate()
        const checkMonth = date.getMonth() + 1 <= bookingDate.getMonth() + 1
        const checkYear = date.getFullYear() <= bookingDate.getFullYear()
        const checkTime = date.getHours() < bookingDate.getHours()

        if (!(checkDate && checkMonth && checkYear && checkTime)) {
            throw new HTTPException(404, { message: "Tidak dapat mengikuti permainan, karena sudah lewat waktu" })
        }

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