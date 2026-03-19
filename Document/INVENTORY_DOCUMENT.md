# Inventory Service Documentation

This document describes the architecture, APIs, events, and deployment of the Inventory microservice in TableTennisShop.

---

## 1. Overview

The Inventory service manages product stock levels. It tracks quantities, responds to product and order events, and publishes inventory change events for other services.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Messaging** | NATS Streaming |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `inventory/src` |
| **Default port** | `3004` |

---

## 2. Run Locally

```bash
cd inventory
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

## 3. API Endpoints

Base prefix: `/api/inventory`

### 3.1 Create Inventory

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/inventory` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `createInventoryValidator` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `product_id` | Required |
| `total_quantity` | Required, integer >= 0 |

**Request body:**

```json
{
  "product_id": "660abc...",
  "total_quantity": 100
}
```

**Success response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "_id": "660inv...",
    "product_id": "660abc...",
    "total_quantity": 100,
    "version": 0,
    "createdAt": "2026-03-17T07:00:00.000Z",
    "updatedAt": "2026-03-17T07:00:00.000Z"
  }
}
```

**Side effects:**
- Publishes `InventoryCreated` event via NATS.

**Error response (400) -- validation failure:**

```json
{
  "errors": [
    { "message": "Total quantity must be a positive integer", "details": "total_quantity" }
  ]
}
```

---

### 3.2 Get Inventory by Product ID

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/inventory/product/:id` |
| **Auth** | None |
| **Middleware** | None |

**Success response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "660inv...",
    "product_id": "660abc...",
    "total_quantity": 95,
    "version": 3
  }
}
```

---

### 3.3 Add Quantity

| Aspect | Detail |
|--------|--------|
| **Method** | `PATCH` |
| **Path** | `/api/inventory/:id/add` |
| **Auth** | None |
| **Middleware** | `addQuantityController` (validators only, see note below) |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `id` (param) | Required, valid MongoDB ObjectId |
| `quantity` | Required, integer >= 1 |

**Request body:**

```json
{
  "quantity": 50
}
```

**Success response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "660inv...",
    "product_id": "660abc...",
    "total_quantity": 150,
    "version": 4
  }
}
```

**Side effects:**
- Publishes `InventoryUpdated` event via NATS.

> **Note:** This endpoint defines validation rules but does **not** use `ValidateRequestMiddleware`, so validation errors from express-validator are not automatically converted to HTTP error responses.

---

### 3.4 Subtract Quantity

| Aspect | Detail |
|--------|--------|
| **Method** | `PATCH` |
| **Path** | `/api/inventory/:id/subtract` |
| **Auth** | None |
| **Middleware** | `subtractQuantityController` (validators only, see note below) |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `id` (param) | Required, valid MongoDB ObjectId |
| `quantity` | Required, integer >= 1 |

**Request body:**

```json
{
  "quantity": 5
}
```

**Success response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "660inv...",
    "product_id": "660abc...",
    "total_quantity": 145,
    "version": 5
  }
}
```

**Side effects:**
- Publishes `InventoryUpdated` event via NATS.

> **Note:** Same as Add Quantity -- validation rules are defined but `ValidateRequestMiddleware` is not applied.

---

### 3.5 Update Inventory

| Aspect | Detail |
|--------|--------|
| **Method** | `PUT` |
| **Path** | `/api/inventory/:id` |
| **Auth** | None |
| **Middleware** | `updateInventoryController` (validators only, see note below) |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `id` (param) | Required, valid MongoDB ObjectId |
| `quantity` | Required, integer >= 1 |
| `product_id` | Optional, valid MongoDB ObjectId |
| `total_quantity` | Optional, integer >= 0 |

**Request body:**

```json
{
  "quantity": 1,
  "total_quantity": 200
}
```

**Success response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "660inv...",
    "product_id": "660abc...",
    "total_quantity": 200,
    "version": 6
  }
}
```

> **Note:** Same as above -- validation rules are defined but `ValidateRequestMiddleware` is not applied.

---

## 4. Data Models

### 4.1 Inventory

**Collection:** `inventory`

| Field | Type | Constraints |
|-------|------|-------------|
| `product_id` | ObjectId | Reference to Product |
| `total_quantity` | Number | Current stock level |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

### 4.2 Import

**Collection:** `import`

Records each stock import batch with cost and supplier information.

| Field | Type | Constraints |
|-------|------|-------------|
| `product_id` | ObjectId | Reference to Product |
| `quantity` | Number | Number of units in this batch (min: 1) |
| `import_price` | Number | Cost per unit for this batch (min: 0) |
| `supplier` | String | Optional supplier name |
| `note` | String | Optional batch note (default: `''`) |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

### 4.3 ImportItem

**Collection:** `import_item`

Tracks each individual physical unit. Every item has a unique `item_code` (factory code or store-assigned).

| Field | Type | Constraints |
|-------|------|-------------|
| `import_id` | ObjectId | Reference to parent Import batch |
| `product_id` | ObjectId | Reference to Product (denormalized for query performance) |
| `item_code` | String | Unique identifier per physical unit |
| `import_price` | Number | Cost for this unit (min: 0) |
| `status` | String | Enum: `ImportItemStatusEnum` (`in_stock`, `sold`, `returned`) |
| `order_id` | ObjectId | Reference to Order (set when sold) |
| `sold_at` | Date | Timestamp when sold |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

**Indexes:**

- `{ product_id: 1, status: 1, createdAt: 1 }` — FIFO assignment queries
- `{ order_id: 1 }` — Release items on order cancellation
- `{ item_code: 1 }` — Unique index

### Design Notes

- **Inventory vs Import/ImportItem:** Inventory holds the running aggregate (`total_quantity`). Import/ImportItem hold the detailed per-batch and per-unit records. The invariant `Inventory.total_quantity == ImportItem.countDocuments({ product_id, status: 'in_stock' })` should always hold.
- **Serialized inventory:** All product types (rackets, sponges, shirts) are tracked as individual items. Rackets have factory codes; sponges and shirts get store-assigned codes at import time.
- **FIFO assignment:** When an order is created, items are auto-assigned from the oldest in-stock batch first (`createdAt ASC`).
- **Profit calculation:** Each sold item has a known `import_price`, so profit = selling price - item's `import_price` (exact, per unit).

---

## 5. Import API Endpoints

### 5.1 Create Import

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/inventory/import` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `createImportValidator` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `product_id` | Required, valid MongoDB ObjectId |
| `quantity` | Required, integer >= 1 |
| `import_price` | Required, float >= 0 |
| `item_codes` | Required, non-empty array |
| `item_codes.*` | Each must be a non-empty string |
| `supplier` | Optional, string |
| `note` | Optional, string |

**Request body:**

```json
{
  "product_id": "660abc...",
  "quantity": 3,
  "import_price": 12.50,
  "supplier": "Butterfly Japan",
  "note": "Spring 2026 batch",
  "item_codes": ["BTF-001", "BTF-002", "BTF-003"]
}
```

**Success response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "import": {
      "_id": "660imp...",
      "product_id": "660abc...",
      "quantity": 3,
      "import_price": 12.50,
      "supplier": "Butterfly Japan",
      "note": "Spring 2026 batch",
      "version": 0
    },
    "items": [
      { "_id": "660it1...", "import_id": "660imp...", "product_id": "660abc...", "item_code": "BTF-001", "import_price": 12.50, "status": "in_stock", "version": 0 },
      { "_id": "660it2...", "import_id": "660imp...", "product_id": "660abc...", "item_code": "BTF-002", "import_price": 12.50, "status": "in_stock", "version": 0 },
      { "_id": "660it3...", "import_id": "660imp...", "product_id": "660abc...", "item_code": "BTF-003", "import_price": 12.50, "status": "in_stock", "version": 0 }
    ]
  }
}
```

**Side effects:**
- Creates one `Import` document and N `ImportItem` documents.
- Increments `Inventory.total_quantity` by `quantity`.
- Publishes `ImportItemCreated` event for each item.
- Publishes `InventoryUpdated` event.

**Error responses:**
- `400` — `item_codes` length doesn't match `quantity`.
- `400` — Duplicate item codes found in database.

---

### 5.2 Get Imports by Product ID

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/inventory/import/product/:id` |

Returns all import batches for a product, sorted newest first.

---

### 5.3 Get Import Items by Product ID

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/inventory/import-items/product/:id` |

Returns all import items for a product (all statuses), sorted oldest first.

---

### 5.4 Get Available Items by Product ID

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/inventory/import-items/product/:id/available` |

Returns only `in_stock` items for a product, sorted oldest first (FIFO order).

---

## 6. Event Handling

### Publishers

| Publisher | Subject | Payload |
|-----------|---------|---------|
| `InventoryCreatedPublisher` | `inventory:created` | `{ _id, product_id, total_quantity, version }` |
| `InventoryUpdatedPublisher` | `inventory:updated` | `{ _id, product_id, total_quantity, version }` |
| `ImportItemCreatedPublisher` | `import-item:created` | `{ _id, import_id, product_id, item_code, import_price, status, version }` |
| `ImportItemUpdatedPublisher` | `import-item:updated` | `{ _id, import_id, product_id, item_code, import_price, status, order_id?, sold_at?, version }` |

### Listeners

| Listener | Subject | Behavior |
|----------|---------|----------|
| `OrderCreatedListener` | `order:created` | FIFO-assigns ImportItems as `sold` for each product, subtracts inventory quantity. Uses `Promise.all` for parallel processing across products. |
| `OrderCancelledListener` | `order:cancelled` | Releases ImportItems back to `in_stock` by `order_id`, adds inventory quantity back. |
| `ProductCreatedListener` | `product:created` | Creates an inventory record for the new product with `total_quantity: 0`. |

---

## 7. Project Structure

```
inventory/src/
├── app.ts              # Express app setup
├── index.ts            # Startup, env checks, MongoDB + NATS connect
├── NatsWrapper.ts      # NATS Streaming client singleton
├── routes/             # Route definitions
├── controller/         # Endpoint handlers + validation rules
│   ├── createInventory.controller.ts
│   ├── getInventoryByProductId.controller.ts
│   ├── addItem.controller.ts
│   ├── subjectItem.controller.ts
│   ├── updateInventory.controller.ts
│   ├── createImport.controller.ts
│   └── getImportItems.controller.ts
├── service/            # Business logic
│   ├── inventory.service.ts
│   └── import.service.ts
├── models/             # Mongoose schemas
│   ├── inventory.model.ts
│   ├── import.model.ts
│   └── import-item.model.ts
└── events/
    ├── listeners/      # NATS event listeners
    └── publisher/      # NATS event publishers
```

---

## 8. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/inventory-depl.yaml` | Deployment (`nguyennoah/inventory-ttshop`) |
| `infra/k8s/inventory-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/inventory-mongo.yaml` | MongoDB instance |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `MONGO_URL` | `mongodb://inventory-mongo-service:27017/app` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` |
| `NATS_CLUSTER_ID` | `ticketing` |
| `NATS_CLIENT_ID` | Pod metadata name |
| `NATS_URL` | `http://nats-svc:4222` |

---

## 9. Testing

```bash
cd inventory
npm test
```

Test files are located in `src/routes/__test__/`.

---

## 10. Risks and Recommendations

- Single replica with no autoscaling.
- MongoDB uses `emptyDir` (data lost on pod restart).
- No resource requests/limits defined.
- **Add, Subtract, and Update endpoints lack `ValidateRequestMiddleware`** -- validation rules are defined but never enforced. Invalid requests may pass through without proper error responses.
- No authentication middleware on GET, PATCH, and PUT endpoints -- any caller can modify inventory.
- JWT secret is hardcoded in the setup script.
