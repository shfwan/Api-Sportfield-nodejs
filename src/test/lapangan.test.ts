import { test, expect, describe, beforeEach, afterEach, afterAll } from "bun:test"  
import supertest from "supertest"
import { createLapangan, deleteLapangan, deleteProfil, deleteUser, getLapangan, Login, registerUser } from "./utils"

describe("Get Lapangan", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
    })

    afterEach(async () => {
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should get all lapangan", async () => {
        const response = await supertest("http://localhost:2722").get("/api/v1/lapangan")
        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success get lapangan")
    })
})

describe("Create Lapangan", () => {
    beforeEach(async () => {
        await registerUser()
    })

    afterEach(async () => {
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should create lapangan successfully", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").post("/api/v2/lapangan").send({
            name: "Futsal Tantui",
            picture: "",
            description: "",
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            },
            open: "09:00",
            close: "24:00"
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe("Success create lapangan")
        expect(response.body.lapangan.name).toBe("Futsal Tantui")

    })
    
    test("Should create lapangan failed", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").post("/api/v2/lapangan").send({
            name: "Futsal Tantui",
            picture: "",
            description: "",
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            },
            close: "24:00"
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBeDefined()
    })

    test("Should reject create unauthorized", async () => {
        const response = await supertest("http://localhost:2722").post("/api/v2/lapangan").send({
            name: "Futsal Tantui",
            picture: "",
            description: "",
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            },
            close: "24:00"
        })

        console.log(response.body);

        expect(response.statusCode).toBe(401)
        expect(response.body.message).toBe("Unauthorized")
    })
})

describe("Update Lapangan", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
    })

    afterEach(async () => {
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })

    test("Should update lapangan successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const response = await supertest("http://localhost:2722").patch(`/api/v2/lapangan/${lapangan?.id}`).send({
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            }
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success update lapangan")
        expect(response.body.lapangan.address.alamat).toBe("Aster")
    })

    test("Should reject invalid id", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").patch("/api/v2/lapangan/1").send({
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            }
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBe("Invalid id")
    })

    test("Should reject lapangan not found", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").patch("/api/v2/lapangan/11231222-2222-2222-2222-222222222222").send({
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            }
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(404)
        expect(response.body.message).toBe("Lapangan not found")
    })

    test("Should reject unauthorized", async () => {
        const response = await supertest("http://localhost:2722").patch("/api/v2/lapangan/11231222-2222-2222-2222-222222222222").send({
            address: {
                alamat: "Aster",
                latitude: "23asd23",
                longtitude: "234asd"
            }
        })

        console.log(response.body);

        expect(response.statusCode).toBe(401)
        expect(response.body.message).toBe("Unauthorized")
    })
})

describe("Delete Lapangan", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
    })

    afterEach(async () => {
        await deleteProfil()
        await deleteUser()
    })


    test("Should delete lapangan successfully", async () => {
        const login = await Login()
        const lapangan = await getLapangan()
        const response = await supertest("http://localhost:2722").delete(`/api/v2/lapangan/${lapangan?.id}`).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success delete lapangan")
    })
    
})

describe("Delete Lapangan", () => {
    beforeEach(async () => {
        await registerUser()
        await createLapangan()
    })

    afterEach(async () => {
        await deleteLapangan()
        await deleteProfil()
        await deleteUser()
    })


    test("Should reject invalid id", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").delete("/api/v2/lapangan/1").set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBe("Invalid id")
    })

    test("Should reject lapangan not found", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").delete("/api/v2/lapangan/11231222-2222-2222-2222-222222222222").set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(404)
        expect(response.body.message).toBe("Lapangan not found")
    })
})