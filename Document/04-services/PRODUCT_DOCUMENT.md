# Product Service Documentation

> **Taxonomy:** `Document/04-services/` · Index: [../README.md](../README.md)


This document describes the architecture, APIs, events, and deployment of the Product microservice in TableTennisShop.

---

## 1. Overview

The Product service manages the product catalog, including creation, update, retrieval, and paginated listing of products. It publishes events on product changes and listens for inventory updates.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Messaging** | NATS Streaming |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `product/src` |
| **Default port** | `3002` |

---

## 2. Run Locally

```bash
cd product
npm install
npm run start
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_KEY` | Secret key for JWT verification |
| `NATS_CLUSTER_ID` | NATS Streaming cluster ID |
| `NATS_CLIENT_ID` | Unique NATS client identifier |
| `NATS_URL` | NATS Streaming server URL |

---

## 3. Product Types

Products use a discriminator pattern based on `ProductTypeEnum`:

| Type | Value | Description |
|------|-------|-------------|
| `RACKET` | `racket` | Table tennis rackets |
| `SHIRT` | `shirt` | Sportswear / shirts |
| `SPONGE` | `sponge` | Rubber/sponge sheets |

---

## 4. API Endpoints

Base prefix: `/api/products`

### 4.1 List Products (Paginated)

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/products` |
| **Auth** | None |
| **Middleware** | None |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `limit` | int | `10` | Items per page |

**Success response (200):**

```json
{
  "data": [
    {
      "_id": "660abc...",
      "name": "Butterfly Timo Boll ALC",
      "slug": "butterfly-timo-boll-alc",
      "brand": "Butterfly",
      "description": "Professional blade",
      "type": "racket",
      "sport": "table-tennis",
      "attributes": {},
      "status": "enable",
      "price": 159.99,
      "version": 0,
      "createdAt": "2026-03-17T07:00:00.000Z",
      "updatedAt": "2026-03-17T07:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10
}
```

**Pagination logic:** Uses `skip((page - 1) * limit).limit(limit)` on MongoDB queries.

---

### 4.2 Get Product by Slug

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/products/:slug` |
| **Auth** | None |
| **Middleware** | None |

**Success response (200):**

```json
{
  "product": {
    "_id": "660abc...",
    "name": "Butterfly Timo Boll ALC",
    "slug": "butterfly-timo-boll-alc",
    "brand": "Butterfly",
    "description": "Professional blade",
    "type": "racket",
    "sport": "table-tennis",
    "attributes": {},
    "status": "enable",
    "price": 159.99,
    "version": 0
  }
}
```

---

### 4.3 Create Product

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/products` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `addProductValidation` â†’ `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `name` | Required, string |
| `slug` | Required, string |
| `brand` | Required, string |
| `description` | Optional, string |
| `type` | Required, string, must be one of `ProductTypeEnum` (`racket`, `shirt`, `sponge`) |
| `attributes` | Required, must be a JSON object (not an array) |
| `price` | Required, numeric |
| `status` | Optional; if present, must be `enable`, `disable`, or `out_of_stock` |

**Request body:**

```json
{
  "name": "Butterfly Timo Boll ALC",
  "slug": "butterfly-timo-boll-alc",
  "brand": "Butterfly",
  "description": "Professional blade with arylate carbon",
  "type": "racket",
  "attributes": {
    "weight": "86g",
    "layers": "7"
  },
  "price": 159.99
}
```

**Success response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "_id": "660abc...",
    "name": "Butterfly Timo Boll ALC",
    "slug": "butterfly-timo-boll-alc",
    "brand": "Butterfly",
    "type": "racket",
    "status": "out_of_stock",
    "price": 159.99,
    "version": 0
  }
}
```

**Side effects:**
- Publishes `ProductCreated` event via NATS.

**Error response (400) -- validation failure:**

```json
{
  "errors": [
    { "message": "Type must be one of: racket, shirt, sponge", "details": "type" }
  ]
}
```

> New products are created with `status: ProductStatusEnum.OUT_OF_STOCK` by default.

---

### 4.4 Update Product

| Aspect | Detail |
|--------|--------|
| **Method** | `PUT` |
| **Path** | `/api/products/:id` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `putProductValidation` â†’ `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `id` (param) | Required, valid MongoDB ObjectId |
| `version` | Required, numeric (optimistic concurrency) |
| `status` | Optional; if present, must be `enable`, `disable`, or `out_of_stock` |

**Request body:**

```json
{
  "version": 0,
  "price": 149.99,
  "status": "enable",
  "description": "Updated description"
}
```

The `version` field is required for optimistic concurrency control. Any other product fields can be included for update.

**Success response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "660abc...",
    "name": "Butterfly Timo Boll ALC",
    "price": 149.99,
    "status": "enable",
    "version": 1
  }
}
```

**Side effects:**
- Publishes `ProductUpdated` event via NATS.

---

## 5. Data Model

**Collection:** `product`

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required |
| `slug` | String | Required, unique, auto-generated |
| `brand` | String | Required |
| `description` | String | Optional |
| `type` | String | Enum: `ProductTypeEnum` (`racket`, `shirt`, `sponge`). Discriminator key |
| `sport` | String | Optional |
| `attributes` | Object (JSON) | Optional in DB; default `{}`. Arbitrary key-value specs |
| `status` | String | Enum: `ProductStatusEnum` (`enable`, `disable`, `out_of_stock`). Default: `out_of_stock` |
| `price` | Number | Required |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

**Product Status Values** (`ProductStatusEnum`):

| Status | Value | Description |
|--------|-------|-------------|
| `ENABLE` | `enable` | Product is active and visible |
| `DISABLE` | `disable` | Product is hidden/disabled |
| `OUT_OF_STOCK` | `out_of_stock` | Default for new products |

---

## 6. Event Handling

### Publishers

| Publisher | Subject | Payload |
|-----------|---------|---------|
| `ProductCreatedPublisher` | `product:created` | `{ _id, status, price, version }` |
| `ProductUpdatePublisher` | `product:updated` | `{ _id, status, price, version }` |

### Listeners

| Listener | Subject | Behavior |
|----------|---------|----------|
| `InventoryCreatedListener` | `inventory:created` | Syncs inventory data for a product |
| `InventoryUpdatedListener` | `inventory:updated` | Updates local inventory data |

---

## 7. Project Structure

```
product/src/
â”œâ”€â”€ app.ts              # Express app setup
â”œâ”€â”€ index.ts            # Startup, env checks, MongoDB + NATS connect
â”œâ”€â”€ NatsWrapper.ts      # NATS Streaming client singleton
â”œâ”€â”€ routes/             # Route definitions
â”œâ”€â”€ controller/         # Endpoint handlers + validation rules
â”œâ”€â”€ services/           # Business logic (ProductService)
â”œâ”€â”€ models/             # Mongoose schemas
â”œâ”€â”€ utils/              # Pagination utility
â””â”€â”€ events/
    â”œâ”€â”€ listeners/      # NATS event listeners
    â””â”€â”€ publishers/     # NATS event publishers
```

---

## 8. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/product-depl.yaml` | Deployment (`nguyennoah/product-ttshop`) |
| `infra/k8s/product-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/product-mongo.yaml` | MongoDB instance |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `MONGO_URL` | `mongodb://product-mongo-service:27017/app` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` |
| `NATS_CLUSTER_ID` | `ticketing` |
| `NATS_CLIENT_ID` | Pod metadata name |
| `NATS_URL` | `http://nats-svc:4222` |

---

## 9. Testing

```bash
cd product
npm test
```

Test files are located in `src/routes/__test__/`.

---

## 10. Risks and Recommendations

- Single replica with no autoscaling.
- MongoDB uses a **PersistentVolumeClaim** (`ReadWriteOnce`); data survives pod restarts unless the PVC or namespace is deleted. Product images use MinIO (`minio-srv`); see `Document/02-architecture/INFRA_DOCUMENT.md`.
- No resource requests/limits defined.
- Slug uniqueness is enforced but there is no auto-slug generation from the product name.
- `description` is optional in validation but may be expected by the frontend.
