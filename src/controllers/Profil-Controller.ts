import { database } from "../database/database"
import { profileInfoTable, userTable } from "../database/schema/schema"
import { eq, getTableColumns, or } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import * as fs from "fs"

class ProfilController {
    async getProfil(context: Context) {

        const user = await database.query.profileInfoTable.findFirst({
            where: context.req.query("id") !== undefined ? eq(profileInfoTable.userId, await context.req.query("id") as any) : eq(profileInfoTable.userId, await context.get("jwt").id),
            with: {
                user: {
                    columns: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        })

        if (!user) throw new HTTPException(404, { message: "User not found" })

        const profil = {
            fullname: user.user.firstname + " " + user.user.lastname,
            email: user.user.email,
            phone: user.user.phone,
            bio: user.bio,
            picture: user.picture
        }

        return context.json({ message: "Success get profile", data: profil }, 200)
    }

    async updateProfil(context: Context) {
        const updateRequest = await context.req.parseBody()


        // Upload File Image
        const data = await context.req.parseBody()

        const file = data['file'] as File

        if (file) {
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


            fs.writeFile(`./public/images/upload/${newFile.name}`, Buffer.from(buffer), (err) => {
                if (err) {
                    throw new HTTPException(500, { message: "Failed upload" })
                }
            })

            updateRequest.picture = newFile.name
        }
        console.log(await context.get("jwt").id);

        const { id, userId, ...omitProfile } = getTableColumns(profileInfoTable)
        // const user = await database
        //     .update((profileInfoTable))
        //     .set(updateRequest)
        //     .where(
        //         eq(profileInfoTable.userId, context.get("jwt").id)
        //     ).returning(omitProfile)

        // const user = await database.transaction(async () => {
        // })
        const userUpdate = await database.update(userTable).set(updateRequest).where(eq(userTable.id, await context.get("jwt").id)).returning()

        if (!userUpdate) throw new HTTPException(500, { message: "Failed update" })
            
        return context.json({ message: "Success update profile" }, 200)
    }
}

export default new ProfilController