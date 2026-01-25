# Developer Onboarding Guide

**Document Version:** 1.0  
**Last Updated:** January 25, 2026  
**Intended Audience:** Software Engineers, DevOps Engineers

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Local Development Workflow](#local-development-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Prerequisites

### Required Software

| Tool | Minimum Version | Purpose | Installation |
|------|----------------|---------|-------------|
| Node.js | 18.x LTS | Runtime environment | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Package manager | Included with Node.js |
| Docker Desktop | 24.x | Containerization | [docker.com](https://docker.com) |
| Kubernetes | 1.27+ | Orchestration | Included in Docker Desktop |
| kubectl | 1.27+ | K8s CLI | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Skaffold | 2.8+ | Local dev workflow | [skaffold.dev](https://skaffold.dev/docs/install/) |
| Git | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |

### Optional but Recommended
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - Kubernetes
  - GitLens
- **Postman** or **Insomnia** for API testing
- **MongoDB Compass** for database inspection
- **K9s** for Kubernetes cluster management

### System Requirements
- **OS:** Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM:** Minimum 16GB (32GB recommended)
- **CPU:** 4+ cores
- **Disk Space:** 20GB free

---

## Development Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/n0aHVN/TableTennisShop.git
cd TableTennisShop
```

### Step 2: Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Go to **Settings** → **Kubernetes**
3. Check **Enable Kubernetes**
4. Click **Apply & Restart**
5. Verify installation:
   ```bash
   kubectl version --client
   kubectl cluster-info
   ```

### Step 3: Install Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

Verify:
```bash
kubectl get pods -n ingress-nginx
```

### Step 4: Configure Local DNS

Add the following to your hosts file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**macOS/Linux:** `/etc/hosts`

```
127.0.0.1 tabletennisshop.dev
```

### Step 5: Create Kubernetes Secrets

Run the secret creation script:

```bash
cd infra
secret.bat  # Windows
# or
chmod +x secret.sh && ./secret.sh  # macOS/Linux
```

This creates secrets for:
- JWT signing key
- MongoDB credentials
- Stripe API keys

### Step 6: Install Project Dependencies

Install dependencies for all services:

```bash
npm install
```

This will run `npm install` in each service directory via the monorepo setup.

### Step 7: Start Development Environment

```bash
skaffold dev
```

**What happens:**
- Builds Docker images for all services
- Deploys to local Kubernetes cluster
- Watches for file changes and auto-redeploys
- Streams logs from all pods

**Expected output:**
```
Deployments stabilized in 2m15s
Press Ctrl+C to exit
Watching for changes...
```

### Step 8: Verify Deployment

Check all pods are running:
```bash
kubectl get pods
```

Expected:
```
NAME                              READY   STATUS    RESTARTS
auth-depl-xxxxx                   1/1     Running   0
product-depl-xxxxx                1/1     Running   0
inventory-depl-xxxxx              1/1     Running   0
order-depl-xxxxx                  1/1     Running   0
payment-depl-xxxxx                1/1     Running   0
expiration-depl-xxxxx             1/1     Running   0
client-depl-xxxxx                 1/1     Running   0
nats-depl-xxxxx                   1/1     Running   0
```

### Step 9: Access the Application

Open your browser:
- **Frontend:** [http://tabletennisshop.dev](http://tabletennisshop.dev)
- **API Endpoints:** `http://tabletennisshop.dev/api/*`

---

## Project Structure

### Monorepo Layout

```
TableTennisShop/
├── auth/                  # Authentication service
├── product/               # Product catalog service
├── inventory/             # Inventory management service
├── order/                 # Order management service
├── payment/               # Payment processing service
├── expiration/            # Order expiration service
├── client/                # Next.js frontend
├── common/                # Shared library (published to npm)
├── infra/                 # Infrastructure as code
│   ├── k8s/              # Kubernetes manifests
│   └── keys/             # TLS certificates
├── Document/              # Project documentation
├── package.json           # Root package.json for monorepo
└── skaffold.yaml         # Skaffold configuration
```

### Service Structure (Example: auth)

```
auth/
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express app setup
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── test/             # Unit/integration tests
├── Dockerfile            # Container image definition
├── package.json          # Service dependencies
└── tsconfig.json         # TypeScript configuration
```

---

## Local Development Workflow

### Making Code Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Edit code in your preferred IDE**

3. **Skaffold auto-rebuilds and redeploys:**
   - File changes detected
   - Service rebuilt
   - Pod restarted
   - New logs streamed

4. **Test your changes:**
   - Manual testing via browser/Postman
   - Run unit tests (see [Testing](#testing))

### Working with a Single Service

To develop only one service without Kubernetes:

```bash
cd auth
npm run dev
```

**Note:** You'll need to run MongoDB and NATS locally:

```bash
# MongoDB
docker run -d -p 27017:27017 mongo:7

# NATS Streaming
docker run -d -p 4222:4222 -p 8222:8222 nats-streaming:0.25.5
```

### Updating the Common Library

When you modify `common/`:

1. Build the library:
   ```bash
   cd common
   npm run build
   ```

2. Update all services:
   ```bash
   cd ..
   updateCommonPackage.bat  # Windows
   ```

This script rebuilds and reinstalls the common package in all services.

---

## Testing

### Running Unit Tests

**All services:**
```bash
npm test
```

**Single service:**
```bash
cd auth
npm test
```

**Watch mode:**
```bash
npm test -- --watch
```

**Coverage report:**
```bash
npm test -- --coverage
```

### Running Integration Tests

```bash
npm run test:integration
```

### API Testing with Postman

1. Import the Postman collection from `Document/postman/`
2. Set environment to `Local Development`
3. Run collection tests

---

## Troubleshooting

### Issue: Pods stuck in "Pending" state

**Cause:** Insufficient cluster resources

**Solution:**
```bash
# Increase Docker Desktop resources
# Settings → Resources → increase RAM to 8GB+
```

### Issue: "ImagePullBackOff" error

**Cause:** Docker image build failed

**Solution:**
```bash
skaffold delete
skaffold dev --no-prune=false --cache-artifacts=false
```

### Issue: Cannot access http://tabletennisshop.dev

**Cause:** Hosts file not configured or ingress not ready

**Solution:**
1. Verify hosts file entry
2. Check ingress controller:
   ```bash
   kubectl get ingress
   kubectl describe ingress ingress-service
   ```

### Issue: MongoDB connection refused

**Cause:** MongoDB pod not running

**Solution:**
```bash
kubectl get pods | grep mongo
kubectl logs <mongo-pod-name>
kubectl delete pod <mongo-pod-name>  # Force restart
```

### Issue: NATS connection timeout

**Cause:** NATS service not reachable

**Solution:**
```bash
kubectl get svc nats-srv
kubectl port-forward svc/nats-srv 4222:4222
```

### Getting Logs

**All pods:**
```bash
kubectl logs -l app=auth --tail=100 -f
```

**Specific pod:**
```bash
kubectl logs <pod-name> -f
```

**Previous crashed container:**
```bash
kubectl logs <pod-name> --previous
```

---

## Best Practices

### Code Style
- Use TypeScript strict mode
- Follow ESLint/Prettier configurations
- Write self-documenting code
- Add JSDoc comments for public APIs

### Git Workflow
- Commit frequently with clear messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Rebase before pushing to keep history clean
- Never commit secrets or `.env` files

### Testing
- Write tests before code (TDD)
- Aim for 80%+ code coverage
- Test edge cases and error paths
- Use mocks for external dependencies

### Performance
- Use indexes on frequently queried fields
- Implement caching where appropriate
- Avoid N+1 queries
- Monitor API response times

### Security
- Never log sensitive data
- Validate all user inputs
- Use parameterized queries
- Keep dependencies updated

---

## Next Steps

1. Review [Architecture.md](./Architecture.md) for system design details
2. Read [Contributing.md](./Contributing.md) for contribution guidelines
3. Explore service-specific READMEs in each service folder
4. Join the team Slack channel for questions

---

## Support

If you encounter issues not covered here:

1. Check existing GitHub Issues
2. Search internal documentation
3. Ask in the #engineering Slack channel
4. Contact the Tech Lead: [tech-lead@email.com]
