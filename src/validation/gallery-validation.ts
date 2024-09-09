import { z, type ZodType } from "zod";

export class GalleryValidation {
    static readonly Create: ZodType = z.object({
        filename: z.string().min(1),
        mimeType: z.string().min(1)
    })
}