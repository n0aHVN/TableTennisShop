# Expiration Service Documentation

This document describes the architecture, event flow, and deployment of the Expiration background worker in TableTennisShop.

---

## 1. Overview

The Expiration service is a background worker that handles order timeout logic. It has no HTTP endpoints -- it operates entirely through NATS events and a Bull/Redis job queue.

| Aspect | Detail |
|--------|--------|
| **Stack** | Node.js, TypeScript |
| **Queue** | Bull (backed by Redis) |
| **Messaging** | NATS Streaming |
| **Shared package** | `@tabletennisshop/common` |
| **Source location** | `expiration/src` |
| **Default port** | `3005` (declared in K8s manifests but no HTTP server runs) |

---

## 2. Run Locally

```bash
cd expiration
npm install
npm run start
```

Start script uses `ts-node-dev src/index.ts`.

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `NATS_CLUSTER_ID` | NATS Streaming cluster ID |
| `NATS_CLIENT_ID` | Unique NATS client identifier |
| `NATS_URL` | NATS Streaming server URL |
| `REDIS_HOST` | Redis host for Bull queue |

> `JWT_KEY` is present in deployment manifests but not used by the service code.

---

## 3. Event Flow

The expiration service implements a delayed-job pattern:

```
OrderCreated event
  │
  ▼
OrderCreatedListener
  │  calculates: delay = expiresAt - now
  ▼
Bull Queue ("order:expiration")
  │  schedules delayed job with { orderId }
  │  waits for delay period
  ▼
Queue Processor
  │  fires when delay elapses
  ▼
ExpirationCompletePublisher
  │  publishes OrderExpired event with { _id: orderId }
  ▼
Order Service (OrderExpiredCompleteListener)
     cancels the order if not already FINISHED
```

### Detailed Steps

1. `OrderCreatedListener` receives `SubjectsEnum.OrderCreated`.
2. It calculates the delay: `delay = new Date(expiresAt).getTime() - new Date().getTime()`.
3. It pushes a delayed Bull job to the `order:expiration` queue with payload `{ orderId }`.
4. When the delay elapses, the queue processor publishes `SubjectsEnum.OrderExpired` with `{ _id: orderId }`.
5. The listener acknowledges the NATS message (`msg.ack()`).

**Queue group name:** `expiration-service`

---

## 4. Event Handling

### Listeners

| Listener | Subject | Behavior |
|----------|---------|----------|
| `OrderCreatedListener` | `order:created` | Schedules a delayed expiration job |

### Publishers

| Publisher | Subject | Payload |
|-----------|---------|---------|
| `ExpirationCompletePublisher` | `order:expired` | `{ _id: orderId }` |

---

## 5. HTTP Endpoints

**None.** This service has no application-level HTTP endpoints. The Kubernetes service manifest exposes port 3000, but the runtime code does not start an HTTP listener.

---

## 6. Project Structure

```
expiration/src/
├── index.ts                # Startup, env checks, NATS connect
├── NatsWrapper.ts          # NATS Streaming client singleton
├── queues/
│   └── expiration-queue.ts # Bull queue definition + processor
├── events/
│   ├── listeneres/         # (note: misspelled folder name)
│   │   ├── OrderCreatedListener.ts
│   │   └── queueGroupName.ts
│   └── publishers/
│       └── OrderExpiredCompletePublisher.ts
└── __mocks__/              # Test mocks
```

> **Known naming issues:**
> - Folder name `listeneres` is misspelled (should be `listeners`). Imports reference this as-is.
> - File `OrderExpiredCompletePublisher.ts` contains class `ExpirationCompletePublisher`. This works because imports use the class name.

---

## 7. Deployment

### Kubernetes Manifests

| Manifest | Purpose |
|----------|---------|
| `infra/k8s/expiration-depl.yaml` | Deployment (`nguyennoah/expiration-ttshop`) |
| `infra/k8s/expiration-clusterIP.yaml` | ClusterIP service (port 3000) |
| `infra/k8s/expiration-redis-deployment.yaml` | Redis (`redis:6.0.3-alpine`) |
| `infra/k8s/expiration-redis-clusterIP.yaml` | Redis ClusterIP service (port 6379) |

### Environment Variables (K8s)

| Variable | Value / Source |
|----------|---------------|
| `NATS_CLUSTER_ID` | `ticketing` |
| `NATS_CLIENT_ID` | Pod metadata name |
| `NATS_URL` | `http://nats-svc:4222` |
| `REDIS_HOST` | `expiration-redis-svc` |
| `JWT_KEY` | From Kubernetes secret `jwt-secret` (unused) |

### Manual Deployment

```bash
kubectl apply -f infra/k8s/expiration-redis-deployment.yaml
kubectl apply -f infra/k8s/expiration-redis-clusterIP.yaml
kubectl apply -f infra/k8s/expiration-depl.yaml
kubectl apply -f infra/k8s/expiration-clusterIP.yaml
```

---

## 8. Testing

```bash
cd expiration
npm test
```

---

## 9. Risks and Recommendations

- Single replica with no autoscaling.
- Redis uses a **PersistentVolumeClaim** with AOF (`--appendonly yes`); queue data survives pod restarts unless the PVC or namespace is deleted.
- The `JWT_KEY` environment variable is injected but never used.
- Folder name `listeneres` is misspelled -- consider renaming for consistency.
- File/class naming mismatch (`OrderExpiredCompletePublisher.ts` vs `ExpirationCompletePublisher` class).
