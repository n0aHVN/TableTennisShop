# Auth Service Documentation

This document describes the architecture, APIs, data model, and deployment of the Auth microservice in TableTennisShop.

---

## 1. Overview

The Auth service handles user registration, login, logout, and returning the currently authenticated user.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Auth mechanism** | JWT stored in cookie-session |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `auth/src` |
| **Default port** | `3000` |

---

## 2. Run Locally

```bash
cd auth
npm install
npm run start
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_KEY` | Secret key used to sign JWT tokens |

---

## 3. Authentication Flow

1. Client calls `POST /api/users/signup` or `POST /api/users/signin`.
2. On success, the service creates a JWT with the following payload:
   - `_id` -- User's MongoDB ObjectId
   - `email` -- User's email
   - `username` -- User's username
   - `type` -- User's role (`RoleEnum`)
3. The JWT is stored in `req.session.jwt` (cookie-session).
4. Browser automatically sends the cookie on subsequent requests.
5. `CurrentUserMiddleware` reads the cookie JWT and sets `req.currentUser`.
6. Protected endpoints can read `req.currentUser` to identify the caller.

---

## 4. API Endpoints

Base prefix: `/api/users`

### 4.1 Health Check

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/users/hello` |
| **Auth** | None |
| **Middleware** | None |

**Response:**

```text
HelloWorld
```

---

### 4.2 Signup

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/users/signup` |
| **Auth** | None |
| **Middleware** | `signupValidationRules` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `username` | Required, string, length 4–100 |
| `email` | Required, valid email format |
| `password` | Required, trimmed, length 4–20 |
| `full_name` | Required |
| `address` | Required |

**Request body:**

```json
{
  "username": "john123",
  "email": "john@example.com",
  "password": "123456",
  "full_name": "John Smith",
  "address": "123 Main St"
}
```

**Success response (201):**

```json
{
  "statusCode": 201,
  "message": "User is successfully created",
  "success": true
}
```

**Error response (400) -- validation failure:**

```json
{
  "errors": [
    { "message": "Username must be between 4 and 100 characters", "details": "username" }
  ]
}
```

> New users are created with `type: RoleEnum.CUSTOMER` and `status: UserStatusEnum.ENABLE`.

---

### 4.3 Signin

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/users/signin` |
| **Auth** | None |
| **Middleware** | `signinValidationRules` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `email` | Required |
| `password` | Required, length 4–20 |

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Success response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User signed in successfully"
}
```

A `Set-Cookie` header is included with the JWT session cookie.

**Error response (400) -- invalid credentials:**

```json
{
  "errors": [
    { "message": "Invalid credentials" }
  ]
}
```

---

### 4.4 Current User

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/users/currentuser` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CurrentUserMiddleware` |

**Success response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "email": "john@example.com",
    "full_name": "John Smith",
    "address": "123 Main St",
    "createdAt": "2026-03-17T07:00:00.000Z"
  }
}
```

**Error response (401) -- not authenticated:**

```json
{
  "errors": [
    { "message": "Not authorized" }
  ]
}
```

---

### 4.5 Signout

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/users/signout` |
| **Auth** | None |
| **Middleware** | None |

**Success response (200):**

```json
{
  "statusCode": 200,
  "message": "Successfully signed out",
  "success": true
}
```

Clears the session cookie.

---

## 5. Data Model

**Collection:** `user`

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | String | Required, unique |
| `email` | String | Required, unique |
| `password` | String | Required, hashed via pre-save hook |
| `full_name` | String | Required |
| `address` | String | Required |
| `type` | String | Enum: `RoleEnum` (`owner`, `customer`, `employee`). Default: `customer` |
| `status` | String | Enum: `UserStatusEnum` (`enable`, `disable`). Default: `enable` |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

**Notes:**
- Password is hashed using a pre-save Mongoose hook before persisting.
- Email and username uniqueness is enforced at the schema level.

---

## 6. Project Structure

```
auth/src/
├── app.ts              # Express app setup and middleware
├── index.ts            # Startup logic, env checks, MongoDB connect
├── routes/             # Route definitions
├── controllers/        # Endpoint handlers + validation rules
├── services/           # Business logic (authentication, user ops)
├── models/             # Mongoose schemas/models
└── routes/__test__/    # Jest tests
```

---

## 7. Testing

```bash
cd auth
npm test
```

Test files are located in `src/routes/__test__/`.

---

## 8. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/auth-depl.yaml` | Deployment (`nguyennoah/auth-ttshop`) |
| `infra/k8s/auth-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/auth-mongo.yaml` | MongoDB instance |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `MONGO_URL` | `mongodb://auth-mongo-service:27017/app` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` |

---

## 9. Notes

- MongoDB for auth uses a **PersistentVolumeClaim** (`ReadWriteOnce`, default StorageClass). Data survives pod restarts; removing the PVC or namespace deletes the data.
- The auth service does **not** connect to NATS; it has no event publishers or listeners.
- Only `customer` role signup is exposed. There is no admin or employee registration endpoint.
- Cookie-session is configured with `secure: false` for local development. For production, set `secure: true` with proper TLS/ingress.
