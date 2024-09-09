import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import supertest from "supertest"
import { createDetailLapangan, createLapangan, createManyJam, deleteDetailLapangan, deleteLapangan, deleteProfil, deleteUser, getDetailLapangan, getLapangan, Login, registerUser } from "./utils"


describe("Get Jam", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
        await createDetailLapangan()
        await createManyJam()

    })

    afterEach(async () => {
        await deleteDetailLapangan()
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should get jam successfully", async () => {
        const lapangan = await getLapangan()
        const detailLapangan = await getDetailLapangan()

        console.log(detailLapangan?.id);
        
        const response = await supertest("http://localhost:2722").get(`/api/v1/lapangan/${lapangan?.id}/information/${detailLapangan?.id}/jam?day=04&month=06&year=2024`)

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success get jam")   
    })
})

describe("Create", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
        await createDetailLapangan()
    })

    afterEach(async () => {
        await deleteDetailLapangan()
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should create jam successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const detailLapangan = await getDetailLapangan()
        console.log(lapangan?.id, detailLapangan?.id);
        

        const response = await supertest("http://localhost:2722").patch(`/api/v2/lapangan/${lapangan?.id}/jam?id=${detailLapangan?.id}`).send({
            open: "09:00",
            close: "10:00"
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe("Success add jam")
        
    })
})

describe("Delete", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
        await createDetailLapangan()
    })

    afterEach(async () => {
        await deleteDetailLapangan()
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should delete jam successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const detailLapangan = await getDetailLapangan()

        const response = await supertest("http://localhost:2722").patch(`/api/v2/lapangan/${lapangan?.id}/jam/remove?id=${detailLapangan?.id}&jam${1}`).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success remove jam")
        
        
    })
})