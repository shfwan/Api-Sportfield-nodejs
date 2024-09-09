import AuthController from "../controllers/Auth-Controller";
import DetailLapanganController from "../controllers/DetailLapangan-Controller";
import GalleryController from "../controllers/Gallery-Controller";
import JamController from "../controllers/Jam-Controller";
import LapanganController from "../controllers/Lapangan-Controller";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

export const publicRoute = new Hono()

//Auth
publicRoute.post("/auth/login", AuthController.login)
publicRoute.post("/auth/register", AuthController.register)
publicRoute.post("/auth/refreshToken", AuthController.refreshToken)
publicRoute.get("/user/picture/*", serveStatic({root:"./", rewriteRequestPath: (path) => path.replace("/api/v1/user/picture/", "./public/images/upload/")}))


//Lapangan
publicRoute.get("/lapangan", LapanganController.getLapangan)
publicRoute.get("/lapangan/:id", LapanganController.getLapanganById)
publicRoute.get("/lapangan/list", DetailLapanganController.getListDetailLapangan)

//Detail lapangan
publicRoute.get("/lapangan/:id/list", DetailLapanganController.getListDetailLapangan)
publicRoute.get("/lapangan/:id/information", DetailLapanganController.getDetailLapangan)

//Gallery
publicRoute.get("/lapangan/:lapanganId/information/:id/gallery", GalleryController.list)
publicRoute.get("/lapangan/picture/*", serveStatic({root:"./", rewriteRequestPath: (path) => path.replace("/api/v1/lapangan/picture/", "./public/images/upload/")}))


//Jam
publicRoute.get("/lapangan/:lapanganId/information/:id/jam", JamController.getJam)
