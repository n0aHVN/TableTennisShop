# Payment Service Documentation

> **Taxonomy:** `Document/04-services/` · Security controls: [../03-security/SECURITY_BASELINE.md](../03-security/SECURITY_BASELINE.md) · Index: [../README.md](../README.md)

This document describes the architecture, APIs, events, and deployment of the Payment microservice in TableTennisShop.

**Control reminder:** do not store raw PAN/CVV; payment gaps (PSP, refund, reconciliation) are tracked in the Security Baseline.

---

## 1. Overview

The Payment service handles payment creation for orders. It listens for order lifecycle events and publishes payment events to notify other services when a payment is completed.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Messaging** | NATS Streaming |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `payment/src` |
| **Default port** | `3003` |

---

## 2. Run Locally

```bash
cd payment
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

Base prefix: `/api/payments`

### 3.1 Create Payment

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **Path** | `/api/payments` |
| **Auth** | Cookie session (JWT) |
| **Middleware** | `CheckAuthorizedMiddleware` → `CurrentUserMiddleware` → `createPaymentValidator` → `ValidateRequestMiddleware` |

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `order_id` | Required, valid MongoDB ObjectId |
| `status` | Required, must be one of: `pending`, `completed`, `failed` |

**Request body:**

```json
{
  "order_id": "660abc...",
  "status": "completed"
}
```

> The `status` field is validated but the service primarily uses `order_id` to create the payment record. The `user_id` is extracted from the authenticated session.

**Success response (201):**

```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "_id": "660pay...",
    "user_id": "660def...",
    "order_id": "660abc...",
    "version": 0,
    "createdAt": "2026-03-17T07:00:00.000Z",
    "updatedAt": "2026-03-17T07:00:00.000Z"
  }
}
```

**Side effects:**
- Publishes `PaymentCreated` event via NATS, which triggers the order service to mark the order as `FINISHED`.

**Error response (400) -- validation failure:**

```json
{
  "errors": [
    { "message": "Invalid order ID", "details": "order_id" }
  ]
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

## 4. Data Model

**Collection:** `payment`

| Field | Type | Constraints |
|-------|------|-------------|
| `user_id` | ObjectId | Reference to User |
| `order_id` | ObjectId | Reference to Order |
| `version` | Number | Optimistic concurrency control |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

---

## 5. Event Handling

### Publishers

| Publisher | Subject | Payload |
|-----------|---------|---------|
| `PaymentCreatedPublisher` | `payment:created` | `{ _id, order_id, user_id }` |

### Listeners

| Listener | Subject | Behavior |
|----------|---------|----------|
| `OrderCreatedListener` | `order:created` | Stores order data locally for reference |
| `OrderCancelledListener` | `order:cancelled` | Updates local order status |
| `OrderUpdatedListener` | `order:updated` | Updates local order data |

### Payment Flow

```
1. User creates a payment (POST /api/payments)
2. Payment service creates a Payment record
3. PaymentCreatedPublisher sends "payment:created" event
4. Order service's PaymentCreatedListener marks the order as FINISHED
```

---

## 6. Project Structure

```
payment/src/
├── app.ts              # Express app setup
├── index.ts            # Startup, env checks, MongoDB + NATS connect
├── NatsWrapper.ts      # NATS Streaming client singleton
├── routes/             # Route definitions
├── controllers/        # Endpoint handlers + validation rules
├── services/           # Business logic (PaymentService)
├── models/             # Mongoose schemas (Payment, Order)
└── events/
    ├── listeners/      # NATS event listeners
    └── publishers/     # NATS event publishers
```

---

## 7. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/payment-depl.yaml` | Deployment (`nguyennoah/payment-ttshop`) |
| `infra/k8s/payment-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/payment-mongo.yaml` | MongoDB instance |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `MONGO_URL` | `mongodb://payment-mongo-service:27017/app` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` |
| `NATS_CLUSTER_ID` | `ticketing` |
| `NATS_CLIENT_ID` | Pod metadata name |
| `NATS_URL` | `http://nats-svc:4222` |

---

## 8. Testing

```bash
cd payment
npm test
```

Test files are located in `src/routes/__test__/`.

---

## 9. Risks and Recommendations

- Single replica with no autoscaling.
- MongoDB uses a **PersistentVolumeClaim** (`ReadWriteOnce`); data survives pod restarts unless the PVC or namespace is deleted.
- No resource requests/limits defined.
- No actual payment gateway integration (e.g., Stripe) -- payment is recorded directly.
- The `status` field in the request body is validated but not persisted on the Payment model.
- JWT secret is hardcoded in the setup script.
