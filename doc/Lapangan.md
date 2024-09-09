# Lapangan API Spec

# Fetch Lapangan
Endpoint : GET /api/v1/lapangan

Query Params :
- page : Number
- limit : Number

Response Body (Success) : 
```json
{
  "message": "Success get lapangan",
  "data": {
    "count": 2,
    "page": 1,
    "totalPage": 1,
    "prevPage": false,
    "nextPage": false,
    "lapangan": [
      {
        "id": "7ebb6f0e-9f07-4ab2-bc6a-8e9535330a44",
        "name": "Futsal Waiheru",
        "picture": "",
        "description": "",
        "liked": 0,
        "open": "09:00",
        "close": "24:00"
      },
      {
        "id": "50a7df5c-dde2-463d-bbae-3753d9cc6299",
        "name": "Futsal Waiheru",
        "picture": "",
        "description": "",
        "liked": 0,
        "open": "09:00",
        "close": "24:00"
      }
    ]
  }
}
```

## Fetch Lapangan by ID
Endpoint : GET /api/v1/lapangan/:id

Params :
- id : String (id Lapangan)

Response Body (Success) :
```json
{
  "message": "Success get lapangan",
  "data": {
    "id": "8525cf58-e6fb-431e-8ad2-7a978b42a085",
    "name": "Gor Galunggung",
    "picture": "",
    "description": "",
    "address": {
      "alamat": "Galunggung",
      "mapUrl": "https://maps.google.com/"
    },
    "liked": 0,
    "open": "09:00",
    "close": "18:00",
    "createdAt": "2024-07-30T14:48:08.779Z",
    "updatedAt": "2024-07-30T14:48:08.779Z"
  }
}
```

## Create Lapangan
Endpoint : POST /api/v2/lapangan

Header : 
- Authorization : Bearer Token


Request Body : 
```json
{
  "name": "Futsal Waiheru",
  "picture": "",
  "description": "",
  "address": {
    "alamat": "Tantui",
    "mapUrl": "https://maps.google.com/"
  },
  "open": "09:00",
  "close": "24:00"
}
```
Response Body (Success 201) :
```json
{
  "message": "Success create lapangan",
  "data": {
    "id": "50a7df5c-dde2-463d-bbae-3753d9cc6299",
    "name": "Futsal Waiheru",
    "picture": "",
    "description": "",
    "address": {
      "alamat": "Tantui",
      "mapUrl": "https://maps.google.com/"
    },
    "liked": 0,
    "open": "09:00",
    "close": "24:00",
    "createdAt": "2024-07-28T05:15:05.773Z",
    "updatedAt": "2024-07-28T05:15:05.773Z"
  }
}
```

## Update Lapangan
Endpoint : PATCH /api/v2/lapangan/:id


Header : 
- Authorization : Bearer Token

Params : 
- id : String (id Lapangan)

Request Body : 
```json
{
  "name": "Futsal tantui",
  "description": "jkajsdasd"
}
```

Response Body (Success 200) :
```json
{
  "message": "Success update lapangan",
  "data": {
    "id": "50a7df5c-dde2-463d-bbae-3753d9cc6299",
    "name": "Futsal tantui",
    "picture": "",
    "description": "jkajsdasd",
    "address": {
      "alamat": "Tantui",
      "mapUrl": "https://maps.google.com/"
    },
    "liked": 0,
    "open": "09:00",
    "close": "24:00",
    "createdAt": "2024-07-28T05:15:05.773Z",
    "updatedAt": "2024-07-28T05:15:05.773Z"
  }
}
```

## Delete Lapangan
Endpoint : DELETE /api/v2/lapangan/:id


Header : 
- Authorization : Bearer Token

Params : 
- id : String (id Lapangan)

Response Body (Success 200) :
```json
{
  "message": "Success delete lapangan",
  "data": {
    "id": "50a7df5c-dde2-463d-bbae-3753d9cc6299",
    "name": "Futsal tantui",
    "picture": "",
    "description": "jkajsdasd",
    "address": {
      "alamat": "Tantui",
      "mapUrl": "https://maps.google.com/"
    },
    "liked": 0,
    "open": "09:00",
    "close": "24:00",
    "createdAt": "2024-07-28T05:15:05.773Z",
    "updatedAt": "2024-07-28T05:15:05.773Z",
    "userId": "f738f145-b6eb-4ecc-9a29-51b256614252"
  }
}
```