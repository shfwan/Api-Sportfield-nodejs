# Jam API Spec

## Fetch Jam

Endpoint : GET /api/v1/lapangan/:lapanganId/information/:id/jam

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Query Params :

- day : Number
- month : Number
- year : Number

Response Body (Success 200) :

```json
{
  "message": "Success get jam",
  "data": {
    "date": "7/30/2024",
    "type": "Bulutangkis",
    "price": 100000,
    "available": 0,
    "jadwal": []
  }
}
```

Response Body (Failed 404) :

```json
{
  "message": "Lapangan Not Found"
}
```

## Add Jam

Endpoint : GET /api/v1/lapangan/:lapanganId/information/:id/jam

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Request Body :

```json
{
    [
        {
            "open" : "09:00",
            "close" : "10:00"
        },
        {
            "open" : "10:00",
            "close" : "11:00"
        },
        {
            "open" : "11:00",
            "close" : "12:00"
        }
    ]
}
```

Response Body (Success) :

```json
{
    "jam": [
      {
        "id": 1,
        "open": "09:00",
        "close": "10:00"
      },
      {
        "id": 2,
        "open": "10:00",
        "close": "11:00"
      },
      {
        "id": 3,
        "open": "11:00",
        "close": "12:00"
      }
    ],
}
```

## Delete Jam

Endpoint : DELETE /api/v2/lapangan/:lapanganId/information/:id/jam/remove

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Query params : 
- id : Number (id jam)

Response Body (Success) :

```json
{
  "message": "Success remove jam",
  "data": [
    {
      "id": 1,
      "open": "09:00",
      "close": "10:00"
    },
    {
      "id": 2,
      "open": "10:00",
      "close": "11:00"
    }
  ]
}
```

Response Body (Failed 404) :

```json
{
  "message": "Lapangan Not Found"
}
```

Response Body (Failed 404) :

```json
{
  "message": "Jam Not Found"
}
```

## Reset Jam

Endpoint : DELETE /api/v2/lapangan/:lapanganId/information/:id/jam

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Response Body (Success) :

```json
{
  "message": "Success reset jam",
  "data": []
}
```

Response Body (Failed) :

```json
{
  "message": "Lapangan Not Found"
}
```
