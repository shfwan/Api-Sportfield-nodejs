import type { MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"

export const Privilage: MiddlewareHandler = async (context, next) => {
    try {        
        const role = await context.get("jwt").role

        if (role != "administrator" && role != "provider") {
            throw "Permission denied"
        }

    } catch (error) {        
        throw new HTTPException(401, { message: error as string })
    }

    await next()
}