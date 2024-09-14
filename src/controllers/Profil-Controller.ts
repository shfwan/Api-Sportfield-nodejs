import { database } from "../database/database"
import { profileInfoTable } from "../database/schema/schema"
import { eq, getTableColumns } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

class ProfilController {
    async getProfil(context: Context) {

        const user = await database.query.profileInfoTable.findFirst({
            where: eq(profileInfoTable.userId, await context.get("jwt").id),
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
        console.log(updateRequest);
        

        // Upload File Image
        const data = await context.req.parseBody()
        console.log(data);
        
        const file = data['file'] as File

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
    
            try {
                // process.write(`./public/images/upload/${newFile.name}`, Buffer.from(buffer))
            } catch (error) {
                throw new HTTPException(500, { message: "Failed upload" })
            }
    
            updateRequest.picture = newFile.name
        }
        const {id, userId, ...omitProfile} = getTableColumns(profileInfoTable)
        const user = await database
                    .update((profileInfoTable))
                    .set(updateRequest)
                    .where(
                        eq(profileInfoTable.userId, context.get("jwt").id)
                    ).returning(omitProfile)
        return context.json({ message: "Success update profile", data: user[0] }, 200)
    }
}

export default new ProfilController