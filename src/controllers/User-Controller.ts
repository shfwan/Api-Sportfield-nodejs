import { eq, getTableColumns } from "drizzle-orm"
import { Validation } from "../validation/validation"
import { UserValidation } from "../validation/user-validation"
import { database } from "../database/database"
import { profileInfoTable, userTable } from "../database/schema/schema"
import type { UpdatePassword, UpdateUser } from "../model/user-model"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

class UserController {

    async updateUser(context: Context) {

        const updateRequest: UpdateUser = Validation.validate(UserValidation.Update, await context.req.json())
        const { password, role, createdAt, ...omitUser } = getTableColumns(userTable)
        const user = await database.update((userTable)).set(updateRequest).where(eq(userTable.id, context.get("jwt").id)).returning(omitUser)

        return context.json({ message: "Success update user", user: user[0] }, 200)
    }

    async updatePassword(context: Context) {

        const updateRequest: UpdatePassword = Validation.validate(UserValidation.UpadatePassword, await context.req.json())

        if (updateRequest.password !== updateRequest.confirmPassword) throw new HTTPException(400, { message: "Password not match" })

        const passwordHash: string = await process.password.hash(updateRequest.password, { algorithm: 'bcrypt', cost: 4 })

        await database.update(userTable).set({
            password: passwordHash,
        }).where(eq(userTable.id, context.get("jwt").id)).returning()

        return context.json({ message: "Success update password" }, 200)
    }

    async deleteUser(context: Context) {
        const result = await database.transaction(async () => {
            await database.delete(profileInfoTable).where(eq(profileInfoTable.userId, context.get("jwt").id)).returning()
        
            const { password, role, createdAt, ...omitUser } = getTableColumns(userTable)

            return await database.delete(userTable).where(eq(userTable.id, context.get("jwt").id)).returning(omitUser)
        })

        return context.json({ message: "Success delete user", data: result }, 200)
    }
}

export default new UserController