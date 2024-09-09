import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import supertest from "supertest"
import { createDetailLapangan, createLapangan, deleteDetailLapangan, deleteLapangan, deleteProfil, deleteUser, getDetailLapangan, getLapangan, Login, registerUser } from "./utils"

describe("Get Detail Lapangan", () => {
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

    test("Should get detail lapangan successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const detailLapangan = await getDetailLapangan()

        const response = await supertest("http://localhost:2722").get(`/api/v1/lapangan/${lapangan?.id}/information?id=${detailLapangan?.id}`).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success get detail lapangan")
        expect(response.body.lapangan.name).toBe("Lapangan 1")
    })
})

describe("Create", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
    })

    afterEach(async () => {
        await deleteDetailLapangan()
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should create detail lapangan successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()

        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/${lapangan?.id}/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "Futsal",
            price: 100000,
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe("Success create detail lapangan")
        expect(response.body.data.name).toBe("Lapangan 1")
        expect(response.body.data.description).toBe("Lapangan 1")
        expect(response.body.data.statusLapangan).toBe("Indoor")
        expect(response.body.data.type).toBe("Futsal")
        expect(response.body.data.price).toBe(100000)
    })

    test("Should not create detail lapangan with invalid id", async () => {
        const login = await Login()

        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/123/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "Futsal",
            price: 100000,
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBe("Invalid id")
    })

    test("Should not create detail lapangan with invalid token", async () => {
        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/123/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "Futsal",
            price: 100000,
        }).set({
            authorization: `Bearer invalid`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(500)
        expect(response.body.error).toBe("Invalid access token")
    })

    test("Should not create detail lapangan with invalid data", async () => {
        const login = await Login()
        const lapangan = await getLapangan()

        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/${lapangan?.id}/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "",
            price: 1000,
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBeDefined()
    })

    test("Should not create detail lapangan with invalid price", async () => {
        const login = await Login()
        const lapangan = await getLapangan()

        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/${lapangan?.id}/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "Futsal",
            price: "asd",
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBeDefined()
    })

    test("Should reject unauthorized", async () => {
        const response = await supertest("http://localhost:2722").post(`/api/v2/lapangan/123/information`).send({
            name: "Lapangan 1",
            description: "Lapangan 1",
            statusLapangan: "Indoor",
            type: "Futsal",
            price: 100000,
        })

        console.log(response.body)

        expect(response.statusCode).toBe(401)
        expect(response.body.message).toBe("Unauthorized")
    })
})

describe("Update", () => {
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

    test("Should update detail lapangan successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()      
        const detailLapangan = await getDetailLapangan()

        const response = await supertest("http://localhost:2722").patch(`/api/v2/lapangan/${lapangan?.id}/information?id=${detailLapangan?.id}`).send({
            name: "Lapangan 2",
            statusLapangan: "Outdoor",
            price: 200000,
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.data.name).toBe("Lapangan 2")
        expect(response.body.data.statusLapangan).toBe("Outdoor")
        expect(response.body.data.price).toBe(200000)
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

    test("Should delete successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const detailLapangan = await getDetailLapangan()

        const response = await supertest("http://localhost:2722").delete(`/api/v2/lapangan/${lapangan?.id}/information?id=${detailLapangan?.id}`).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success remove lapangan")
    })
})