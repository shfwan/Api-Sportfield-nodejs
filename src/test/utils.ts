import { database } from "@/database/database"
import { detailsLapanganTable, lapanganTable, profileInfoTable, userTable } from "@/database/schema/schema"
import { ReadFileDirectory } from "@/libs/ReadFileDirectory"
import { eq } from "drizzle-orm"
import supertest from "supertest"

type User = {
    firstname: string
    lastname: string
    email: string
    password: string
    phoneNumber: string
}

type Lapangan = {
    name: string;
    picture: string;
    description: string;
    address: {
        alamat: string;
        longtitude: string;
        latitude: string;
    };
    open: string;
    close: string;
}

const user: User = {
    firstname: "Krispi",
    lastname: "kispi",
    email: "krispi@krispi.com",
    password: "krispi",
    phoneNumber: "0812345678",
}

const lapangan: Lapangan = {
    name: "Futsal Waiheru",
    picture: "",
    description: "",
    address: {
        alamat: "Tantui",
        latitude: "23asd23",
        longtitude: "234asd"
    },
    open: "09:00",
    close: "24:00"
}

export const registerUser = async () => {
    await database.transaction(async(values) => {
        const result = await database.insert(userTable).values({ 
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phoneNumber,
            password: await process.password.hash(user.password, { algorithm: 'bcrypt', cost: 4 }),
        }).returning()

        await database.insert(profileInfoTable).values({
            bio: "-",
            picture: ReadFileDirectory("./public/random"),
            userId: result[0].id
        })
    })
}

export const Login = async () => {
    return await supertest("http://localhost:2722").post("/api/v1/auth/login").send({email: user.email, password: user.password})
}

export const getUser = async () => {
    const result = await database.query.userTable.findFirst({where: eq(userTable.email, user.email)})
    return result
    
}

export const deleteUser = async () => {
    await database.delete(userTable).execute()
}

export const getProfil = async () => {
    return await database.query.userTable.findFirst({
        where: eq(userTable.email, user.email),
        with: {
            profileInfo: {
                columns: {
                    id: true
                }
            }
        }
    })
}

export const deleteProfil = async () => {
    await database.delete(profileInfoTable).execute()
}

export const createLapangan = async () => {
    const user = await getUser()
    return await database.insert(lapanganTable).values({
        name: lapangan.name,
        picture: lapangan.picture,
        description: lapangan.description,
        address: lapangan.address,
        open: lapangan.open,
        close: lapangan.close,
        userId:  user?.id as string
    } as any).returning()

}

export const getLapangan = async () => {
    const user = await getUser()
    return await database.query.lapanganTable.findFirst({
        where: eq(lapanganTable.userId, user?.id as string)
    })
}

export const deleteLapangan = async () => {
    return await database.delete(lapanganTable).returning().execute()
}

export const createDetailLapangan = async () => {
    const lapangan = await getLapangan()
    return await database.insert(detailsLapanganTable).values({
        name: "Lapangan 1",
        description: "Lapangan 1",
        statusLapangan: "Indoor",
        type: "Futsal",
        price: 100000,
        lapanganId: lapangan?.id as string
    } as any).returning()
}

export const getDetailLapangan = async () => {
    const lapangan = await getLapangan()

    return await database.query.detailsLapanganTable.findFirst({
        where: eq(detailsLapanganTable.lapanganId, lapangan?.id as string)
    })
}

export const deleteDetailLapangan = async () => {
    return await database.delete(detailsLapanganTable).returning().execute()
}

export const createManyJam = async () => {
    const jam = [
        {
            id: 1,
            open: "15:00",
            close: "16:00"
        },
        {
            id: 2,
            open: "16:00",
            close: "17:00"
        },
        {
            id: 3,
            open: "18:00",
            close: "19:00"
        },
    ]
    return await database.update(detailsLapanganTable).set({
        jam: jam
    }).execute()
}
