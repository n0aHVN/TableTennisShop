# Inventory Service Documentation

This document summarizes the architecture, APIs, events, and deployment of the Inventory microservice in TableTennisShop.

---

## 1. Purpose
Manages product inventory, tracks available quantities, and responds to product/order events.

---

## 2. API Endpoints

- `GET /api/inventory/product/:id` — Get inventory by product ID
- `PATCH /api/inventory/:id/add` — Add quantity to inventory
- `PATCH /api/inventory/:id/subtract` — Subtract quantity from inventory
- `PUT /api/inventory/:id` — Update inventory record
- `POST /api/inventory` — Create inventory (with validation)

---

## 3. Data Model

**Inventory**
- `product_id`: ObjectId (refers to Product)
- `total_quantity`: number
- `version`: number (optimistic concurrency)
- `createdAt`, `updatedAt`: Date

---

## 4. Event Handling

### Listeners
- **OrderCreatedListener**: Subtracts inventory for each product in an order
- **ProductCreatedListener**: Creates inventory record for new product

### Publishers
- **InventoryCreatedPublisher**: Publishes inventory creation event
- **InventoryUpdatedPublisher**: Publishes inventory update event

### Event Subjects
- `OrderCreated`, `ProductCreated`, `InventoryCreated`, `InventoryUpdated` (from @tabletennisshop/common)

---

## 5. Deployment & Environment

### Kubernetes Manifests
- `infra/k8s/inventory-depl.yaml` — Deployment
- `infra/k8s/inventory-clusterIP.yaml` — Service
- `infra/k8s/inventory-mongo.yaml` — MongoDB

**Deployment config:**
- Image: `nguyennoah/inventory-ttshop`
- Replicas: 1
- Env:
  - `NATS_CLUSTER_ID=ticketing`
  - `NATS_CLIENT_ID` (pod name)
  - `NATS_URL=http://nats-svc:4222`
  - `JWT_KEY` (from secret)
  - `MONGO_URL=mongodb://inventory-mongo-service:27017/app`

**Service config:**
- Port: 3000
- Selector: `app: inventory`

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
