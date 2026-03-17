# Order Service Documentation

This document summarizes the architecture, APIs, events, and deployment of the Order microservice in TableTennisShop.

---

## 1. Purpose
Manages customer orders, tracks status, handles expiration, and coordinates with payment and inventory.

---

## 2. API Endpoints

- `GET /api/orders` — List all orders for current user
- `GET /api/orders/:id` — Get order by ID
- `PATCH /api/orders/:id` — Update order (with validation)
- `POST /api/orders` — Create order (with validation)

---

## 3. Data Model

**Order**
- `user_id`: ObjectId (refers to User)
- `products`: Array of `{ product_id, price, quantity }`
- `status`: OrderStatusEnum (e.g., CREATED, FINISHED, CANCELLED)
- `payment_method`: PaymentMethodEnum
- `total_price`: number
- `expiresAt`: Date
- `version`: number (optimistic concurrency)

---

## 4. Event Handling

### Listeners
- **PaymentCreatedListener**: Marks order as FINISHED when payment is completed
- **OrderExpiredCompleteListener**: Cancels order if expired and not finished, publishes OrderCancelled event
- **InventoryCreatedListener**: Handles inventory creation events
- **InventoryUpdatedListener**: Handles inventory update events
- **ProductCreatedListener**: Handles product creation events
- **ProductUpdatedListener**: Handles product update events

### Publishers
- **OrderCreatedPublisher**: Publishes order creation event
- **OrderCancelledPublisher**: Publishes order cancellation event
- **OrderUpdatedPublisher**: Publishes order update event

### Event Subjects
- `OrderCreated`, `OrderCancelled`, `OrderUpdated`, `OrderExpired`, `PaymentCreated`, `InventoryCreated`, `InventoryUpdated`, `ProductCreated`, `ProductUpdated` (from @tabletennisshop/common)

---

## 5. Deployment & Environment

### Kubernetes Manifests
- `infra/k8s/order-depl.yaml` — Deployment
- `infra/k8s/order-clusterIP.yaml` — Service
- `infra/k8s/order-mongo.yaml` — MongoDB

**Deployment config:**
- Image: `nguyennoah/order-ttshop`
- Replicas: 1
- Env:
  - `NATS_CLUSTER_ID=ticketing`
  - `NATS_CLIENT_ID` (pod name)
  - `NATS_URL=http://nats-svc:4222`
  - `JWT_KEY` (from secret)
  - `MONGO_URL=mongodb://order-mongo-service:27017/app`

**Service config:**
- Port: 3000
- Selector: `app: order`

---

## 6. Dependencies
- MongoDB (non-persistent, `emptyDir`)
- NATS Streaming (event bus)
- JWT secret (Kubernetes secret)

---

## 7. Risks & Recommendations
- Single replica, no autoscaling
- MongoDB data not persistent
- No resource limits
- JWT secret is hardcoded in setup

---

## 8. Quick Validation Checklist
- API routes match business requirements
- Event listeners/publishers are implemented
- Deployment manifests present and correct
- Service exposes port 3000
- MongoDB and NATS dependencies configured
