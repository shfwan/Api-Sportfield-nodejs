# Profile API Spec

## View Picture
Endpoint : GET /api/v1/user/picture/*

# Get Profile
Endpoint : GET /api/v2/user/information

Header :
- Authorization : Bearer Token

Response Body (Success 200) :
```json
{
  "message": "Success get profile",
  "data": {
    "fullname": "Mingkii Nurlette",
    "email": "shafwan372@gmail.com",
    "phone": "081218987161",
    "bio": "-",
    "picture": "Upstream-9.png"
  }
}
```

# Update Profile
Endpoint : GET /api/v2/user/information

Header :
- Authorization : Bearer Token

Response Body Form Data (Success 200) :
```json
{
    "bio" : "asd",
    "file":  Blob (75.23 KB) {
        "type": "image/jpeg"
    }, | //foto.jpeg
}
```

Response Body (Failed 4**) :
```json
{
  "message": "Success update profile",
  "data": {
    "id": "fb0bccf7-d95f-4bc5-8ed7-293d61b16fe0",
    "picture": "1722324047463.jpeg",
    "bio": "asd",
    "userId": "38c936ee-af7e-4340-9f88-c7788409b3a1"
  }
}
```