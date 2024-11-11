import { database } from "../database/database";
import { detailOrderTable, detailsLapanganTable, lapanganTable, notificationTable, ordersTable, userTable } from "../database/schema/schema";
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

        const skip: number = ((page < 1 ? 1 : page) - 1) * (limit || 10)
        const date = new Date()
        date.setDate(date.getDate() + 1)

        const orders = await database.query.ordersTable.findMany({
            where: and(
                context.req.query("id") != undefined ? eq(ordersTable.lapanganId, context.req.query("id") as any) : eq(ordersTable.userId, context.get("jwt").id),
                context.get("jwt").role === "provider" ? eq(ordersTable.date, date.toJSON().split("T")[0]) : true as any,

                statusOrder.order != null ? and(
                    eq(ordersTable.playStatus, statusOrder.play),
                    eq(ordersTable.orderStatus, statusOrder.order),
                    eq(ordersTable.statusPembayaran, statusOrder.bayar),
                ) : role === "provider" ? and(
                    eq(ordersTable.statusPembayaran, true),
                ) : isNotNull(ordersTable.orderStatus),

            ),

            offset: skip,
            limit: limit || 10,
            with: {
                detailOrder: true
            }
        })



        if (!orders) throw new HTTPException(404, { message: "Orders not found" })



        const totalItem = (await database.query.ordersTable.findMany()).length
        const prevPage: boolean = skip > 1 ? true : false
        const nextPage: boolean = (page * limit) < totalItem

        if (role === "provider") {

            return context.json({
                message: "Success get orders",
                data: {
                    count: totalItem,
                    page: +page || 1,
                    totalPage: Math.ceil(totalItem / (limit || 10)) || 0,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    order: orders,
                }
            }, 200)

        } else if (role === "customer") {
            return context.json({
                message: "Success get orders",
                data: {
                    count: totalItem,
                    page: +page || 1,
                    totalPage: Math.ceil(totalItem / (limit || 10)) || 0,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    order: orders,
                }
            }, 200)
        }

    }

    async Stat(context: Context) {
        const date = new Date()
        date.setDate(date.getDate() + 1)

        const orders = await database.query.ordersTable.findMany({
            where: and(
                eq(ordersTable.lapanganId, context.req.param("id")),
                eq(ordersTable.statusPembayaran, true),
                eq(ordersTable.date, date.toJSON().split("T")[0])

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

    async History(context: Context) {

        let status = context.req.query("status")
        const role = context.get("jwt").role

        let statusOrder = {
            play: false,
            order: true,
            bayar: false
        }

        if (status === "Dibatalkan") {
            statusOrder.play = false
            statusOrder.order = false
            statusOrder.bayar = false
        } else if (status === "Selesai") {
            statusOrder.play = false
            statusOrder.order = false
            statusOrder.bayar = true
        } else {
            statusOrder.play = false as any
            statusOrder.order = false as any
            statusOrder.bayar = null as any

        }


        type Query = {
            page: number,
            limit: number
        }

        const { page, limit }: Query | any = context.req.query()


        const skip: number = ((page < 1 ? 1 : page) - 1) * (limit || 5)

        const orderHistory = await database.query.ordersTable.findMany({
            where: and(
                eq(ordersTable.lapanganId, context.req.param("id") as any),
                statusOrder.bayar != null ? and(
                    eq(ordersTable.playStatus, statusOrder.play),
                    eq(ordersTable.orderStatus, statusOrder.order),
                    eq(ordersTable.statusPembayaran, statusOrder.bayar),
                ) : and(
                    eq(ordersTable.playStatus, false),
                    eq(ordersTable.orderStatus, false),
                    isNotNull(ordersTable.statusPembayaran)
                ),

            ),
            with: {
                detailOrder: true
            },
            offset: skip,
            limit: limit || 10,
        })

        const totalItem = await database.query.ordersTable.findMany({
            where: and(
                eq(ordersTable.lapanganId, context.req.param("id") as any),
                and(
                    eq(ordersTable.playStatus, false),
                    eq(ordersTable.orderStatus, false),
                    or(
                        eq(ordersTable.statusPembayaran, false),
                        eq(ordersTable.statusPembayaran, true)
                    )
                ),
            ),
        })

        const prevPage: boolean = skip > 1 ? true : false
        const nextPage: boolean = (page * limit) < totalItem.length


        return context.json({
            message: "Success get history orders",
            data: {
                count: totalItem.length,
                page: +page || 1,
                totalPage: Math.ceil(totalItem.length / (limit || 10)) || 0,
                prevPage: prevPage,
                nextPage: nextPage,
                order: orderHistory,
            }
        }, 200)

    }

    async Detail(context: Context) {

        const order = await database.query.ordersTable.findFirst({
            where: and(
                // eq(ordersTable.userId, await context.get("jwt").id),
                eq(ordersTable.id, await context.req.param("id") as any)
            ),
            with: {
                detailOrder: true
            }
        })
        if (!order) throw new HTTPException(404, { message: "Order not found" })

        const findDetailLapangan = await database.query.detailsLapanganTable.findFirst({
            where: eq(detailsLapanganTable.id, order.detailOrder?.detailsLapanganId as any)
        })
        if (!findDetailLapangan) throw new HTTPException(404, { message: "Lapangan not found" })


        return context.json(
            {
                message: "Succes get detail order",
                data: {
                    id: order.id,
                    statusPlay: order.playStatus,
                    statusOrder: order.orderStatus,
                    statusPembayaran: order.statusPembayaran,
                    tanggalBermain: order.detailOrder?.date as string,
                    price: findDetailLapangan?.price as number,
                    lamaBermain: order.detailOrder?.jam.length,
                    jam: order.detailOrder?.jam,
                    total: order.detailOrder?.jam.length! * findDetailLapangan?.price! as number,
                    tanggalOrder: order.createdAt.toLocaleString()
                }
            }
        )
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
        
        if(order) {
            await database.insert(notificationTable).values({
                title: "info",
                userId: await context.get("jwt").id,
                lapanganId: await context.req.param("lapanganId"),
                description: ""
            })
        }

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

        // if (!(checkDate && checkMonth && checkYear && checkTime)) {
        //     throw new HTTPException(404, { message: "Tidak dapat mengikuti permainan, karena sudah lewat waktu" })
        // }

        // if (checkStatus?.playStatus == true && checkStatus?.orderStatus == false) {
        //     throw new HTTPException(404, { message: "Game already played" })
        // } else if (checkStatus?.playStatus == false && checkStatus?.orderStatus == false) {
        //     throw new HTTPException(404, { message: "Game over" })
        // }


        const order = await database.update(ordersTable).set({
            orderStatus: false,
            playStatus: true
        }).where(
            eq(ordersTable.id, context.req.query("id") as any)
        ).returning()


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

    async UpdateOrderCancel(context: Context) {
        const findOrder = await database.query.ordersTable.findFirst({
            where: and(
                eq(ordersTable.id, await context.req.param("id")),
                eq(ordersTable.lapanganId, await context.req.param("lapanganId"))
            )
        })

        if (!findOrder) throw new HTTPException(404, { message: "Order not found" })

        const order = await database.update(ordersTable).set({
            playStatus: false,
            orderStatus: false,
            statusPembayaran: false,
        }).where(
            and(
                eq(ordersTable.id, await context.req.param("id")),
                eq(ordersTable.lapanganId, await context.req.param("lapanganId"))
            )
        )
        if (!order) throw new HTTPException(500, { message: "Failed to cancel" })

        return context.json({ message: "Success cancel order", data: order })

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