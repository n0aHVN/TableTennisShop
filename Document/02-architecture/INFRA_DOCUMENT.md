# Infrastructure Documentation

> **Taxonomy:** `Document/02-architecture/` · Index: [../README.md](../README.md) · Ops: [../05-operations/RUNBOOK.md](../05-operations/RUNBOOK.md)

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

| Manifest | Service name | PVC (claim) | Size |
|----------|--------------|---------------|------|
| `auth-mongo.yaml` | `auth-mongo-service` | `auth-mongo-pvc` | 2Gi |
| `product-mongo.yaml` | `product-mongo-service` | `product-mongo-pvc` | 2Gi |
| `order-mongo.yaml` | `order-mongo-service` | `order-mongo-pvc` | 2Gi |
| `payment-mongo.yaml` | `payment-mongo-service` | `payment-mongo-pvc` | 2Gi |
| `inventory-mongo.yaml` | `inventory-mongo-service` | `inventory-mongo-pvc` | 2Gi |

Each manifest defines a **PersistentVolumeClaim** with **`ReadWriteOnce`**: the volume is read/write on a **single node** at a time (correct for one MongoDB pod). The cluster’s **default StorageClass** provisions the backing volume (e.g. Docker Desktop). Data **survives pod restarts** and image rollouts. Deleting the **namespace** or **PVC** removes that data unless you have backups.

#### MinIO (object storage)

| Manifest | Purpose |
|----------|---------|
| `minio-depl.yaml` | MinIO server; PVC `minio-pvc` (10Gi) on `/data`; console on port **9001** |
| `minio-clusterIP.yaml` | ClusterIP `minio-srv`: API **9000**, console **9001** |
| `01-minio-secret.yaml` | `minio-secret`: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` |

The product service uses `MINIO_*` env vars (endpoint `minio-srv`, credentials from the same secret keys). Buckets/policies may be created at runtime (e.g. `ensureBucket` in the product service).

#### Redis

| Manifest | Purpose |
|----------|---------|
| `expiration-redis-deployment.yaml` | Redis `redis:6.0.3-alpine`, PVC `expiration-redis-pvc` (1Gi), AOF persistence (`--appendonly yes`), data under `/data` |
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

**Option A — script:** `infra/secret.bat` (idempotent `kubectl apply`)

- Creates **`jwt-secret`** with `JWT_KEY`
- Creates **`minio-secret`** with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

**Option B — manifests:** `infra/k8s/00-jwt-secret.yaml`, `infra/k8s/01-minio-secret.yaml` (dev-oriented `stringData`; do not commit real production credentials).

| Secret | Keys | Used by |
|--------|------|---------|
| `jwt-secret` | `JWT_KEY` | All backend services |
| `minio-secret` | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | MinIO deployment; product service maps these to `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` |

> **Recommendation:** Replace plain-text dev secrets with a secure secret manager or sealed secrets for non-local environments.

---

## 4. Deployment Flow (Skaffold)

**File:** `skaffold.yaml` (API version: `skaffold/v4beta9`)

### Docker Images Built

Build **context is the repository root** (`context: .`) for all backend images so `file:../common` resolves inside the image. Each service uses its own Dockerfile path.

| Image | Dockerfile |
|-------|------------|
| `nguyennoah/auth-ttshop` | `auth/Dockerfile` |
| `nguyennoah/product-ttshop` | `product/Dockerfile` |
| `nguyennoah/payment-ttshop` | `payment/Dockerfile` |
| `nguyennoah/order-ttshop` | `order/Dockerfile` |
| `nguyennoah/inventory-ttshop` | `inventory/Dockerfile` |
| `nguyennoah/expiration-ttshop` | `expiration/Dockerfile` |
| `nguyennoah/client-ttshop` | `client/` + `Dockerfile` (context `client` only) |

### Typical Local Development Flow

1. Create secrets: `infra/secret.bat` (or `kubectl apply` the JWT + MinIO YAML files)
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
| JWT / MinIO secret values are dev defaults in script/YAML | Security vulnerability if reused outside local dev |
| PVC data tied to cluster/namespace | Deleting namespace or PVCs removes Mongo, MinIO, and Redis data |
| All workloads run as single replica | No high availability |
| No resource requests/limits in manifests | Risk of resource contention |
| Ingress host hardcoded to `localhost` | Local development only |
| No health check / readiness probes | K8s cannot detect unhealthy pods |
| No horizontal pod autoscaler (HPA) | Cannot scale under load |
