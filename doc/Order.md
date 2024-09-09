# Order API Spec

## List Order

Endpoint : GET /api/v2/order

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

```json
{
  "message": "Success get orders",
  "data": [
    {
      "id": "b1e4ec3e-f1f5-4fb7-a9b5-9ab6ce088281",
      "userId": "38c936ee-af7e-4340-9f88-c7788409b3a1",
      "playStatus": false,
      "orderStatus": true,
      "createdAt": "2024-07-31T02:26:55.212Z",
      "updatedAt": "2024-07-31T02:26:55.212Z",
      "detailOrder": {
        "id": "dbe10ddd-6f0c-4f8b-bd5b-5923fe222fbb",
        "orderId": "b1e4ec3e-f1f5-4fb7-a9b5-9ab6ce088281",
        "detailsLapanganId": 5,
        "jam": [
          {
            "id": 1,
            "open": "09:00",
            "close": "10:00"
          }
        ],
        "date": "2024-07-31"
      }
    }
  ]
}
```

Response Body (Failed) :

```json
{}
```

## Get Order by id

Endpoint : GET /api/v2/order/:id

Params :

- id : String (id Order)

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

```json
{
  "message": "Success get detail order",
  "order": {
    "id": "5b8e3b87-3b48-4361-b72e-45302b11be04",
    "playStatus": false,
    "orderStatus": true,
    "tanggalBermain": "2024-07-31",
    "price": 10000,
    "lamaBermain": 1,
    "jam": [
      {
        "id": 1,
        "open": "09:00",
        "close": "10:00"
      }
    ],
    "total": 10000,
    "tanggalOrder": "7/31/2024, 1:13:32 PM"
  }
}
```

Response Body (Failed) :

```json
{}
```

## Create Order

Endpoint : POST /api/v2/order/lapangan/:lapanganId/information/:id/checkout

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Header :

- Authorization : Bearer Token

Request Body :

```json
{
  "date": "7/31/2024",
  "jam": [
    {
      "id": 1,
      "open": "09:00",
      "close": "10:00"
    }
  ]
}
```

Response Body (Success 200) :

```json
{
  "message": "Success order",
  "data": {
    "order": {
      "id": "dbe10ddd-6f0c-4f8b-bd5b-5923fe222fbb",
      "userId": "38c936ee-af7e-4340-9f88-c7788409b3a1",
      "playStatus": false,
      "orderStatus": true,
      "createdAt": "2024-07-31T02:26:55.212Z",
      "updatedAt": "2024-07-31T02:26:55.212Z",
      "orderId": "b1e4ec3e-f1f5-4fb7-a9b5-9ab6ce088281",
      "detailsLapanganId": 5,
      "jam": [
        {
          "id": 1,
          "open": "09:00",
          "close": "10:00"
        }
      ],
      "date": "2024-07-31"
    },
    "token": "81ff72c8-905f-4af4-bd06-f820d4edff09"
  }
}
```

Response Body (Failed) :

```json
{}
```

## Update Order Play

Endpoint : PATCH /api/v2/order/lapangan/:lapanganId/information/:id/play

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Query Params :

- id : String (id Order)

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

```json
{
  "message": "Success update play game",
  "data": [
    {
      "id": "b1e4ec3e-f1f5-4fb7-a9b5-9ab6ce088281",
      "userId": "38c936ee-af7e-4340-9f88-c7788409b3a1",
      "playStatus": true,
      "orderStatus": false,
      "createdAt": "2024-07-31T02:26:55.212Z",
      "updatedAt": "2024-07-31T02:26:55.212Z"
    }
  ]
}
```

Response Body (Failed) :

```json
{}
```

## Update Order End

Endpoint : PATCH /api/v2/order/lapangan/:lapanganId/information/:id/end

Params :

- lapanganId : String (id Lapangan)
- id : Number (id Detail Lapangan)

Query Params :

- id : String (id Order)

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

```json
{
  "message": "Success update end game",
  "data": [
    {
      "id": "b1e4ec3e-f1f5-4fb7-a9b5-9ab6ce088281",
      "userId": "38c936ee-af7e-4340-9f88-c7788409b3a1",
      "playStatus": false,
      "orderStatus": false,
      "createdAt": "2024-07-31T02:26:55.212Z",
      "updatedAt": "2024-07-31T02:26:55.212Z"
    }
  ]
}
```

Response Body (Failed) :

```json
{}
```

## Delete Order

Endpoint : DELETE /api/v2/order/lapangan/:lapanganId/information/:id/play

Params :

- id : String (id Order)

Header :

- Authorization : Bearer Token

Response Body (Success 200) :

````json
{
  "message": "Success delete order",
}
```)

Response Body (Failed) :
```json
{

}
````
