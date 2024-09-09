# Auth API Spec

## Login Auth

Endpoint : POST /api/v1/auth/login

Request Body :

```json
{
  "email": "shafwan367@gmail.com",
  "password": "ongko123"
}
```

Response Body (Success 201) :

```json
{
  "message": "Success login",
  "data": {
    "fullname": "Shafwan Nurlette",
    "token": "...",
    "refreshToken": "..."
  }
}
```

Response Body (User or Password incorrect 400) :

```json
{
  "message": "Email or password is incorrect"
}
```

Response Body (Failed, email and password empty 400) :

```json
{
  "message": {
    "formErrors": [],
    "fieldErrors": {
      "email": ["String must contain at least 1 character(s)"],
      "password": ["Password length must 8 character"]
    }
  }
}
```

## Register Auth

Endpoint : POST /api/v1/auth/register

Request Body :

```json
{
  "firstname": "Shafwan",
  "lastname": "Nurlette",
  "email": "shafwan@gmail.com",
  "phone": "08123456789",
  "password": "123456789",
  "confirmPassword": "123456789"
}
```

Response Body (Success 201) :

```json
{
  "message": "Success creating user",
  "data": {
    "id": "db35b0bf-565e-4ea6-9cb8-0f29d39d97a2",
    "firstname": "Mingki",
    "lastname": "md",
    "email": "mingki@gmail.com",
    "phone": "08121898716",
    "password": "$2b$04$XtFhek8..YJZPNeLf7cc4OCxL8y.e6u8h7f7ZLNh7M0ptkgGY7t1C",
    "createdAt": "2024-07-27T17:36:14.438Z",
    "updatedAt": "2024-07-27T17:36:14.438Z"
  }
}
```

Response Body (Failed 409) :

```json
{
  "message": "User already exists"
}
```

## Refresh Token

Endpoint : POST /api/v1/auth/refresh_token

Header :

- Authorization : Bearer token

Request Body :

```json
{
  "refreshToken": "..."
}
```

Response Body (Success) :

```json
{
  "message": "Success refresh token",
  "token": "...",
  "refreshToken": "..."
}
```

Response Body (Failed) :

```json
{
  "message": "jwt expired"
}
```
