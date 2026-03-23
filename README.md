# Table Tennis Shop - Microservices E-commerce Platform

A cloud-native microservices e-commerce platform for table tennis equipment, built with Node.js, Angular, MongoDB, and Kubernetes.

---

## Prerequisites

Before starting, ensure you have installed:

- **Docker** — Container runtime for building and running images
- **Kubernetes** (minikube or Docker Desktop K8s) — Orchestration platform
- **Skaffold** — Development tool for iterative Kubernetes development
- **kubectl** — Kubernetes command-line tool
- **Node.js** (v16+) and npm — For local package management

### Quick Install on Windows

```powershell
# Using Chocolatey/scoop (if installed)
choco install docker-desktop kubernetes-helm
scoop install skaffold kubectl
```

---

## Project Structure

```
TableTennisShop/
├── auth/              # Authentication service (JWT, user management)
├── client/            # Angular frontend application
├── common/            # Shared package (enums, types, middlewares, events)
├── order/             # Order service + Analytics endpoints (NEW)
├── payment/           # Payment service
├── product/           # Product catalog service
├── inventory/         # Inventory management service
├── expiration/        # Order expiration service
├── infra/             # Kubernetes manifests (k8s/)
└── skaffold.yaml      # Skaffold configuration
```

### Microservices Overview

| Service | Port | Purpose |
|---------|------|---------|
| **auth** | 3000 | User authentication & JWT tokens |
| **order** | 3001 | Order management + Analytics (NEW) |
| **product** | 3002 | Product catalog |
| **payment** | 3003 | Payment processing |
| **inventory** | 3004 | Stock management |
| **expiration** | 3005 | Order expiration queue |
| **client** | 4200 | Angular frontend |

---

## Quick Start with Skaffold

### 1. Start Kubernetes Cluster

**Docker Desktop:**
```bash
# Enable Kubernetes in Docker Desktop settings
# Verify cluster is running:
kubectl cluster-info
```

**Minikube:**
```bash
minikube start --cpus=4 --memory=8192
eval $(minikube docker-env)  # Use minikube's docker daemon
```

### 2. Install Common Package Dependencies (First Time Only)

```bash
cd common
npm install
npm run build
```

### 3. Start Development with Skaffold

```bash
# From project root (D:\LapTrinh\TableTennisShop)
skaffold dev
```

This will:
- ✅ Build Docker images for all services
- ✅ Deploy manifests to Kubernetes
- ✅ Watch for code changes and auto-rebuild/redeploy
- ✅ Stream logs from all services
- ✅ Hot-reload on file save

### 4. Port Forwarding (In New Terminal)

Each service has its own MongoDB ClusterIP (example: auth):

```bash
kubectl port-forward svc/auth-mongo-service 27018:27017
```

MinIO console (after deploying manifests):

```bash
kubectl port-forward svc/minio-srv 9001:9001
# Open http://localhost:9001
```

HTTPS ingress (if needed):

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8443:443
```

---

## Installing Dependencies Across All Services

Use the provided batch script to install npm packages in all services:

**Windows:**
```bash
updateCommonPackage.bat
```

This installs dependencies in:
- common → auth → order → payment → product → inventory → expiration → client

**Manual (macOS/Linux):**
```bash
for dir in common auth client inventory order payment product expiration; do
  (cd $dir && npm install)
done
```

---

## API Access

### Base URLs
- **API Gateway:** `http://localhost` (or `https://localhost:8443`)
- **Auth Service:** `http://localhost:3000`
- **Order Service:** `http://localhost:3001`
- **Product Service:** `http://localhost:3002`
- **Client (Frontend):** `http://localhost:4200`

### Key Endpoints

**Authentication:**
```bash
POST /api/users/signup
POST /api/users/signin
```

**Orders:**
```bash
GET /api/orders                           # List orders
POST /api/orders                          # Create order
GET /api/orders/:id                       # Get order by ID
PATCH /api/orders/:id                     # Update order
```

**Analytics (Owner/Employee Only):**
```bash
GET /api/analytics/orders/stats           # Order statistics by status
GET /api/analytics/orders/revenue         # Revenue breakdown
GET /api/analytics/orders/timeline        # Time-series data (day/week/month)
GET /api/analytics/products/bestsellers   # Top selling products
GET /api/analytics/payments/methods       # Payment method breakdown
GET /api/analytics/customers/metrics      # Customer metrics
GET /api/analytics/dashboard-summary      # Complete dashboard data
```

**Products:**
```bash
GET /api/products                         # List products
POST /api/products                        # Create product (admin only)
GET /api/products/:id                     # Get product by ID
```

---

## Common Development Tasks

### View Service Logs
```bash
# Specific service
kubectl logs -f deployment/order-depl

# Follow logs in real-time
kubectl logs -f deployment/order-depl --tail=50

# All services
skaffold dev  # Shows aggregated logs
```

### Access Database
```bash
# Example: order service MongoDB (adjust deployment name if replicas differ)
kubectl exec -it deployment/order-mongo-deployment -- mongosh

# List collections
> show collections

# Query orders (in order DB / collection names depend on your app)
> db.orders.find().pretty()
```

### Rebuild Services
```bash
# Skaffold auto-rebuilds on file changes
# Force manual rebuild:
skaffold build

# Deploy without rebuild:
kubectl apply -f infra/k8s/
```

### Debug Service Pod
```bash
# Get pod name
kubectl get pods

# SSH into pod
kubectl exec -it <pod-name> -- /bin/sh

# View environment variables
kubectl describe pod <pod-name>
```

---

## Troubleshooting

### 1. Port 443 Restricted (Windows)
```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8443:443
# Access via https://localhost:8443
```

### 2. NATS Connection Errors
```bash
# Verify NATS is running
kubectl get pods | grep nats

# Check NATS logs
kubectl logs deployment/nats-depl
```

### 3. MongoDB Connection Issues
```bash
# Port-forward the MongoDB service you need (per service)
kubectl port-forward svc/auth-mongo-service 27018:27017
# or: product-mongo-service, order-mongo-service, etc.

# Test connection
mongosh --host localhost:27018

# If pods stay Pending, check PVCs: kubectl get pvc
```

### 4. Image Pull Failures
```bash
# Use local images (minikube)
eval $(minikube docker-env)
skaffold dev

# Or rebuild images
docker system prune -a
skaffold dev --cache-artifacts=false
```

### 5. Node Modules Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force

# Reinstall all packages
cd order && npm install
cd ../common && npm install
# ... repeat for all services
```

### 6. Skaffold Not Auto-Reloading
```bash
# Verify file watcher is working
# Kill and restart skaffold
skaffold dev

# Or use debug mode
skaffold dev --verbosity=debug
```

---

## Production Deployment

For production, use standard Kubernetes deployment:

```bash
# 1. Build images
docker build -t registry/order:1.0 order/
docker build -t registry/auth:1.0 auth/
# ... repeat for each service

# 2. Push to registry
docker push registry/order:1.0

# 3. Update k8s manifests with image tags
# Edit infra/k8s/*.yaml with prod image references

# 4. Deploy
kubectl apply -f infra/k8s/
```

---

## Architecture Decision Records

- **Microservices**: Event-driven with NATS Streaming for service communication
- **Database**: MongoDB with optimistic concurrency control (version field)
- **Authentication**: JWT tokens stored in secure HTTP-only cookies
- **Analytics**: Integrated into order service with MongoDB aggregation pipelines
- **Frontend**: Angular with responsive design
- **Infrastructure**: Kubernetes with Skaffold for local development; MongoDB, MinIO, and Redis use PersistentVolumeClaims (`ReadWriteOnce`) so data survives pod restarts (not the git repo tree)

---

## Environment Variables

Create `.env` files in each service for local configuration:

```env
# auth/.env (local / in-cluster hostnames differ)
MONGO_URL=mongodb://auth-mongo-service:27017/app
JWT_KEY=your-secret-key

# order/.env
MONGO_URL=mongodb://order-mongo-service:27017/app
JWT_KEY=your-secret-key
NATS_URL=http://nats-svc:4222
NATS_CLUSTER_ID=ticketing
```

In Kubernetes, each deployment sets `MONGO_URL` to its matching `*-mongo-service` (see `infra/k8s/*-depl.yaml`).

---

## Contributing

1. Create feature branch: `git checkout -b feature/analytics`
2. Make changes and test locally: `skaffold dev`
3. Commit and push: `git push origin feature/analytics`
4. Submit pull request

---

## Support

For issues or questions:
- Check logs: `skaffold dev` or `kubectl logs`
- Review k8s manifests: `infra/k8s/`
- Check service documentation: `[service]/README.md`
