# Product Service Documentation

This document summarizes the architecture, APIs, events, and deployment of the Product microservice in TableTennisShop.

---

## 1. Purpose
Manages product catalog, including creation, update, and retrieval of products.

---

## 2. API Endpoints

- `GET /api/products/:slug` — Get product by slug
- `GET /api/products` — List/paginate all products
- `POST /api/products` — Create product (with validation)
- `PUT /api/products/:id` — Update product (with validation)

---

## 3. Data Model

**Product**
- `name`: string
- `slug`: string (unique, auto-generated)
- `brand`: string
- `description`: string
- `type`: ProductTypeEnum (discriminator key)
- `sport`: string
- `attributes`: array (optional)
- `status`: ProductStatusEnum (default OUT_OF_STOCK)
- `price`: number
- `version`: number (optimistic concurrency)
- `createdAt`, `updatedAt`: Date

---

## 4. Event Handling

### Listeners
- **InventoryCreatedListener**: Handles inventory creation events
- **InventoryUpdatedListener**: Handles inventory update events

### Publishers
- **ProductCreatedPublisher**: Publishes product creation event
- **ProductUpdatePublisher**: Publishes product update event

### Event Subjects
- `ProductCreated`, `ProductUpdated`, `InventoryCreated`, `InventoryUpdated` (from @tabletennisshop/common)

---

## 5. Deployment & Environment

### Kubernetes Manifests
- `infra/k8s/product-depl.yaml` — Deployment
- `infra/k8s/product-clusterIP.yaml` — Service
- `infra/k8s/product-mongo.yaml` — MongoDB

**Deployment config:**
- Image: `nguyennoah/product-ttshop`
- Replicas: 1
- Env:
  - `NATS_CLUSTER_ID=ticketing`
  - `NATS_CLIENT_ID` (pod name)
  - `NATS_URL=http://nats-svc:4222`
  - `JWT_KEY` (from secret)
  - `MONGO_URL=mongodb://product-mongo-service:27017/app`

**Service config:**
- Port: 3000
- Selector: `app: product`

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
