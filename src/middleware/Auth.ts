import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";

export const Auth: MiddlewareHandler = async (context, next) => {
    if(!context.req.header("Authorization")) throw new HTTPException(401, {message: "Unauthorized"})
    
        
    const token = context.req.header("Authorization")?.split(" ")[1]
    let error: jwt.VerifyErrors | null = null;
    let verify: any = null;

    try {
        verify = jwt.verify(token!, process.env.TOKEN_SECRET!);
    } catch (err) {
        error = err as jwt.VerifyErrors;
    }
    
    if (error) {
        const errorJwt = ['invalid signature', 'jwt malformed', 'jwt must provided', 'invalid token'];

        if (errorJwt.includes(error.message)) {
            return context.json({ error: "Invalid access token" }, 500);
        } else if (error.message === "jwt expired") {
            return context.json({ error: "Access token expired" }, 401);
        }
    }

    context.set("jwt", verify);
    await next()
}