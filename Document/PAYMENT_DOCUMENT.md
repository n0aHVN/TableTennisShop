# Payment Service Documentation

This document summarizes the architecture, APIs, events, and deployment of the Payment microservice in TableTennisShop.

---

## 1. Purpose
Handles payment creation and updates order status upon successful payment.

---

## 2. API Endpoints

- `POST /api/payments` — Create payment (with validation)

---

## 3. Data Model

**Payment**
- `user_id`: ObjectId (refers to User)
- `order_id`: ObjectId (refers to Order)
- `version`: number (optimistic concurrency)
- `createdAt`, `updatedAt`: Date

---

## 4. Event Handling

### Listeners
- **OrderCreatedListener**: Handles order creation events
- **OrderCancelledListener**: Handles order cancellation events
- **OrderUpdatedListener**: Handles order update events

### Publishers
- **PaymentCreatedPublisher**: Publishes payment creation event

### Event Subjects
- `PaymentCreated`, `OrderCreated`, `OrderCancelled`, `OrderUpdated` (from @tabletennisshop/common)

---

## 5. Deployment & Environment

### Kubernetes Manifests
- `infra/k8s/payment-depl.yaml` — Deployment
- `infra/k8s/payment-clusterIP.yaml` — Service
- `infra/k8s/payment-mongo.yaml` — MongoDB

**Deployment config:**
- Image: `nguyennoah/payment-ttshop`
- Replicas: 1
- Env:
  - `NATS_CLUSTER_ID=ticketing`
  - `NATS_CLIENT_ID` (pod name)
  - `NATS_URL=http://nats-svc:4222`
  - `JWT_KEY` (from secret)
  - `MONGO_URL=mongodb://payment-mongo-service:27017/app`

**Service config:**
- Port: 3000
- Selector: `app: payment`

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
