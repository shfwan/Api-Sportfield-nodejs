import { Context } from "hono";
import { database } from "../database/database";
import { notificationTable } from "../database/schema/schema";
import { eq } from "drizzle-orm";

class NotificationController {
    async getNotifcation(context: Context) {
        const date = new Date()
        const notification = await database.query.notificationTable.findMany({
            with: {
                user: {
                    columns: {
                        firstname: true,
                    }
                },
                lapangan: {
                    with: {
                        detailsLapangan: {
                            columns: {
                                name: true,

                            }
                        }
                    }
                }
            },
            
            // where: eq(notificationTable.createdAt)
            // where: eq(notificationTable.userId,  context.get("jwt").id)
        })

        console.log(notification[0].createdAt);
        

        return context.json({
            message: "Success get Notification",
            data: {
                count: notification.length,
                notifications: notification
            }
        }, 200)
    }

    // async pushNotification(context: Context) {
    //     const notification = await database.insert(notificationTable).values({
    //         userId: context.get("jwt").id,
    //         title: "",
    //         description: ""
    //     })
    // }
}

export default new NotificationController