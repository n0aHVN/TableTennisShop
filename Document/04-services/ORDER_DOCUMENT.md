# Order Service Documentation

> **Taxonomy:** `Document/04-services/` · FRD: [../01-business/FRD.md](../01-business/FRD.md) · Events: [../02-architecture/EVENT_ARCHITECTURE.md](../02-architecture/EVENT_ARCHITECTURE.md) · Index: [../README.md](../README.md)

This document describes the architecture, APIs, events, analytics, and deployment of the Order microservice in TableTennisShop.

---

## 1. Overview

The Order service manages customer orders, tracks status through the order lifecycle, handles expiration, coordinates with payment and inventory via NATS events, and provides analytics endpoints for dashboards.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Messaging** | NATS Streaming |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `order/src` |
| **Default port** | `3001` |

---

## 2. Run Locally

```bash
cd order
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

## 3. Order Lifecycle

Orders follow this lifecycle:

```
PENDING ──→ FINISHED     (payment received)
   │
   ├──→ EXPIRED          (expiration timer fires)
   │
   └──→ CANCELLED        (expired + not finished → auto-cancelled)
```

**Expiration window:** Orders expire **60 seconds** (1 minute) after creation. The `expiresAt` field is set as `Date.now() + 60000ms`.

**Status values** (`OrderStatusEnum`):

| Status | Value | Description |
|--------|-------|-------------|
| `PENDING` | `pending` | Newly created, awaiting payment |
| `FINISHED` | `finished` | Payment completed successfully |
| `EXPIRED` | `expired` | Expiration timer fired |
| `CANCELLED` | `cancelled` | Cancelled after expiration |

---

## 4. API Endpoints -- Orders

Base prefix: `/api/orders`

### 4.1 List Orders

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/orders` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` |

**Success response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "660abc...",
      "user_id": "660def...",
      "products": [
      { "product_id": "660ghi...", "price": 45.99, "quantity": 2, "item_codes": [] }
    ],
    "status": "pending",
    "payment_method": "cod",
    "total_price": 91.98,
    "expiresAt": "2026-03-17T07:01:00.000Z",
    "version": 0
    }
  ]
}
```

---

### 4.2 Get Order by ID

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/orders/:id` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` |

**Success response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "660abc...",
    "user_id": "660def...",
    "products": [
      { "product_id": "660ghi...", "price": 45.99, "quantity": 2, "item_codes": ["SP-001", "SP-002"] }
    ],
    "status": "pending",
    "payment_method": "cod",
    "total_price": 91.98,
    "expiresAt": "2026-03-17T07:01:00.000Z",
    "version": 0
  }
}
```

---

### 4.3 Create Order

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/orders` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` → `createOrderValidator` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `products` | Required, must be an array |
| `payment_method` | Required, must be one of `PaymentMethodEnum` (`banking`, `cod`) |
| `total_price` | Required, must be numeric |

**Request body:**

```json
{
  "products": [
    { "product_id": "660ghi...", "price": 45.99, "quantity": 2 }
  ],
  "payment_method": "cod",
  "total_price": 91.98
}
```

**Success response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "_id": "660abc...",
    "user_id": "660def...",
    "products": [
      { "product_id": "660ghi...", "price": 45.99, "quantity": 2, "item_codes": [] }
    ],
    "status": "pending",
    "payment_method": "cod",
    "total_price": 91.98,
    "expiresAt": "2026-03-17T07:01:00.000Z",
    "version": 0
  }
}
```

**Side effects:**
- Publishes `OrderCreated` event via NATS.
- The expiration service picks up this event and schedules a delayed job.

**Error response (400) -- validation failure:**

```json
{
  "errors": [
    { "message": "Products must be an array", "details": "products" }
  ]
}
```

---

### 4.4 Update Order

| Aspect | Detail |
|--------|--------|
| **Method** | `PATCH` |
| **Path** | `/api/orders/:id` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` → `updateOrderValidator` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `id` (param) | Required |

**Request body:** Any subset of order fields to update.

**Success response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { "...updated order document..." }
}
```

---

## 5. API Endpoints -- Analytics

Base prefix: `/api/analytics`

All analytics endpoints require **owner** or **employee** role.

**Common middleware chain:** `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` → `CheckType(["owner", "employee"])` → query validators → `ValidateRequestMiddleware`

### Common Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateFrom` | ISO 8601 string | No | Start of date range |
| `dateTo` | ISO 8601 string | No | End of date range |

> If neither `dateFrom` nor `dateTo` is provided, defaults to the last 30 days. If only one is provided, returns `400 Bad Request`.

---

### 5.1 Order Statistics

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/orders/stats` |

**Additional query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `pending` \| `finished` \| `expired` \| `cancelled` | Filter by status |
| `customerId` | MongoDB ObjectId | Filter by customer |

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Order statistics retrieved successfully",
  "data": {
    "total": 150,
    "byStatus": {
      "pending": { "count": 30, "percentage": 20 },
      "finished": { "count": 100, "percentage": 66.7 },
      "expired": { "count": 10, "percentage": 6.7 },
      "cancelled": { "count": 10, "percentage": 6.7 }
    },
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

### 5.2 Revenue Analytics

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/orders/revenue` |

**Additional query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentMethod` | `banking` \| `cod` | Filter by payment method |
| `minAmount` | float (>= 0) | Minimum order amount |
| `maxAmount` | float (>= 0) | Maximum order amount |

> Revenue is calculated only from orders with status `FINISHED`.

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "totalRevenue": 15000.50,
    "orderCount": 100,
    "averageOrderValue": 150.01,
    "byPaymentMethod": {
      "cod": { "count": 60, "revenue": 9000 },
      "banking": { "count": 40, "revenue": 6000.50 }
    },
    "byDateRange": [
      { "date": "2026-03-15", "revenue": 500, "count": 5 },
      { "date": "2026-03-16", "revenue": 750, "count": 8 }
    ],
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

### 5.3 Order Timeline

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/orders/timeline` |

**Additional query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `interval` | `day` \| `week` \| `month` | `day` | Grouping interval |

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Order timeline retrieved successfully",
  "data": [
    { "period": "2026-03-15", "orderCount": 12, "revenue": 1500, "averageOrderValue": 125 },
    { "period": "2026-03-16", "orderCount": 8, "revenue": 920, "averageOrderValue": 115 }
  ],
  "success": true
}
```

Date format per interval: `day` → `YYYY-MM-DD`, `week` → `YYYY-WNN`, `month` → `YYYY-MM`.

---

### 5.4 Bestselling Products

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/products/bestsellers` |

**Additional query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int (1–100) | `10` | Number of top products |

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Bestsellers retrieved successfully",
  "data": {
    "products": [
      {
        "productId": "660ghi...",
        "orderCount": 45,
        "totalQuantity": 120,
        "totalRevenue": 5400,
        "averagePrice": 45,
        "lastOrderDate": "2026-03-17T06:30:00.000Z"
      }
    ],
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

### 5.5 Payment Method Analytics

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/payments/methods` |

**Additional query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentMethod` | `banking` \| `cod` | Filter by specific method |

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Payment method analytics retrieved successfully",
  "data": {
    "methods": {
      "cod": { "count": 60, "revenue": 9000, "percentage": 60 },
      "banking": { "count": 40, "revenue": 6000, "percentage": 40 }
    },
    "totalTransactions": 100,
    "totalRevenue": 15000,
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

### 5.6 Customer Metrics

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/customers/metrics` |

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Customer metrics retrieved successfully",
  "data": {
    "totalCustomers": 85,
    "newCustomers": 20,
    "repeatCustomers": 65,
    "averageOrdersPerCustomer": 1.8,
    "averageCustomerValue": 176.47,
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

### 5.7 Dashboard Summary

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **Path** | `/api/analytics/dashboard-summary` |

Aggregates all analytics into a single response. Calls `getOrderStats`, `getRevenueAnalytics`, `getBestsellers` (top 5), `getPaymentMethodAnalytics`, and `getCustomerMetrics` in parallel.

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "stats": { "...OrderStatsResponse..." },
    "revenue": { "...RevenueAnalytics..." },
    "bestsellers": { "...BestsellersResponse..." },
    "paymentMethods": { "...PaymentMethodAnalytics..." },
    "customerMetrics": { "...CustomerMetrics..." },
    "dateRange": { "from": "2026-02-15", "to": "2026-03-17" }
  },
  "success": true
}
```

---

## 6. Data Model

**Collection:** `order`

| Field | Type | Constraints |
|-------|------|-------------|
| `user_id` | ObjectId | Reference to User |
| `products` | Array of `{ product_id, price, quantity, item_codes }` | Embedded |
| `status` | String | Enum: `OrderStatusEnum` (`pending`, `finished`, `expired`, `cancelled`) |
| `payment_method` | String | Enum: `PaymentMethodEnum` (`banking`, `cod`) |
| `total_price` | Number | Total order value |
| `expiresAt` | Date | Expiration timestamp (created + 60s) |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

---

## 7. Event Handling

### Publishers

| Publisher | Subject | Payload |
|-----------|---------|---------|
| `OrderCreatedPublisher` | `order:created` | `{ _id, user_id, products, status, payment_method, total_price, expiresAt, version }` |
| `OrderCancelledPublisher` | `order:cancelled` | `{ _id, user_id, products, status, payment_method, total_price, expiresAt, version }` |
| `OrderUpdatedPublisher` | `order:updated` | `{ _id, user_id, products, status, payment_method, total_price, expiresAt, version }` |

### Listeners

| Listener | Subject | Behavior |
|----------|---------|----------|
| `PaymentCreatedListener` | `payment:created` | Marks order as `FINISHED` |
| `OrderExpiredCompleteListener` | `order:expired` | If order is not `FINISHED`, cancels it and publishes `OrderCancelled` |
| `InventoryCreatedListener` | `inventory:created` | Syncs inventory data locally |
| `InventoryUpdatedListener` | `inventory:updated` | Updates local inventory data |
| `ProductCreatedListener` | `product:created` | Syncs product data locally |
| `ProductUpdatedListener` | `product:updated` | Updates local product data |
| `ImportItemCreatedListener` | `import-item:created` | Syncs ImportItem data locally (creates replica) |
| `ImportItemUpdatedListener` | `import-item:updated` | Updates local ImportItem status (sold/in_stock) |

---

### Replicated Models

The Order service maintains local replicas of data from other services, synced via events:

| Replica Model | Source Service | Fields |
|---------------|---------------|--------|
| Product | Product | `_id, status, price, version` |
| Inventory | Inventory | `_id, product_id, total_quantity, version` |
| ImportItem | Inventory | `_id, import_id, product_id, item_code, import_price, status, order_id?, sold_at?, version` |

---

## 8. Project Structure

```
order/src/
├── app.ts              # Express app setup
├── index.ts            # Startup, env checks, MongoDB + NATS connect
├── NatsWrapper.ts      # NATS Streaming client singleton
├── routes/             # Route definitions (order + analytics)
├── controller/         # Endpoint handlers + validation rules
├── services/           # Business logic + AnalyticsService
│   ├── order-service.ts
│   ├── inventory.service.ts
│   ├── product.service.ts
│   └── import-item.service.ts
├── models/             # Mongoose schemas
│   ├── order.model.ts
│   ├── product.model.ts
│   ├── inventory.model.ts
│   └── import-item.model.ts
└── events/
    ├── listeners/      # NATS event listeners
    └── publishers/     # NATS event publishers
```

---

## 9. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/order-depl.yaml` | Deployment (`nguyennoah/order-ttshop`) |
| `infra/k8s/order-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/order-mongo.yaml` | MongoDB instance |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `MONGO_URL` | `mongodb://order-mongo-service:27017/app` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` |
| `NATS_CLUSTER_ID` | `ticketing` |
| `NATS_CLIENT_ID` | Pod metadata name |
| `NATS_URL` | `http://nats-svc:4222` |

---

## 10. Testing

```bash
cd order
npm test
```

Test files are located in `src/routes/__test__/`.

---

## 11. Risks and Recommendations

- Single replica with no autoscaling.
- MongoDB uses a **PersistentVolumeClaim** (`ReadWriteOnce`); data survives pod restarts unless the PVC or namespace is deleted.
- No resource requests/limits defined.
- Order expiration window is very short (60 seconds) -- likely needs tuning for production.
- JWT secret is hardcoded in the setup script.
