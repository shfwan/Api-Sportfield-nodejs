import { z, ZodType } from "zod";

export class AuthValidation {

    static readonly Register: ZodType = z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        email: z.string().email().min(1),
        phone: z.string().min(1).max(15),
        password: z.string().min(8, "Password length must 8 character"),
        confirmPassword: z.string().min(1, "Password length must 8 character"),
        role: z.string().default("customer")
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Password not match",
        path: ["confirmPassword"]
    })

    static readonly Login: ZodType = z.object({
        user: z.string().min(1).max(100),
        password: z.string().min(8, "Password length must 8 character").max(100)
    })

    static readonly RefreshToken: ZodType = z.object({
        refreshToken: z.string()
    })
}