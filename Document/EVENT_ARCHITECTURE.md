# Event-Driven Architecture Documentation

This document describes the cross-service event flow, event catalog, and messaging patterns used in TableTennisShop.

---

## 1. Overview

TableTennisShop uses **NATS Streaming** as its event bus. Services communicate asynchronously by publishing and subscribing to typed events. Each service maintains its own database and synchronizes state through events (event sourcing / CQRS-lite pattern).

| Aspect | Detail |
|--------|--------|
| **Message broker** | NATS Streaming (`nats-streaming:0.17.0`) |
| **Cluster ID** | `ticketing` |
| **Client library** | `node-nats-streaming` |
| **Concurrency** | Optimistic concurrency via `version` field |
| **Delivery** | At-least-once with manual ACK |

---

## 2. Service Communication Map

```mermaid
graph LR
    subgraph services [Microservices]
        ProductSvc[Product Service]
        OrderSvc[Order Service]
        PaymentSvc[Payment Service]
        InventorySvc[Inventory Service]
        ExpirationSvc[Expiration Service]
    end

    subgraph nats [NATS Streaming]
        EventBus((Event Bus))
    end

    ProductSvc -->|"product:created"| EventBus
    ProductSvc -->|"product:updated"| EventBus
    EventBus -->|"product:created"| OrderSvc
    EventBus -->|"product:updated"| OrderSvc
    EventBus -->|"product:created"| InventorySvc

    OrderSvc -->|"order:created"| EventBus
    OrderSvc -->|"order:cancelled"| EventBus
    OrderSvc -->|"order:updated"| EventBus
    EventBus -->|"order:created"| PaymentSvc
    EventBus -->|"order:created"| InventorySvc
    EventBus -->|"order:created"| ExpirationSvc
    EventBus -->|"order:cancelled"| PaymentSvc
    EventBus -->|"order:cancelled"| InventorySvc
    EventBus -->|"order:updated"| PaymentSvc

    PaymentSvc -->|"payment:created"| EventBus
    EventBus -->|"payment:created"| OrderSvc

    InventorySvc -->|"inventory:created"| EventBus
    InventorySvc -->|"inventory:updated"| EventBus
    InventorySvc -->|"import-item:created"| EventBus
    InventorySvc -->|"import-item:updated"| EventBus
    EventBus -->|"inventory:created"| ProductSvc
    EventBus -->|"inventory:created"| OrderSvc
    EventBus -->|"inventory:updated"| ProductSvc
    EventBus -->|"inventory:updated"| OrderSvc
    EventBus -->|"import-item:created"| OrderSvc
    EventBus -->|"import-item:updated"| OrderSvc

    ExpirationSvc -->|"order:expired"| EventBus
    EventBus -->|"order:expired"| OrderSvc
```

> The **Auth service** does not participate in NATS messaging.

---

## 3. Event Catalog

### 3.1 Product Events

| Subject | Publisher | Subscribers | Payload |
|---------|----------|-------------|---------|
| `product:created` | Product | Order, Inventory | `{ _id, status, price, version }` |
| `product:updated` | Product | Order | `{ _id, status, price, version }` |

---

### 3.2 Order Events

| Subject | Publisher | Subscribers | Payload |
|---------|----------|-------------|---------|
| `order:created` | Order | Payment, Inventory, Expiration | `{ _id, user_id, products[], status, payment_method, total_price, expiresAt, version }` |
| `order:updated` | Order | Payment | `{ _id, user_id, products[], status, payment_method, total_price, expiresAt, version }` |
| `order:cancelled` | Order | Payment, Inventory | `{ _id, user_id, products[], status, payment_method, total_price, expiresAt, version }` |
| `order:expired` | Expiration | Order | `{ _id }` |

> **Note:** `products[]` items now include `item_codes: string[]` alongside `product_id`, `price`, and `quantity`.

---

### 3.3 Payment Events

| Subject | Publisher | Subscribers | Payload |
|---------|----------|-------------|---------|
| `payment:created` | Payment | Order | `{ _id, order_id, user_id }` |

---

### 3.4 Inventory Events

| Subject | Publisher | Subscribers | Payload |
|---------|----------|-------------|---------|
| `inventory:created` | Inventory | Product, Order | `{ _id, product_id, total_quantity, version }` |
| `inventory:updated` | Inventory | Product, Order | `{ _id, product_id, total_quantity, version }` |

---

### 3.5 Import Events

| Subject | Publisher | Subscribers | Payload |
|---------|----------|-------------|---------|
| `import-item:created` | Inventory | Order | `{ _id, import_id, product_id, item_code, import_price, status, version }` |
| `import-item:updated` | Inventory | Order | `{ _id, import_id, product_id, item_code, import_price, status, order_id?, sold_at?, version }` |

---

## 4. Order Lifecycle Flow

The most complex event flow in the system is the order lifecycle:

```mermaid
sequenceDiagram
    participant Client
    participant OrderSvc as Order Service
    participant NATS as NATS Streaming
    participant PaymentSvc as Payment Service
    participant InventorySvc as Inventory Service
    participant ExpirationSvc as Expiration Service
    participant Redis as Bull/Redis Queue

    Client->>OrderSvc: POST /api/orders
    OrderSvc->>OrderSvc: Create order (status: PENDING, expiresAt: now+60s)
    OrderSvc->>NATS: Publish order:created

    par Parallel Listeners
        NATS->>PaymentSvc: order:created (store order locally)
        NATS->>InventorySvc: order:created (FIFO-assign ImportItems + subtract quantities)
        InventorySvc->>NATS: import-item:updated (status: sold, for each item)
        NATS->>OrderSvc: import-item:updated (sync item status to replica)
        NATS->>ExpirationSvc: order:created
        ExpirationSvc->>Redis: Schedule delayed job (delay = expiresAt - now)
    end

    alt Payment received before expiration
        Client->>PaymentSvc: POST /api/payments
        PaymentSvc->>NATS: Publish payment:created
        NATS->>OrderSvc: payment:created
        OrderSvc->>OrderSvc: Mark order FINISHED
    else Expiration timer fires
        Redis->>ExpirationSvc: Process delayed job
        ExpirationSvc->>NATS: Publish order:expired
        NATS->>OrderSvc: order:expired
        OrderSvc->>OrderSvc: Check if order is FINISHED
        alt Order is not FINISHED
            OrderSvc->>OrderSvc: Mark order CANCELLED
            OrderSvc->>NATS: Publish order:cancelled
            NATS->>PaymentSvc: order:cancelled
            NATS->>InventorySvc: order:cancelled (release ImportItems + restore quantities)
        end
    end
```

---

## 5. Product Creation Flow

```mermaid
sequenceDiagram
    participant Client
    participant ProductSvc as Product Service
    participant NATS as NATS Streaming
    participant InventorySvc as Inventory Service
    participant OrderSvc as Order Service

    Client->>ProductSvc: POST /api/products
    ProductSvc->>ProductSvc: Create product (status: OUT_OF_STOCK)
    ProductSvc->>NATS: Publish product:created

    par Parallel Listeners
        NATS->>InventorySvc: product:created (create inventory record)
        NATS->>OrderSvc: product:created (sync product data)
    end

    InventorySvc->>NATS: Publish inventory:created

    par Parallel Listeners
        NATS->>ProductSvc: inventory:created (sync inventory data)
        NATS->>OrderSvc: inventory:created (sync inventory data)
    end
```

---

## 6. Stock Import Flow

```mermaid
sequenceDiagram
    participant Admin
    participant InventorySvc as Inventory Service
    participant NATS as NATS Streaming
    participant OrderSvc as Order Service

    Admin->>InventorySvc: POST /api/inventory/import
    InventorySvc->>InventorySvc: Create Import batch + ImportItem per item_code
    InventorySvc->>InventorySvc: Increment Inventory.total_quantity

    loop For each ImportItem
        InventorySvc->>NATS: import-item:created
        NATS->>OrderSvc: import-item:created (sync to replica)
    end

    InventorySvc->>NATS: inventory:updated
    NATS->>OrderSvc: inventory:updated (sync quantity)
```

---

## 7. Concurrency Control

All services use **optimistic concurrency control** via a `version` field on their Mongoose models.

### How It Works

1. Every document has a `version` field starting at `0`.
2. On each update, the version is incremented.
3. Event payloads include the `version` number.
4. Listeners that replicate data match on both `_id` and `version` to ensure events are processed in order.
5. If an out-of-order event arrives (wrong version), the listener will not find the document and can retry or discard.

### Affected Models

| Service | Model | Has Version |
|---------|-------|-------------|
| Order | Order | Yes |
| Product | Product | Yes |
| Inventory | Inventory | Yes |
| Inventory | Import | Yes |
| Inventory | ImportItem | Yes |
| Payment | Payment | Yes |

---

## 8. NatsWrapper Pattern

Each service (except Auth) implements a `NatsWrapper` singleton class:

```typescript
class NatsWrapper {
  private _client?: Stan;

  get client(): Stan { /* throws if not connected */ }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    // Connects to NATS Streaming
    // Resolves on 'connect', rejects on 'error'
  }
}

export const natsWrapper = new NatsWrapper();
```

**Startup pattern in each service:**

1. Validate env vars: `NATS_CLUSTER_ID`, `NATS_CLIENT_ID`, `NATS_URL`
2. Call `natsWrapper.connect(clusterId, clientId, url)`
3. Initialize listeners: `new SomeListener(natsWrapper.client).listen()`
4. Publishers use `natsWrapper.client` when publishing events

---

## 9. Queue Groups

Each listener uses a **queue group name** to ensure that when multiple replicas of a service are running, only one instance receives each message.

| Service | Queue Group Name |
|---------|-----------------|
| Order | `order-service` |
| Payment | `payment-service` |
| Inventory | `inventory-service` |
| Expiration | `expiration-service` |
| Product | `product-service` |

---

## 10. Reserved Event Subjects

The following subjects are defined in `SubjectsEnum` but have no active publishers or listeners:

| Subject | Potential Use |
|---------|--------------|
| `user:created`, `user:updated`, `user:deleted` | Future user sync across services |
| `product:deleted` | Future product deletion flow |
| `inventory:deleted` | Future inventory cleanup |
| `token:created`, `token:updated`, `token:deleted`, `token:expired` | Future token management |
| `cart:created`, `cart:updated`, `cart:deleted` | Future shopping cart service |
| `rating:created`, `rating:updated`, `rating:deleted` | Future product rating service |
| `payment:updated`, `payment:expired`, `payment:completed` | Future advanced payment flows |
