# Infrastructure Documentation

This document describes the Kubernetes infrastructure, secret management, ingress routing, and deployment orchestration for TableTennisShop.

---

## 1. Overview

| Aspect | Detail |
|--------|--------|
| **Orchestration** | Kubernetes (Docker Desktop or minikube) |
| **Dev tooling** | Skaffold (`skaffold/v4beta9`) |
| **Manifests** | `infra/k8s/` |
| **TLS certs** | `infra/keys/localhost.pem`, `infra/keys/localhost-key.pem` |
| **Secret setup** | `infra/secret.bat` |
| **Common package updater** | `updateCommonPackage.bat` |

---

## 2. Kubernetes Resources

### 2.1 Core Platform Services

#### NATS Streaming

| Manifest | Detail |
|----------|--------|
| `infra/k8s/nats-depl.yaml` | Deployment: `nats-streaming:0.17.0` |
| `infra/k8s/nats-clusterIP.yaml` | ClusterIP service: `nats-svc` |

| Port | Purpose |
|------|---------|
| `4222` | Client connections |
| `8222` | Monitoring |

Cluster ID: `ticketing`

---

### 2.2 Business Microservices

Each service has a deployment and a ClusterIP service manifest:

| Service | Deployment | ClusterIP | Image |
|---------|-----------|-----------|-------|
| Auth | `auth-depl.yaml` | `auth-clusterIP.yaml` | `nguyennoah/auth-ttshop` |
| Product | `product-depl.yaml` | `product-clusterIP.yaml` | `nguyennoah/product-ttshop` |
| Order | `order-depl.yaml` | `order-clusterIP.yaml` | `nguyennoah/order-ttshop` |
| Payment | `payment-depl.yaml` | `payment-clusterIP.yaml` | `nguyennoah/payment-ttshop` |
| Inventory | `inventory-depl.yaml` | `inventory-clusterIP.yaml` | `nguyennoah/inventory-ttshop` |
| Expiration | `expiration-depl.yaml` | `expiration-clusterIP.yaml` | `nguyennoah/expiration-ttshop` |

**Common runtime settings across all services:**
- Container port: `3000`
- `JWT_KEY` loaded from Kubernetes secret `jwt-secret`

**NATS-connected services** (all except Auth) also receive:
- `NATS_CLUSTER_ID=ticketing`
- `NATS_URL=http://nats-svc:4222`
- `NATS_CLIENT_ID` from pod metadata name

**Service-specific dependencies:**

| Service | Database | Other |
|---------|----------|-------|
| Auth | `auth-mongo-service` | -- |
| Product | `product-mongo-service` | NATS |
| Order | `order-mongo-service` | NATS |
| Payment | `payment-mongo-service` | NATS |
| Inventory | `inventory-mongo-service` | NATS |
| Expiration | -- | NATS, Redis (`expiration-redis-svc`) |

---

### 2.3 Data Stores

#### MongoDB Instances

One MongoDB deployment per domain service:

| Manifest | Service Name |
|----------|-------------|
| `auth-mongo.yaml` | `auth-mongo-service` |
| `product-mongo.yaml` | `product-mongo-service` |
| `order-mongo.yaml` | `order-mongo-service` |
| `payment-mongo.yaml` | `payment-mongo-service` |
| `inventory-mongo.yaml` | `inventory-mongo-service` |

> All MongoDB deployments use `emptyDir` volumes. Data is **not persistent** across pod restarts.

#### Redis

| Manifest | Purpose |
|----------|---------|
| `expiration-redis-deployment.yaml` | Redis `redis:6.0.3-alpine` |
| `expiration-redis-clusterIP.yaml` | ClusterIP service: `expiration-redis-svc` (port 6379) |

---

### 2.4 Ingress Routing

**Manifest:** `infra/k8s/ingress-clusterIP.yaml`

| Setting | Value |
|---------|-------|
| Ingress class | `nginx` |
| Host | `localhost` |
| TLS | Block exists but is commented out |

**Path routing:**

| Path Prefix | Backend Service | Port |
|-------------|----------------|------|
| `/api/users` | `auth-service` | 3000 |
| `/api/products` | `product-service` | 3000 |
| `/api/orders` | `order-service` | 3000 |
| `/api/inventory` | `inventory-service` | 3000 |
| `/api/payments` | `payment-service` | 3000 |

---

## 3. Secret Management

**Script:** `infra/secret.bat`

```bat
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=secretKey
```

| Setting | Value |
|---------|-------|
| Secret name | `jwt-secret` |
| Key | `JWT_KEY` |
| Used by | All services (auth, product, order, payment, inventory, expiration) |

> **Recommendation:** Replace plain-text inline secret creation with a secure secret management solution (e.g., external secret manager or sealed secrets).

---

## 4. Deployment Flow (Skaffold)

**File:** `skaffold.yaml` (API version: `skaffold/v4beta9`)

### Docker Images Built

| Image | Source |
|-------|--------|
| `nguyennoah/auth-ttshop` | `auth/` |
| `nguyennoah/product-ttshop` | `product/` |
| `nguyennoah/payment-ttshop` | `payment/` |
| `nguyennoah/order-ttshop` | `order/` |
| `nguyennoah/inventory-ttshop` | `inventory/` |
| `nguyennoah/expiration-ttshop` | `expiration/` |

### Typical Local Development Flow

1. Create JWT secret: `infra/secret.bat`
2. Ensure ingress controller is available in the local cluster
3. Run Skaffold: `skaffold dev`
4. Access APIs through ingress host (`localhost`)

Skaffold applies all manifests from `infra/k8s/`, including NATS files and a wildcard include.

---

## 5. Utility Scripts

### `updateCommonPackage.bat`

Clears npm cache and updates `@tabletennisshop/common` in all backend services. Run this before image rebuilds to ensure shared package consistency.

### `infra/secret.bat`

Creates the `jwt-secret` Kubernetes secret. Run once per cluster setup.

---

## 6. Gaps and Risks

| Risk | Impact |
|------|--------|
| TLS disabled in ingress (commented out) | Traffic is unencrypted |
| JWT secret value is hardcoded in `secret.bat` | Security vulnerability |
| MongoDB uses non-persistent `emptyDir` volumes | Data loss on pod restart |
| All workloads run as single replica | No high availability |
| No resource requests/limits in manifests | Risk of resource contention |
| Ingress host hardcoded to `localhost` | Local development only |
| No health check / readiness probes | K8s cannot detect unhealthy pods |
| No horizontal pod autoscaler (HPA) | Cannot scale under load |
