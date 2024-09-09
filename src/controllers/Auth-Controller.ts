import { database } from "../database/database";
import { profileInfoTable, userTable } from "../database/schema/schema";
import { ReadFileDirectory } from "../libs/ReadFileDirectory";
import type { RefreshToken, Token } from "../model/auth-model";
import type { Payload } from "../model/auth-model";
import { AuthValidation } from "../validation/auth-validation"
import { Validation } from "../validation/validation";
import { eq, getTableColumns, ilike, or } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as jwt from "jsonwebtoken"
import * as bcrypt from "bcrypt"

const generateToken = (payload: Payload) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET as string, { expiresIn: "30m" })
}

const generateRefreshToken = (payload: Payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION as string })
}

class AuthController {
    async register(context: Context) {
        const registerRequest = Validation.validate(AuthValidation.Register, await context.req.json())

        const checkUserExists = await database.query.userTable.findFirst({ where: eq(userTable.email, registerRequest.email) })

        if (checkUserExists !== undefined) {
            throw new HTTPException(409, { message: "User already exists" })
        }

        if (registerRequest.password !== registerRequest.confirmPassword) throw new HTTPException(400, { message: "Password not match" })
        const passwordHash: string = await bcrypt.hash(registerRequest.password, 10)

        const { role, ...omitRole } = getTableColumns(userTable)
        const randomImage = ReadFileDirectory("./public/images/upload")

        const user = await database.transaction(async (database) => {
            const result = await database.insert(userTable).values({
                firstname: registerRequest.firstname,
                lastname: registerRequest.lastname,
                email: registerRequest.email,
                phone: registerRequest.phone,
                password: passwordHash,
            }).returning(omitRole)

            await database.insert(profileInfoTable).values({
                bio: "-",
                picture: randomImage,
                userId: result[0].id
            })

            return result
        })
        if (!user) throw new HTTPException(500, { message: "Failed to create user" })

        return context.json({ message: "Success creating user", data: user[0] }, 201)
    }

    async login(context: Context) {

        const loginRequest = Validation.validate(AuthValidation.Login, await context.req.json())

        const checkUserExists = await database.query.userTable.findFirst(
            { 
                where: or(
                    ilike(userTable.email, loginRequest.user),
                    eq(userTable.phone, loginRequest.user)
                ),
                with: {
                    profileInfo: {
                        columns: {
                            picture: true
                        }
                    }
                }
            }
        )
        if (!checkUserExists) {
            throw new HTTPException(409, { message: "User not register" })
        }

        const matchPassword = await bcrypt.compare(loginRequest.password, checkUserExists.password)

        if (!matchPassword) {
            throw new HTTPException(409, { message: "User or password is incorrect" })
        }

        const payload = {
            id: checkUserExists.id,
            role: checkUserExists.role
        }
        const token = await generateToken(payload)
        const refreshToken = await generateRefreshToken(payload)

        return context.json(
            {
                message: "Success login",
                data: {
                    fullname: checkUserExists.firstname + " " + checkUserExists.lastname,
                    picture: checkUserExists.profileInfo?.picture,
                    token: token,
                    refreshToken: refreshToken,
                }
            }, 200)
    }

    async refreshToken(context: Context) {

        const refreshTokenRequest = Validation.validate(AuthValidation.RefreshToken, await context.req.json())

        const decodedToken: Token | any = await jwt.verify(refreshTokenRequest.refreshToken, process.env.REFRESH_TOKEN_SECRET as string)

        if (!decodedToken) {
            throw new HTTPException(401, { message: "Invalid refresh token" })
        }
        const payload: Payload = {
            id: decodedToken.id,
            role: decodedToken.role
        }

        const token = await generateToken(payload)
        const refreshToken = await generateRefreshToken(payload)

        return context.json(
            {
                message: "Success refresh token",
                token,
                refreshToken
            }, 200)
    }
}


export default new AuthController