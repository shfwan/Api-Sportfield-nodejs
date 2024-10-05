import { Hono } from "hono";
import { Auth } from "../middleware/Auth";
import { Privilage } from "../middleware/Privilage";
import UserController from "../controllers/User-Controller";
import ProfilController from "../controllers/Profil-Controller";
import LapanganController from "../controllers/Lapangan-Controller";
import DetailLapanganController from "../controllers/DetailLapangan-Controller";
import JamController from "../controllers/Jam-Controller";
import GalleryController from "../controllers/Gallery-Controller";
import OrderController from "../controllers/Order-Controller";

export const privateRoute = new Hono()




//User
privateRoute.patch("/user", Auth, UserController.updateUser)
privateRoute.patch("/user/password", Auth, UserController.updatePassword)
privateRoute.delete("/user/delete", Auth, UserController.deleteUser)

//User Profile
privateRoute.get("/user/information", Auth, ProfilController.getProfil)
privateRoute.patch("/user/information", Auth, ProfilController.updateProfil)

//Lapangan
privateRoute.post("/lapangan", Auth, Privilage, LapanganController.createLapangan)
privateRoute.patch("/lapangan/:id", Auth, Privilage, LapanganController.updateLapangan)
privateRoute.delete("/lapangan/:id", Auth, Privilage, LapanganController.deleteLapangan)

//Detail Lapangan
privateRoute.post("/lapangan/:id", Auth, Privilage, DetailLapanganController.createDetailLapangan)
privateRoute.patch("/lapangan/:lapanganId/information/:id", Auth, Privilage, DetailLapanganController.updateDetailLapangan)
privateRoute.delete("/lapangan/:lapanganId/information/:id", Auth, Privilage, DetailLapanganController.deleteDetailLapangan)
privateRoute.delete("/lapangan/:id/information/reset", Auth, Privilage, DetailLapanganController.deleteAllDetailLapangan)

//Jam Lapangan
privateRoute.patch("/lapangan/:lapanganId/information/:id/jam", Auth, Privilage, JamController.createJam)
privateRoute.patch("/lapangan/:lapanganId/information/:id/jam/remove", Auth, Privilage, JamController.deleteJam)
privateRoute.patch("/lapangan/:lapanganId/information/:id/jam/reset", Auth, Privilage, JamController.ResetJam)

//Gallery Lapangan
privateRoute.post("/lapangan/:lapanganId/information/:id/gallery", Auth, Privilage, GalleryController.store)
privateRoute.delete("/lapangan/:lapanganId/information/:id/gallery/remove", Auth, Privilage, GalleryController.deleteGallery)

//User Order
privateRoute.get("/order", Auth, OrderController.List)
privateRoute.get("/order/:id", Auth, OrderController.Detail)
privateRoute.get("/order/:id/stat", Auth, OrderController.Stat)

privateRoute.post("/order/lapangan/:lapanganId/information/:id/checkout", Auth, OrderController.Checkout)
privateRoute.post("/order/lapangan/:lapanganId/information/:id/pembayaran", Auth, OrderController.Pembayaran)

privateRoute.patch("/order/lapangan/:lapanganId/information/:id/pembayaran", Auth, OrderController.UpdateStatusPembayaran)
privateRoute.patch("/order/lapangan/:lapanganId/information/:id/play", Auth, OrderController.UpdateOrderPlay)
privateRoute.patch("/order/lapangan/:lapanganId/information/:id/end", Auth, OrderController.UpdateOrderEnd)

privateRoute.delete("/order/:id", Auth, OrderController.DeleteOrder)
