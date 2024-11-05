import { string, z, ZodType } from "zod";

export class OrderValidation {
    static readonly Checkout: ZodType = z.object({
        detailLapanganId: z.number().min(1),
        date: z.string(),
        jam: z.array(z.object(
            {
                id: z.number().min(1),
                open: z.string().min(1),
                close: z.string().min(1)
            }
        )).min(1)
    })
}