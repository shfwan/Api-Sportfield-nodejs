import { like } from "drizzle-orm";
import { object, z, type ZodType } from "zod";

export class LapanganValidation {

    static readonly Create: ZodType = z.object({
        name: z.string().min(1),
        picture:z.any().optional(),
        description: z.string().optional(),
        alamat: z.string().min(1),
        mapUrl: z.string().optional(),
        open: z.string().min(1),
        close: z.string().min(1),
    })

    static readonly Update: ZodType = z.object({
        name: z.string().optional(),
        picture: z.string().optional(),
        description: z.string().optional(),
        alamat: z.string().optional(),
        mapUrl: z.string().optional(),
        open: z.string().optional(),
        close: z.string().optional(),
    })
}

export class DetailsLapanganValidation {
    static readonly Create: ZodType = z.object({
        name: z.string().min(1),
        picture:z.any().optional(),
        description: z.string().optional(),
        statusLapangan: z.string().min(1),
        type: z.string().min(1),
        price: z.number().min(10000),
        open: z.string().min(1),
        close: z.string().min(1),
    })

    static readonly Update: ZodType = z.object({
        name: z.string().optional(),
        picture:z.any().optional(),
        description: z.string().optional(),
        statusLapangan: z.string().optional(),
        type: z.string().optional(),
        price: z.number().min(10000),
        open: z.string().min(1).optional(),
        close: z.string().min(1).optional()
    })
}