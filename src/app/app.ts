import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ErrorMiddleware } from "../middleware/Error";
import { privateRoute } from "../routes/private.routes";
import { publicRoute } from "../routes/public.routes";
import { Server, Socket } from "socket.io";
import { serve } from '@hono/node-server'
import { Server as HttpServer } from "http"
import * as dotenv from 'dotenv'
dotenv.config()


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

const server = serve({
    port: 3001,
    fetch: app.fetch
}, (info) => {
    console.log(`Server is running on port ${info.port}`)
})

const io = new Server(server as HttpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],

    },
})

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data)
    })
})

app.route("/v2", privateRoute)
app.route("/v1", publicRoute)

app.onError(ErrorMiddleware)

app.notFound(() => {
    throw new HTTPException(404, { message: "Not found" })
})

export default server