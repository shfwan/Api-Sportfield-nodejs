import { test, expect, describe, beforeEach, afterEach, afterAll } from "bun:test"
import supertest from "supertest"
import { deleteProfil, deleteUser, registerUser } from "./utils"

describe("Register", () => {
    afterAll(async() => {
        await deleteProfil()
        await deleteUser()
    })

    test("Should register successfully", async () => {
        const response = await supertest("http://localhost:2722").post("/api/v1/auth/register").send({
            fullname: "Krispi",
            email: "krispi@krispi.com",
            phone_number: "0812345678",
            password: "krispi12333",
            retype_password: "krispi12333",
        })

        console.log(response.body);
        
        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe("Success creating user")
        
    })

    test("Should reject empty request", async () => {
        const response = await supertest("http://localhost:2722").post("/api/v1/auth/register").send({
            fullname: "",
            email: "",
            phone_number: "",
            password: "",
            retype_password: "",
        })
        console.log(response.body);
        
        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBeDefined()
        
    })
})

describe("Login", () => {
    beforeEach( async() => {
        await registerUser()
    })
    
    afterEach( async() => {
        await deleteProfil()
        await deleteUser()
    })
    
    test("Should login successfully ", async () => {
        
        const response = await supertest("http://localhost:2722").post("/api/v1/auth/login").send({
            email: "krispi@krispi.com",
            password: "krispi",
        })


        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success login")
        expect(response.body.fullname).toBe("Krispi")
    
    })

    test("Should reject email not registered", async () => {

        const response = await supertest("http://localhost:2722").post("/api/v1/auth/login").send({
            email: "krispi@krispi.com",
            password: "krispi1",
        })


        expect(response.statusCode).toBe(409)
        expect(response.body.message).toBe("Email or password is incorrect")
    })

    test("Should reject incorrect password", async () => {

        const response = await supertest("http://localhost:2722").post("/api/v1/auth/login").send({
            email: "krispi@gamil.com",
            password: "krispi",
        })


        expect(response.statusCode).toBe(409)
        expect(response.body.message).toBe("Email not register")
    })

    test("Should reject empty request", async () => {
        const response = await supertest("http://localhost:2722").post("/api/v1/auth/login").send({
            email: "",
            password: "",
        })

        console.log(response.body);

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBeDefined()
    })
})