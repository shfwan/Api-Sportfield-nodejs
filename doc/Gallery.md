# Gallery API Spec


## View Picture
Endpoint : GET /api/v1/lapangan/picture/*

## List Picture

Endpoint : GET /api/v1/lapangan/:lapanganId/information/:id/gallery

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail lapangan)

Response Body (Success 200) :

```json
{
  "message": "Success get gallery",
  "data": [
    {
      "id": 1,
      "filename": "1722336049758.jpeg",
      "date": "7/31/2024, 4:40:49 AM"
    },
    {
      "id": 2,
      "filename": "1722336086857.jpeg",
      "date": "7/31/2024, 4:41:26 AM"
    }
  ]
}
```

## Add Gallery

Endpoint : POST /api/v2/lapangan/:lapanganId/information/:id/gallery

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail lapangan)

Request Body Form Data : 
```json
{
    "file":  Blob (75.23 KB) {
        "type": "image/jpeg"
    }, | //foto.jpeg
}
```

Response Body (Success 201) :
```json
{
  "message": "Success add gallery",
  "data": {
    "id": 3,
    "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84",
    "detailsLapanganId": 5,
    "filename": "1722336245325.jpeg",
    "mimeType": "image/jpeg",
    "createdAt": "2024-07-30T19:44:05.330Z"
  }
}
``` 

## Delete Gallery

Endpoint : DELETE /api/v2/lapangan/:lapanganId/information/:id/gallery

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail lapangan)

Query Params :

- id: Number (id Gallery)

Response Body (Success) :
```json
{
  "message": "Success remove gallery",
  "data": {
    "id": 3,
    "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84",
    "detailsLapanganId": 5,
    "filename": "1722336245325.jpeg",
    "mimeType": "image/jpeg",
    "createdAt": "2024-07-30T19:44:05.330Z"
  }
}
```
