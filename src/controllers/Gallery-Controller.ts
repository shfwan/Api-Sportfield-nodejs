import type { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { database } from "../database/database";
import { detailsLapanganTable, galleryTable } from "../database/schema/schema";
import { HTTPException } from "hono/http-exception";
import * as fs from "fs"

class GalleryController {

    async list(context: Context) {

        const gallery = await database.query.galleryTable.findMany({
            where: eq(galleryTable.lapanganId, context.req.param("lapanganId") as any)
             
        })

        type Gallery = {
            id: number;
            filename: string;
            date: string;
        }
        const data: Gallery[] = []
        gallery?.map((values) => {
            data.push({
                id: values.id,
                filename: values.filename,
                date: values.createdAt.toLocaleString()
            })
        })

        return context.json({ message: "Success get gallery", data: data }, 200)

    }
    async store(context: Context) {

        const lapangan = await database.query.detailsLapanganTable.findFirst({
            where: and(
                eq(detailsLapanganTable.lapanganId, context.req.param("lapanganId") as any),
                eq(detailsLapanganTable.id, context.req.param("id") as any)
            ),
        })
        if (!lapangan) throw new HTTPException(404, { message: "Lapangan not found" })

        // Upload File Image
        const data = await context.req.parseBody()
        const file = data['file'] as File
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
            // Bun.write(`./public/images/upload/${newFile.name}`, Buffer.from(buffer))
        } catch (error) {
            throw new HTTPException(500, { message: "Failed upload" })
        }

        const upload = await database.insert(galleryTable).values(
            {
                filename: newFile.name,
                mimeType: file.type,
                lapanganId: context.req.param("lapanganId"),
                detailsLapanganId: parseInt(context.req.param("id"))
            }
        ).returning()

        return context.json({ message: "Success add gallery", data: upload[0] }, 201)
    }

    async deleteGallery(context: Context) {
        const findPicture = await database.query.galleryTable.findFirst({
            where: and(
                eq(galleryTable.id, context.req.query("id") as any),
                eq(galleryTable.detailsLapanganId, context.req.param("id") as any),
                eq(galleryTable.lapanganId, context.req.param("lapanganId") as any)
            )
        })
        if (!findPicture) throw new HTTPException(404, { message: "Picture not found" })

        try {
            fs.unlinkSync(`./public/images/upload/${findPicture?.filename}`)
        } catch (error) {
            throw new HTTPException(500, { message: "Failed remove gallery" })
        }

        const deletePicture = await database.delete(galleryTable).where(and(
            eq(galleryTable.id, context.req.query("id") as any),
            eq(galleryTable.detailsLapanganId, context.req.param("id") as any),
            eq(galleryTable.lapanganId, context.req.param("lapanganId") as any)
        )).returning()

        return context.json({ message: "Success remove gallery", data: deletePicture[0] }, 200)
    }
}

export default new GalleryController