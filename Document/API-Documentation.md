# API Documentation

**Document Version:** 1.0  
**Last Updated:** January 25, 2026  
**Base URL:** `https://api.tabletennisshop.com`  
**API Version:** v1

---

## Table of Contents
1. [Authentication](#authentication)
2. [Common Headers](#common-headers)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
6. [Webhooks](#webhooks)
7. [Changelog](#changelog)

---

## Authentication

### JWT Token Authentication

All API requests (except signup/signin) require a valid JWT token.

**Token Location:** Cookie (`session`) or Authorization header

**Authorization Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Token Expiration:** 15 minutes

**Refresh Strategy:** Use refresh token endpoint before expiration

---

### Authentication Endpoints

#### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "id": "63f7d8a9c4e1b2a3d4e5f678",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Email already exists
- `400` - Invalid email format
- `400` - Password too weak

---

#### POST `/api/auth/signin`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "id": "63f7d8a9c4e1b2a3d4e5f678",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials

---

#### GET `/api/auth/currentuser`

Get currently authenticated user.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "currentUser": {
    "id": "63f7d8a9c4e1b2a3d4e5f678",
    "email": "user@example.com"
  }
}
```

**Response (not authenticated):** `200 OK`
```json
{
  "currentUser": null
}
```

---

#### POST `/api/auth/signout`

Logout and invalidate token.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{}
```

---

## Common Headers

### Request Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `Content-Type` | Yes | Request payload format | `application/json` |
| `Authorization` | Conditional | JWT token (if authenticated) | `Bearer <token>` |
| `X-Request-ID` | No | Unique request identifier for tracing | `uuid-v4` |
| `User-Agent` | No | Client identification | `TableTennisShop-Client/1.0` |

### Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | Response format (always `application/json`) |
| `X-Request-ID` | Echoed back for request tracing |
| `X-RateLimit-Limit` | Total requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Error description",
      "field": "fieldName"  // Optional, for validation errors
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | Resource retrieved |
| `201` | Created | Resource created successfully |
| `204` | No Content | Resource deleted |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | Service temporarily down |

### Example Error Responses

**Validation Error (400):**
```json
{
  "errors": [
    {
      "message": "Email must be valid",
      "field": "email"
    },
    {
      "message": "Password must be at least 8 characters",
      "field": "password"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "errors": [
    {
      "message": "Not authorized"
    }
  ]
}
```

**Rate Limit Error (429):**
```json
{
  "errors": [
    {
      "message": "Too many requests. Please try again in 60 seconds."
    }
  ]
}
```

---

## Rate Limiting

### Limits

| Endpoint | Authenticated | Unauthenticated |
|----------|---------------|-----------------|
| `/api/auth/*` | 100 req/min | 20 req/min |
| `/api/products/*` | 200 req/min | 50 req/min |
| `/api/orders/*` | 100 req/min | N/A |
| `/api/payments/*` | 50 req/min | N/A |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706198400
```

### Exceeding Rate Limit

**Response:** `429 Too Many Requests`
```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Retry after 60 seconds."
    }
  ]
}
```

---

## API Endpoints

### Products API

#### GET `/api/products`

List all products with pagination and filtering.

**Headers:** Optional authentication

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `category` | string | - | Filter by category |
| `search` | string | - | Search in title and description |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `sort` | string | `createdAt` | Sort field (`price`, `title`, `createdAt`) |
| `order` | string | `asc` | Sort order (`asc`, `desc`) |

**Example Request:**
```
GET /api/products?page=1&limit=20&category=rackets&sort=price&order=asc
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "63f7d8a9c4e1b2a3d4e5f678",
      "title": "Professional Carbon Racket",
      "description": "High-performance carbon fiber racket",
      "price": 89.99,
      "category": "rackets",
      "imageUrl": "https://cdn.example.com/racket.jpg",
      "stockQuantity": 15,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 87,
    "itemsPerPage": 20
  }
}
```

---

#### GET `/api/products/:id`

Get a single product by ID.

**Headers:** Optional authentication

**URL Parameters:**
- `id` - Product ID (MongoDB ObjectId)

**Response:** `200 OK`
```json
{
  "id": "63f7d8a9c4e1b2a3d4e5f678",
  "title": "Professional Carbon Racket",
  "description": "High-performance carbon fiber racket with enhanced control",
  "price": 89.99,
  "category": "rackets",
  "imageUrl": "https://cdn.example.com/racket.jpg",
  "stockQuantity": 15,
  "specifications": {
    "weight": "85g",
    "material": "Carbon Fiber",
    "gripSize": "FL"
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-20T14:20:00Z"
}
```

**Errors:**
- `404` - Product not found

---

#### POST `/api/products` (Admin Only)

Create a new product.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "title": "Professional Carbon Racket",
  "description": "High-performance carbon fiber racket",
  "price": 89.99,
  "category": "rackets",
  "imageUrl": "https://cdn.example.com/racket.jpg",
  "stockQuantity": 50
}
```

**Response:** `201 Created`
```json
{
  "id": "63f7d8a9c4e1b2a3d4e5f678",
  "title": "Professional Carbon Racket",
  "description": "High-performance carbon fiber racket",
  "price": 89.99,
  "category": "rackets",
  "imageUrl": "https://cdn.example.com/racket.jpg",
  "stockQuantity": 50,
  "createdAt": "2026-01-25T10:00:00Z"
}
```

**Errors:**
- `403` - Not authorized (not admin)
- `400` - Validation failed

---

### Orders API

#### POST `/api/orders`

Create a new order.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "items": [
    {
      "productId": "63f7d8a9c4e1b2a3d4e5f678",
      "quantity": 2
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "63f7e9b0d5f2c3b4e5f6g789",
  "userId": "63f7d8a9c4e1b2a3d4e5f678",
  "status": "created",
  "items": [
    {
      "productId": "63f7d8a9c4e1b2a3d4e5f678",
      "title": "Professional Carbon Racket",
      "quantity": 2,
      "price": 89.99
    }
  ],
  "totalPrice": 179.98,
  "expiresAt": "2026-01-25T10:15:00Z",
  "createdAt": "2026-01-25T10:00:00Z"
}
```

**Errors:**
- `400` - Insufficient stock
- `404` - Product not found

---

#### GET `/api/orders`

List current user's orders.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "63f7e9b0d5f2c3b4e5f6g789",
      "status": "completed",
      "totalPrice": 179.98,
      "createdAt": "2026-01-25T10:00:00Z"
    }
  ]
}
```

---

#### GET `/api/orders/:id`

Get order details.

**Headers:** Requires authentication

**URL Parameters:**
- `id` - Order ID

**Response:** `200 OK`
```json
{
  "id": "63f7e9b0d5f2c3b4e5f6g789",
  "userId": "63f7d8a9c4e1b2a3d4e5f678",
  "status": "completed",
  "items": [
    {
      "productId": "63f7d8a9c4e1b2a3d4e5f678",
      "title": "Professional Carbon Racket",
      "quantity": 2,
      "price": 89.99
    }
  ],
  "totalPrice": 179.98,
  "payment": {
    "method": "credit_card",
    "status": "succeeded",
    "transactionId": "ch_abc123"
  },
  "createdAt": "2026-01-25T10:00:00Z",
  "updatedAt": "2026-01-25T10:05:00Z"
}
```

**Errors:**
- `404` - Order not found
- `403` - Not authorized to view this order

---

#### PATCH `/api/orders/:id/cancel`

Cancel an order.

**Headers:** Requires authentication

**URL Parameters:**
- `id` - Order ID

**Response:** `200 OK`
```json
{
  "id": "63f7e9b0d5f2c3b4e5f6g789",
  "status": "cancelled",
  "updatedAt": "2026-01-25T10:10:00Z"
}
```

**Errors:**
- `400` - Order cannot be cancelled (already completed)
- `404` - Order not found

---

### Payments API

#### POST `/api/payments`

Process payment for an order.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "orderId": "63f7e9b0d5f2c3b4e5f6g789",
  "token": "tok_visa",  // Stripe token
  "saveCard": false
}
```

**Response:** `201 Created`
```json
{
  "id": "63f7fab1e6g3d4c5f6g7h890",
  "orderId": "63f7e9b0d5f2c3b4e5f6g789",
  "amount": 179.98,
  "currency": "USD",
  "status": "succeeded",
  "transactionId": "ch_abc123",
  "createdAt": "2026-01-25T10:05:00Z"
}
```

**Errors:**
- `400` - Payment failed (insufficient funds, etc.)
- `404` - Order not found
- `409` - Order already paid

---

## Webhooks

### Payment Webhooks

Receive notifications for payment events.

**Webhook URL:** Configured in settings

**Signature Verification:** HMAC SHA-256

**Headers:**
```
X-Webhook-Signature: <hmac_signature>
X-Webhook-ID: <unique_id>
```

**Payload:**
```json
{
  "event": "payment.succeeded",
  "data": {
    "paymentId": "63f7fab1e6g3d4c5f6g7h890",
    "orderId": "63f7e9b0d5f2c3b4e5f6g789",
    "amount": 179.98,
    "timestamp": "2026-01-25T10:05:00Z"
  }
}
```

**Event Types:**
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`
- `order.completed`
- `order.cancelled`

---

## Changelog

### v1.0 (2026-01-25)
- Initial API release
- Authentication endpoints
- Product catalog CRUD
- Order management
- Payment processing

---

**API Support:** api-support@tabletennisshop.com
