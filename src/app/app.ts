import { privateRoute } from "@/routes/private.routes";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { ErrorMiddleware } from "@/middleware/Error";
import { HTTPException } from "hono/http-exception";
import { publicRoute } from "@/routes/public.routes";
import { serve } from "@hono/node-server";

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

serve({
    fetch: app.fetch,
    port
})