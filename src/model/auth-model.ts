
export type CreateUserRequest = {
    fullname: string;
    email: string;
    phone_number: string;
    password: string;
    retype_password: string;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type Payload = {
    id: string;
    role: string
}

export type loginToken = {
    id: string;
    role: string;
    token: string;
    refreshToken: string;
}

export type Token = {
    [key: string] : any
    iat: number;
    exp: number;
}

export type RefreshToken = {
    refreshToken: string
}