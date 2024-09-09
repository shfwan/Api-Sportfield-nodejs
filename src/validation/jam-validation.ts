import { z, ZodType } from "zod";

export class JamValidation {
    static readonly Create: ZodType = z.object({
        jam: z.array(z.object({
            open: z.string().min(1),
            close: z.string().min(1)
        })).min(1)
    })
}