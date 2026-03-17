# Infrastructure Documentation

This document summarizes infrastructure setup for the TableTennisShop microservices, including Kubernetes manifests, secret setup, and deployment scripts.

## 1. Infrastructure Layout

- Kubernetes manifests: `infra/k8s/`
- Secret setup script: `infra/secret.bat`
- Local TLS cert/key files: `infra/keys/localhost.pem`, `infra/keys/localhost-key.pem`
- Build/deploy orchestration: `skaffold.yaml`
- Shared package update helper: `updateCommonPackage.bat`

## 2. Kubernetes Resources Overview

### Core platform services

- `infra/k8s/nats-depl.yaml`
  - Deploys NATS Streaming (`nats-streaming:0.17.0`)
  - Ports: `4222` (client), `8222` (monitoring)
  - Cluster ID: `ticketing`
- `infra/k8s/nats-clusterIP.yaml`
  - Exposes NATS as ClusterIP service `nats-svc`

### Business microservices

Each service has:
- one deployment file: `*-depl.yaml`
- one ClusterIP service file: `*-clusterIP.yaml`

Services:
- Auth: `auth-depl.yaml`, `auth-clusterIP.yaml`
- Product: `product-depl.yaml`, `product-clusterIP.yaml`
- Order: `order-depl.yaml`, `order-clusterIP.yaml`
- Payment: `payment-depl.yaml`, `payment-clusterIP.yaml`
- Inventory: `inventory-depl.yaml`, `inventory-clusterIP.yaml`
- Expiration: `expiration-depl.yaml`, `expiration-clusterIP.yaml`

Common runtime settings across services:
- Container port: `3000`
- `JWT_KEY` loaded from Kubernetes secret `jwt-secret` key `JWT_KEY`
- NATS-based services use:
  - `NATS_CLUSTER_ID=ticketing`
  - `NATS_URL=http://nats-svc:4222`
  - `NATS_CLIENT_ID` from pod metadata name

Service-specific dependencies:
- Auth: MongoDB (`auth-mongo-service`)
- Product: MongoDB (`product-mongo-service`) + NATS
- Order: MongoDB (`order-mongo-service`) + NATS
- Payment: MongoDB (`payment-mongo-service`) + NATS
- Inventory: MongoDB (`inventory-mongo-service`) + NATS
- Expiration: Redis (`expiration-redis-svc`) + NATS

### Data stores

MongoDB manifests (one per domain service):
- `auth-mongo.yaml`
- `product-mongo.yaml`
- `order-mongo.yaml`
- `payment-mongo.yaml`
- `inventory-mongo.yaml`

Redis manifests for expiration service:
- `expiration-redis-deployment.yaml`
- `expiration-redis-clusterIP.yaml`

Note:
- Current MongoDB deployments use `emptyDir`, so data is not persistent after pod restart.

### Ingress routing

- File: `infra/k8s/ingress-clusterIP.yaml`
- Ingress class: `nginx`
- Host: `localhost`
- Path routing:
  - `/api/users` -> `auth-service:3000`
  - `/api/products` -> `product-service:3000`
  - `/api/orders` -> `order-service:3000`
  - `/api/inventory` -> `inventory-service:3000`
  - `/api/payments` -> `payment-service:3000`
- TLS block exists but is commented out.

## 3. Secret Setup

File: `infra/secret.bat`

```bat
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=secretKey
```

Required secret contract:
- Secret name: `jwt-secret`
- Key: `JWT_KEY`
- Used by: auth, product, order, payment, inventory, expiration services

Recommendation:
- Replace plain-text inline secret creation with a secure secret flow (for example external secret manager or sealed secret strategy).

## 4. Deployment Flow (Skaffold)

File: `skaffold.yaml`

- Uses `skaffold/v4beta9`
- Builds Docker images for:
  - `nguyennoah/auth-ttshop`
  - `nguyennoah/product-ttshop`
  - `nguyennoah/payment-ttshop`
  - `nguyennoah/order-ttshop`
  - `nguyennoah/inventory-ttshop`
  - `nguyennoah/expiration-ttshop`
- Applies manifests from `infra/k8s/`, including explicit NATS files and wildcard include

Typical local flow:
1. Create JWT secret via `infra/secret.bat`
2. Ensure ingress controller is available in local cluster
3. Run Skaffold (`skaffold dev` or `skaffold run`)
4. Access APIs through ingress host (`localhost`)

## 5. Infra Utility Script

File: `updateCommonPackage.bat`

Purpose:
- Clears npm cache
- Updates `@tabletennisshop/common` package in all backend services

This script is not a Kubernetes deployment script, but supports infra consistency by aligning shared package versions before image rebuild/redeploy.

## 6. Current Gaps and Risks

- TLS is disabled in ingress (commented).
- JWT secret value is hardcoded in setup script.
- MongoDB uses non-persistent `emptyDir` volumes.
- Most workloads run as single replica.
- No resource requests/limits defined in manifests.
- Ingress host is hardcoded to `localhost` (local-focused).

## 7. Quick Validation Checklist

- `infra/secret.bat` exists and creates `jwt-secret`.
- `infra/k8s/` contains deployments and services for all listed microservices.
- `infra/k8s/ingress-clusterIP.yaml` routes all API prefixes to corresponding services.
- `skaffold.yaml` includes all microservice image artifacts.
- `Document/INFRA_DOCUMENT.md` is present and up to date.
