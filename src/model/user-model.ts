import { string } from "zod";

export interface UpdateUser {
    fullname: string,
    email: string,
    phone_number: string
}

export interface UpdatePassword {
    password: string,
    retype_password: string
}
