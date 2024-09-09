import { test, expect, describe, beforeEach, afterEach, afterAll } from "bun:test"
import supertest from "supertest"
import { createDetailLapangan, createLapangan, registerUser } from "./utils"

describe("Create data",() => {

    test("Should create data successfully", async () => {
        await registerUser()
        // await createLapangan()
        // await createDetailLapangan()
    })
})