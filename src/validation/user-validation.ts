import { z, ZodType } from "zod";

export class UserValidation {
    static readonly Update: ZodType = z.object({
        firstname: z.string().or(z.literal('')).optional(),
        lastname: z.string().or(z.literal('')).optional(),
        email: z.string().email().or(z.literal('')).optional(),
        phone: z.string().or(z.literal('')).optional()
    })

    static readonly UpadatePassword: ZodType = z.object({
        password: z.string().min(8, "Password length must 8 character").max(100),
        confirmPassword: z.string().min(8, "Password length must 8 character").max(100)
    })
}