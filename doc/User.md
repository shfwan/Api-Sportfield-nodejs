# User API Spec

## Update User

Endpoint : PATCH /api/v2/user

Header :

- Authorization : Bearer Token

Request Body :

```json
{
  "email": "shafwan372@gmail.com"
}
```

Response Body (Success 200) :

```json
{
  "message": "Success update user",
  "user": {
    "id": "38c936ee-af7e-4340-9f88-c7788409b3a1",
    "firstname": "Mingkii",
    "lastname": "Nurlette",
    "email": "shafwan372@gmail.com",
    "phone": "081218987161",
  }
}
```

## Update Password

Endpoint : PATCH /api/v2/user/password

Header :

- Authorization : Bearer Token

Request Body :

```json
{
  "password": "ongko1234",
  "confirmPassword": "ongko1234"
}
```

Response Body (Success 200) :

```json
{
  "message": "Success update password"
}
```

## Delete User

Endpoint : PATCH /api/v2/user/delete

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

```json
{
  "message": "Success delete user",
  "data": [
    {
      "id": "73aaca53-04e5-4565-9e8c-3930a17a3c1a",
      "firstname": "Erlin",
      "lastname": "Indrayani ",
      "email": "ein@gmail.com",
      "phone": "0812345678990",
      "password": "$2b$04$g0LD8nEtBLG34GYgvWj2XOV7SflDXRyx.U12mjc9ypVSt8BOgRWLm",
      "role": "customer",
      "createdAt": "2024-07-30T15:39:47.873Z",
      "updatedAt": "2024-07-30T15:39:47.873Z"
    }
  ]
}
```
