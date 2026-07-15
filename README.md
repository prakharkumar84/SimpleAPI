# API Training Sandbox

A simple REST API designed as a one-stop testing ground for learning and practicing API calls. Covers all common HTTP methods, parameter types, authentication patterns, and response scenarios.

## Base URL

```
Local:  http://localhost:3000
Live:   https://your-render-url.onrender.com
```

## Quick Start

```bash
npm install
npm start
```

---

## Endpoints Overview

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/api/products` | Get all products |
| 2 | GET | `/api/products/:id` | Get product by path param |
| 3 | GET | `/api/products/search?name=&category=` | Search with query params |
| 4 | GET | `/api/users` | Get all users |
| 5 | GET | `/api/users/:id` | Get user by ID |
| 6 | GET | `/api/secure/profile` | Requires `x-api-key` header |
| 7 | GET | `/api/headers/echo` | Echo back all request headers |
| 8 | POST | `/api/products` | Create product (JSON body) |
| 9 | POST | `/api/validate` | Validate plain text body |
| 10 | POST | `/api/validate-json` | Validate JSON structure |
| 11 | POST | `/api/login` | Login, returns fake JWT token |
| 12 | POST | `/api/orders?userId=` | Query param + JSON body combined |
| 13 | PUT | `/api/products/:id` | Full update (all fields required) |
| 14 | PATCH | `/api/products/:id` | Partial update |
| 15 | DELETE | `/api/products/:id` | Delete a product |
| 16 | GET | `/api/paginated?page=&limit=` | Pagination example |
| 17 | GET | `/api/slow?delay=3000` | Simulated slow response |
| 18 | GET | `/api/status/:code` | Returns any HTTP status code |

---

## Detailed Examples

### 1. GET All Products

```
GET /api/products
```

Response:
```json
{
  "count": 5,
  "data": [
    { "id": 1, "name": "Laptop", "category": "electronics", "price": 999.99, "inStock": true },
    ...
  ]
}
```

---

### 2. GET by Path Parameter

```
GET /api/products/1
```

Response:
```json
{ "id": 1, "name": "Laptop", "category": "electronics", "price": 999.99, "inStock": true }
```

Error (not found):
```
GET /api/products/99 → 404
```

---

### 3. GET with Query Parameters (Search/Filter)

```
GET /api/products/search?category=electronics&minPrice=100&maxPrice=500
```

Available filters: `name`, `category`, `minPrice`, `maxPrice`, `inStock` (true/false)

---

### 4. GET with Header Authentication

```
GET /api/secure/profile
Headers:
  x-api-key: my-secret-key-123
```

Without the header → 401 Unauthorized
With correct key → profile data

---

### 5. GET Echo Headers

```
GET /api/headers/echo
```

Returns all headers your client sent — useful for debugging.

---

### 6. POST with JSON Body (Create)

```
POST /api/products
Content-Type: application/json

{
  "name": "Keyboard",
  "category": "electronics",
  "price": 79.99,
  "inStock": true
}
```

Response (201):
```json
{
  "message": "Product created successfully",
  "data": { "id": 6, "name": "Keyboard", "category": "electronics", "price": 79.99, "inStock": true }
}
```

Missing fields → 400 with validation errors

---

### 7. POST with Plain Text Body

```
POST /api/validate
Content-Type: text/plain

Hello World
```

Response:
```json
{ "message": "Valid input", "id": "Hello World" }
```

---

### 8. POST Validate JSON Structure

```
POST /api/validate-json
Content-Type: application/json

{
  "id": "ABC123",
  "name": "Test User",
  "email": "test@example.com"
}
```

Validates that `id` and `name` are strings, `email` contains `@`.

---

### 9. POST Login (Token-based Auth)

```
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Success → returns fake JWT token
Wrong credentials → 401 with hint

---

### 10. POST with Query Params + Body Combined

```
POST /api/orders?userId=1
Content-Type: application/json

{
  "productId": 2,
  "quantity": 3
}
```

Demonstrates using BOTH query parameters and request body in one call.

---

### 11. PUT - Full Update

```
PUT /api/products/1
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "category": "electronics",
  "price": 1499.99,
  "inStock": true
}
```

All fields are required (replaces the entire resource).

---

### 12. PATCH - Partial Update

```
PATCH /api/products/1
Content-Type: application/json

{
  "price": 899.99
}
```

Only updates the fields you send.

---

### 13. DELETE

```
DELETE /api/products/1
```

Returns the deleted product data.

---

### 14. Pagination

```
GET /api/paginated?page=1&limit=2
```

Response includes: `page`, `limit`, `totalItems`, `totalPages`, `data`

---

### 15. Slow Response (Timeout Testing)

```
GET /api/slow?delay=5000
```

Delays response by specified milliseconds (max 10000ms). Useful for testing timeout handling.

---

### 16. Status Code Testing

```
GET /api/status/200  → 200 OK
GET /api/status/404  → 404 Not Found
GET /api/status/500  → 500 Internal Server Error
```

Returns whatever HTTP status code you specify (100-599).

---

## Common HTTP Status Codes Reference

| Code | Meaning | When You'll See It |
|------|---------|-------------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Missing/invalid fields in request |
| 401 | Unauthorized | Missing or wrong API key/credentials |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Something went wrong on server |

---

## Testing Tools

- **Browser**: Only GET requests (paste URL in address bar)
- **Postman**: Full GUI for all methods and headers
- **cURL**: Command-line tool
- **VS Code REST Client**: `.http` files with inline requests
- **Insomnia**: Lightweight alternative to Postman

### cURL Examples

```bash
# GET all products
curl http://localhost:3000/api/products

# GET with query params
curl "http://localhost:3000/api/products/search?category=electronics"

# POST with JSON body
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Tablet","category":"electronics","price":599}'

# GET with auth header
curl http://localhost:3000/api/secure/profile \
  -H "x-api-key: my-secret-key-123"

# DELETE
curl -X DELETE http://localhost:3000/api/products/1
```

---

## Deployment

This API is deployed on Render. Any push to `main` triggers auto-deploy.

## License

Free to use for learning and testing.
