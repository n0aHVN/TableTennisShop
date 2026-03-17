# Auth Service Document

## 1. Overview
The Auth service is responsible for user registration, login, logout, and returning the currently authenticated user.

Main stack:
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Cookie session for storing JWT
- Shared package: `@tabletennisshop/common`

Source location:
- `auth/src`

## 2. Run Locally
From the `auth` folder:

```bash
npm install
npm run start
```

Service default port:
- `3000`

Required environment variables:
- `MONGO_URL`: MongoDB connection string
- `JWT_KEY`: Secret key used to sign JWT

## 3. Request Flow
1. Client calls signup/signin API.
2. On successful signin, service creates JWT and saves it to `req.session.jwt`.
   - **JWT Payload:**
     - `_id`: User's MongoDB ObjectId
     - `email`: User's email
   - This JWT is stored in the session cookie and used for authentication.
3. Browser sends cookie in next requests.
4. `CurrentUserMiddleware` reads cookie JWT and sets `req.currentUser`.
5. Protected endpoints can use `req.currentUser`.

## 4. API Endpoints
Base prefix: `/api/users`

### 4.1 Health Check
- Method: `GET`
- Path: `/api/users/hello`
- Description: Basic test endpoint

Response example:
```text
HelloWorld
```

### 4.2 Signup
- Method: `POST`
- Path: `/api/users/signup`
- Description: Register a new client user

Request body:
```json
{
  "username": "john123",
  "email": "john@example.com",
  "password": "123456",
  "full_name": "John Smith",
  "address": "123 Main St"
}
```

Validation rules:
- `username`: required, length 4-100
- `email`: required, valid email
- `password`: required, length 4-20
- `full_name`: required
- `address`: required

Success response:
```json
{
  "statusCode": 201,
  "message": "User is successfully created",
  "success": true
}
```

### 4.3 Signin
- Method: `POST`
- Path: `/api/users/signin`
- Description: Authenticate user and set session cookie

Request body:
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

Validation rules:
- `email`: required
- `password`: required, length 4-20

Behavior:
- If credentials are valid, returns `200` and stores JWT in cookie session.
- If invalid, returns error (from shared error middleware).

Success response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User signed in successfully"
}
```

### 4.4 Current User
- Method: `GET`
- Path: `/api/users/currentuser`
- Middleware: `CurrentUserMiddleware`
- Description: Return currently authenticated user data

Success response:
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

Possible errors:
- Unauthorized if no valid token
- User not found

### 4.5 Signout
- Method: `GET`
- Path: `/api/users/signout`
- Description: Clear session cookie and current user data

Success response:
```json
{
  "statusCode": 200,
  "message": "Successfully signed out",
  "success": true
}
```

## 5. Data Model
Mongo collection: `user`

User fields:
- `username` (unique)
- `email` (unique)
- `password` (hashed in pre-save hook)
- `full_name`
- `address`
- `type` (enum from shared `UserEnum`)
- `status` (enum from shared `UserStatusEnum`)
- `createdAt`, `updatedAt` (timestamps)

Notes:
- Password is hashed before saving.
- Email uniqueness is checked before save.

## 6. Project Structure (Auth)
- `src/app.ts`: Express app setup and middleware
- `src/index.ts`: Startup logic, env checks, Mongo connect
- `src/routes`: Route definitions
- `src/controllers`: Endpoint handlers + validation rules
- `src/services`: Business logic (authentication, user operations)
- `src/models`: Mongoose schemas/models
- `src/test`: Test setup

## 7. Testing
From `auth` folder:

```bash
npm test
```

Existing test location:
- `src/routes/__test__`

## 8. Notes for Production
Current app config uses:
- `cookie-session` with `secure: false`

For HTTPS production deployment, use secure cookies (`secure: true`) and proper ingress/TLS setup.
