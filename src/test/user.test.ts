import { test, expect, describe, beforeEach, afterEach, afterAll } from "bun:test"
import supertest from "supertest"
import { deleteProfil, deleteUser, Login, registerUser } from "./utils"

describe("Update", () => {
    beforeEach( async() => {
        await registerUser()
    })
    
    afterEach( async() => {
        await deleteProfil()
        await deleteUser()
    })
    
    test("Should update user successfully ", async () => {
        const login = await Login()        
        
        const response = await supertest("http://localhost:2722").patch("/api/v2/user").send({
            fullname: "Shafwan",
            email: "krispi@gmail.com",
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success update user")
        expect(response.body.user.fullname).toBe("Shafwan")
        expect(response.body.user.email).toBe("krispi@gmail.com")
        
    })

    test("Should reject unauthorized user", async () => {
        const response = await supertest("http://localhost:2722").patch("/api/v2/user").send({
            fullname: "Shafwan",
            email: "krispi@gmail.com",
        })

        console.log(response.body);

        expect(response.statusCode).toBe(401)
        expect(response.body.message).toBe("Unauthorized")  
        
    })
})

describe("Update Password", () => {
    beforeEach( async() => {
        await registerUser()
    })
    
    afterEach( async() => {
        await deleteProfil()
        await deleteUser()
    })
    
    test("Should update password successfully ", async () => {
        const login = await Login()

        const response = await supertest("http://localhost:2722").patch("/api/v2/user/password").send({
            password: "krispi123",
            retype_password: "krispi123"
        }).set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body);
        
        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success update password")
    })
})

describe("Delete", () => {
    beforeEach( async() => {
        await registerUser()
    })
    
    afterEach( async() => {
        await deleteProfil()
        await deleteUser()
    })
    
    test("Should delete user successfully ", async () => {
        const login = await Login()

        const response = await supertest("http://localhost:2722").delete("/api/v2/user/delete").set({
            authorization: `Bearer ${login.body.token}`
        })

        console.log(response.body)

        expect(response.statusCode).toBe(200)
        expect(response.body.message).toBe("Success delete user")
    })
})