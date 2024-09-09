# Detail Lapangan API Spec

## List Detail Lapangan
Endpoint : GET /api/v1/lapangan/:id/list

Params : 
- id : String (id Lapangan)

Response Body (Success 200) :
```json
{
  "message": "Success get list detail lapangan",
  "data": [
    {
      "id": 2,
      "name": "Lapangan 1",
      "type": "Futsal",
      "statusLapangan": "Indoor",
      "description": "Lapangan 1",
      "price": 100000,
      "jam": [],
      "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
    },
    {
      "id": 4,
      "name": "Lapangan 2",
      "type": "Futsal",
      "statusLapangan": "Outdoor",
      "description": "Lapangan 2",
      "price": 100000,
      "jam": [],
      "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
    },
    {
      "id": 5,
      "name": "Lapangan Bulutangkis 1",
      "type": "Bulutangkis",
      "statusLapangan": "Indoor",
      "description": "",
      "price": 50000,
      "jam": [],
      "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
    },
    {
      "id": 6,
      "name": "Lapangan Bulutangkis 2",
      "type": "Bulutangkis",
      "statusLapangan": "Outdoor",
      "description": "",
      "price": 50000,
      "jam": [],
      "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
    }
  ]
}
```

## Get by id Detail Lapangan
Endpoint : GET /api/v1/lapangan/:id/list

Params :
- id: String (id Lapangan)

Query Params : 
- id: Number (id Detail Lapangan)

Response Body (Success 200) :
```json
{
  "message": "Success get detail lapangan",
  "lapangan": {
    "id": 5,
    "name": "Lapangan Bulutangkis 1",
    "type": "Bulutangkis",
    "statusLapangan": "Indoor",
    "description": "",
    "price": 50000,
    "jam": [],
    "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
  }
}
```

Response Body (Failed 404) :
```json
{
    "message" : "Lapangan Not found"
}
```

## Create Detail Lapangan
Endpoint : POST /api/v2/lapangan/:id/information

Params :
- id: String (id Lapangan)

Header :
- Authorization : Bearer Token

Request Body :
```json
{
  "name": "Lapangan 1",
  "description": "Lapangan 1",
  "statusLapangan": "Indoor",
  "type": "Futsal",
  "price": 100000
}
```

Response Body (Success 200) :
```json
{
  "message": "Success create detail lapangan",
  "data": {
    "id": 2,
    "name": "Lapangan 1",
    "type": "Futsal",
    "statusLapangan": "Indoor",
    "description": "Lapangan 1",
    "price": 100000,
    "jam": []
  }
}
```

Response Body (Failed 404) :
```json
{
    "message" : "Lapangan Not found"
}
```

Response Body (Failed 400) : 
```json
{
  "message": {
    "formErrors": [],
    "fieldErrors": {
      "price": [
        "Expected number, received string"
      ]
    }
  }
}
```

## Update Detail Lapangan
Endpoint : POST /api/v2/lapangan/:id/information

Params :
- id: String (id Lapangan)

Query Params : 
- id: Number (id Detail Lapangan)


Header :
- Authorization : Bearer Token

Request Body :
```json
{
  "statusLapangan": "Outdoor",
  "price": 100000
}
```

Response Body (Success 200) :
```json
{
  "message": "Success update lapangan",
  "data": {
    "name": "Lapangan Bulutangkis 1",
    "type": "Bulutangkis",
    "statusLapangan": "Outdoor",
    "description": "",
    "price": 100000,
    "jam": []
  }
}
```

Response Body (Failed 404) :
```json
{
    "message" : "Lapangan Not found"
}
```

## Delete Detail Lapangan
Endpoint : POST /api/v2/lapangan/:id/information

Params :
- id: String (id Lapangan)

Query Params : 
- id: Number (id Detail Lapangan)


Header :
- Authorization : Bearer Token

Response Body (Success 200) :
```json
{
  "message": "Success remove lapangan",
  "data": {
    "id": 6,
    "name": "Lapangan Bulutangkis 2",
    "type": "Bulutangkis",
    "statusLapangan": "Outdoor",
    "description": "",
    "price": 50000,
    "jam": [],
    "lapanganId": "bd880e55-2898-45bb-a970-0c1002282e84"
  }
}
```

Response Body (Failed 404) :
```json
{
    "message" : "Lapangan Not found"
}
```


