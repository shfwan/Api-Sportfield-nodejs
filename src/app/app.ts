import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ErrorMiddleware } from "../middleware/Error";
import { privateRoute } from "../routes/private.routes";
import { publicRoute } from "../routes/public.routes";

const app = new Hono().basePath("/api")

app.use('*', logger())
app.use('*', cors({
    origin: "*",
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PATCH', 'DELETE'],
    exposeHeaders: ['Content-Length', 'X-Custom-Header'],
    maxAge: 600,
    credentials: true,

}))


app.route("/v2", privateRoute)
app.route("/v1", publicRoute)

app.onError(ErrorMiddleware)

app.notFound(() => {
    throw new HTTPException(404, { message: "Not found" })
})

const port = 3000

export default app