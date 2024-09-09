import { test, expect, describe, beforeEach, afterEach, afterAll } from "bun:test"
import supertest from "supertest"
import { deleteProfil, deleteUser, Login, registerUser } from "./utils"

describe("Get", () => {
    beforeEach(async () => {
        await registerUser()
    })

    afterEach(async () => {
        await deleteProfil()
        await deleteUser()
    })

    test("Should get profile successfully", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").get("/api/v2/user/information").set({ authorization: `Bearer ${login.body.token}` })

        console.info(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success get profile")
        expect(response.body.profil.fullname).toBe("Krispi")
        expect(response.body.profil.email).toBe("krispi@krispi.com")
    })
})

describe("Update", () => {
    beforeEach(async () => {
        await registerUser()
    })

    afterEach(async () => {
        await deleteProfil()
        await deleteUser()
    })

    test("Should update successfully", async () => {
        const login = await Login()
        const response = await supertest("http://localhost:2722").patch("/api/v2/user/information").send({
            bio: "Lorem impus",
        }).set({ authorization: `Bearer ${login.body.token}` })

        console.info(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success update profile")
        expect(response.body.profil.bio).toBe("Lorem impus")

    })
})