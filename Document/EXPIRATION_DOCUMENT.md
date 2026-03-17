# Expiration Service Documentation

## 1. Service Overview

The `expiration` service is a background worker responsible for order timeout handling.

- It connects to NATS Streaming and listens for `OrderCreated` events.
- For each created order, it computes delay duration using the order `expiresAt` timestamp.
- It schedules a delayed job in Bull queue (`order:expiration`) backed by Redis.
- When the delayed job is processed, it publishes `OrderExpired` to notify other services.

Current behavior is event-driven only; there is no HTTP server bootstrap in `src/index.ts`.

## 2. Runtime Dependencies

From source and deployment manifests, the service depends on:

- NATS Streaming
- Redis (Bull queue backend)
- Shared common package: `@tabletennisshop/common`

### Required Environment Variables

- `NATS_CLUSTER_ID`
- `NATS_CLIENT_ID`
- `NATS_URL`
- `REDIS_HOST`

Also present in deployment (not used directly in current source):

- `JWT_KEY`

## 3. Event Flow

1. `OrderCreatedListener` receives `SubjectsEnum.OrderCreated`.
2. It calculates:
   - `delay = new Date(expiresAt).getTime() - new Date().getTime()`
3. It pushes a delayed Bull job to queue `order:expiration` with `{ orderId }`.
4. Queue processor publishes `SubjectsEnum.OrderExpired` with payload `{ _id: orderId }`.
5. Listener acknowledges message (`msg.ack()`).

Queue group name: `expiration-service`.

## 4. Run Instructions

### Local Development

From repository root:

```bash
cd expiration
npm install
npm run start
```

Default start script uses `ts-node-dev src/index.ts`.

### Tests

```bash
cd expiration
npm test
```

### Kubernetes Deployment

Relevant manifests:

- `infra/k8s/expiration-depl.yaml`
- `infra/k8s/expiration-clusterIP.yaml`
- `infra/k8s/expiration-redis-deployment.yaml`
- `infra/k8s/expiration-redis-clusterIP.yaml`

Example apply command:

```bash
kubectl apply -f infra/k8s/expiration-redis-deployment.yaml
kubectl apply -f infra/k8s/expiration-redis-clusterIP.yaml
kubectl apply -f infra/k8s/expiration-depl.yaml
kubectl apply -f infra/k8s/expiration-clusterIP.yaml
```

## 5. Endpoints

### HTTP Endpoints

No application HTTP endpoints are currently implemented in this service code.

### Kubernetes Service Endpoint

A Kubernetes Service is declared as:

- Service name: `expiration-service`
- Port: `3000`
- Target port: `3000`

Note: this port mapping exists in infrastructure manifests, but current runtime code in `expiration/src/index.ts` does not start an HTTP listener.

### Messaging Endpoints

- Subscribes: `OrderCreated`
- Publishes: `OrderExpired`
- Queue: `order:expiration` (Bull + Redis)

## 6. Project Structure (expiration)

```text
expiration/
  package.json
  tsconfig.json
  src/
    index.ts
    NatsWrapper.ts
    queues/
      expiration-queue.ts
    events/
      listeneres/
        OrderCreatedListener.ts
        queueGroupName.ts
      publishers/
        OrderExpiredCompletePublisher.ts
    __mocks__/
```

## 7. Infra Summary (expiration-related)

- `expiration-depl.yaml`
  - Deploys container `nguyennoah/expiration-ttshop`
  - Sets NATS and Redis host environment variables
- `expiration-clusterIP.yaml`
  - Exposes service `expiration-service` on TCP 3000
- `expiration-redis-deployment.yaml`
  - Deploys Redis `redis:6.0.3-alpine`
- `expiration-redis-clusterIP.yaml`
  - Exposes Redis service `expiration-redis-svc` on TCP 6379

## 8. Notes

- Folder name `listeneres` is used in code and imports as-is.
- Class/file naming has a mismatch:
  - File: `OrderExpiredCompletePublisher.ts`
  - Class: `ExpirationCompletePublisher`
  This currently works because the import references the class name.
