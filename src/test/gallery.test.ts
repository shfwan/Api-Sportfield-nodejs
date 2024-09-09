import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import supertest from "supertest"
import { createDetailLapangan, createLapangan, createManyJam, deleteDetailLapangan, deleteLapangan, deleteProfil, deleteUser, getDetailLapangan, getLapangan, Login, registerUser } from "./utils"

describe("Upload", () => {
    beforeEach(async () => {
        // await registerUser()
        // await createLapangan()
        // await createDetailLapangan()
        await createManyJam()
    })

    // afterEach(async () => {
    //     await deleteDetailLapangan()
    //     await deleteLapangan()
    //     await deleteProfil()
    //     await deleteUser()
    // })

    test("Should upload picture successfully", async () => {
        // const login = await Login()
        // const lapangan = await getLapangan()
        // const detailLapangan = await getDetailLapangan()
        
        
        // const response = await supertest("http://localhost:2722").get(`/api/v1/lapangan/${lapangan?.id}/information?id=${detailLapangan?.id}`).set({
        //     authorization: `Bearer ${login.body.token}`
        // })

        // console.log(response.body)

        // expect(response.statusCode).toBe(200)
        // expect(response.body.message).toBe("Success get detail lapangan")
        // expect(response.body.lapangan.name).toBe("Lapangan 1")
        
        // const response = await supertest("http://localhost:2722").patch(`/api/v2/lapangan/${lapangan?.id}/gallery?id=${detailLapangan?.id}`).field("file",f).set({
        //     authorization: `Bearer ${login.body.token}`
        // })

        // console.log(response);

        // expect(response.statusCode).toBe(200)
        
    })
})