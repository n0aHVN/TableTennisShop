# Common Package Documentation

> **Taxonomy:** `Document/04-services/` · Index: [../README.md](../README.md)


This document describes the `@tabletennisshop/common` shared package, which provides enums, event interfaces, middleware, error classes, and types used across all microservices.

---

## 1. Overview

| Aspect | Detail |
|--------|--------|
| **Package name** | `@tabletennisshop/common` |
| **Source location** | `common/` |
| **Purpose** | Shared types, enums, events, middleware, and errors |
| **Consumers** | auth, order, product, payment, inventory, expiration |

### Build

```bash
cd common
npm install
npm run build
```

### Update Across Services

```bash
updateCommonPackage.bat
```

This clears npm cache and updates `@tabletennisshop/common` in all backend services.

---

## 2. Enums

### SubjectsEnum

NATS event subjects used across all services.

| Key | Value | Used By |
|-----|-------|---------|
| `UserCreated` | `user:created` | (reserved) |
| `UserUpdated` | `user:updated` | (reserved) |
| `UserDeleted` | `user:deleted` | (reserved) |
| `ProductCreated` | `product:created` | product â†’ order, inventory |
| `ProductUpdated` | `product:updated` | product â†’ order |
| `ProductDeleted` | `product:deleted` | (reserved) |
| `OrderCreated` | `order:created` | order â†’ payment, inventory, expiration |
| `OrderUpdated` | `order:updated` | order â†’ payment |
| `OrderCancelled` | `order:cancelled` | order â†’ payment |
| `OrderExpired` | `order:expired` | expiration â†’ order |
| `TokenCreated` | `token:created` | (reserved) |
| `TokenUpdated` | `token:updated` | (reserved) |
| `TokenDeleted` | `token:deleted` | (reserved) |
| `TokenExpired` | `token:expired` | (reserved) |
| `CartCreated` | `cart:created` | (reserved) |
| `CartUpdated` | `cart:updated` | (reserved) |
| `CartDeleted` | `cart:deleted` | (reserved) |
| `RatingCreated` | `rating:created` | (reserved) |
| `RatingUpdated` | `rating:updated` | (reserved) |
| `RatingDeleted` | `rating:deleted` | (reserved) |
| `InventoryCreated` | `inventory:created` | inventory â†’ product, order |
| `InventoryUpdated` | `inventory:updated` | inventory â†’ product, order |
| `InventoryDeleted` | `inventory:deleted` | (reserved) |
| `PaymentCreated` | `payment:created` | payment â†’ order |
| `PaymentUpdated` | `payment:updated` | (reserved) |
| `PaymentExpired` | `payment:expired` | (reserved) |
| `PaymentCompleted` | `payment:completed` | (reserved) |
| `ImportCreated` | `import:created` | (reserved) |
| `ImportItemCreated` | `import-item:created` | inventory â†’ order |
| `ImportItemUpdated` | `import-item:updated` | inventory â†’ order |

> Subjects marked as "(reserved)" are defined in the enum but not currently used by any listener or publisher.

---

### RoleEnum

User roles for authorization.

| Key | Value |
|-----|-------|
| `OWNER` | `owner` |
| `CUSTOMER` | `customer` |
| `EMPLOYEE` | `employee` |

---

### UserStatusEnum

| Key | Value |
|-----|-------|
| `ENABLE` | `enable` |
| `DISABLE` | `disable` |

---

### OrderStatusEnum

| Key | Value |
|-----|-------|
| `PENDING` | `pending` |
| `FINISHED` | `finished` |
| `EXPIRED` | `expired` |
| `CANCELLED` | `cancelled` |

---

### ProductTypeEnum

| Key | Value |
|-----|-------|
| `RACKET` | `racket` |
| `SHIRT` | `shirt` |
| `SPONGE` | `sponge` |

---

### ProductStatusEnum

| Key | Value |
|-----|-------|
| `ENABLE` | `enable` |
| `DISABLE` | `disable` |
| `OUT_OF_STOCK` | `out_of_stock` |

---

### PaymentMethodEnum

| Key | Value |
|-----|-------|
| `BANKING` | `banking` |
| `COD` | `cod` |

---

### ImportItemStatusEnum

| Key | Value |
|-----|-------|
| `IN_STOCK` | `in_stock` |
| `SOLD` | `sold` |
| `RETURNED` | `returned` |

---

## 3. Event Interfaces

All event interfaces follow the pattern `{ subject: SubjectsEnum; data: PayloadType }` and are used to type-check listeners and publishers.

### Order Events

**File:** `common/events/OrderEventInterface.ts`

| Interface | Subject | Payload |
|-----------|---------|---------|
| `OrderCreatedEventInterface` | `OrderCreated` | `OrderAttrs` |
| `OrderUpdatedEventInterface` | `OrderUpdated` | `OrderAttrs` |
| `OrderCancelledEventInterface` | `OrderCancelled` | `OrderAttrs` |
| `OrderExpiredCompleteEventInterface` | `OrderExpired` | `{ _id: string }` |

**OrderAttrs:**

```typescript
{
  _id: string;
  user_id: string;
  products: { product_id: string; price: number; quantity: number; item_codes: string[] }[];
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  total_price: number;
  expiresAt: string;
  version: number;
}
```

---

### Product Events

**File:** `common/events/ProductEventInterface.ts`

| Interface | Subject | Payload |
|-----------|---------|---------|
| `ProductCreatedEventInterface` | `ProductCreated` | `ProductAttrs` |
| `ProductUpdatedEventInterface` | `ProductUpdated` | `ProductAttrs` |
| `ProductDeletedEventInterface` | `ProductDeleted` | `ProductAttrs` |

**ProductAttrs:**

```typescript
{
  _id: string;
  status: ProductStatusEnum;
  price: number;
  version: number;
}
```

---

### Inventory Events

**File:** `common/events/InventoryEventInterface.ts`

| Interface | Subject | Payload |
|-----------|---------|---------|
| `InventoryCreatedEventInterface` | `InventoryCreated` | `InventoryAttrs` |
| `InventoryUpdatedEventInterface` | `InventoryUpdated` | `InventoryAttrs` |
| `InventoryDeleteEventInterface` | `InventoryDeleted` | `InventoryAttrs` |

**InventoryAttrs:**

```typescript
{
  _id: string;
  product_id: string;
  total_quantity: number;
  version: number;
}
```

---

### Payment Events

**File:** `common/events/PaymentEventInterface.ts`

| Interface | Subject | Payload |
|-----------|---------|---------|
| `PaymentCreatedEventInterface` | `PaymentCreated` | `PaymentAttrs` |

**PaymentAttrs:**

```typescript
{
  _id: string;
  order_id: string;
  user_id: string;
}
```

---

### Import Events

**File:** `common/events/ImportEventInterface.ts`

| Interface | Subject | Payload |
|-----------|---------|---------|
| `ImportCreatedEventInterface` | `ImportCreated` | `ImportAttrs` |
| `ImportItemCreatedEventInterface` | `ImportItemCreated` | `ImportItemAttrs` |
| `ImportItemUpdatedEventInterface` | `ImportItemUpdated` | `ImportItemAttrs` |

**ImportAttrs:**

```typescript
{
  _id: string;
  product_id: string;
  quantity: number;
  import_price: number;
  supplier?: string;
  note?: string;
  version: number;
}
```

**ImportItemAttrs:**

```typescript
{
  _id: string;
  import_id: string;
  product_id: string;
  item_code: string;
  import_price: number;
  status: ImportItemStatusEnum;
  order_id?: string;
  sold_at?: string;
  version: number;
}
```

---

## 4. Base Event Classes

### ListenerAbstract

**File:** `common/events/ListenerAbstract.ts`

Abstract base class for all NATS event listeners.

| Property / Method | Description |
|-------------------|-------------|
| `subject` | Abstract -- the NATS subject to subscribe to |
| `queueGroupName` | Abstract -- durable subscription group name |
| `onMessage(data, msg)` | Abstract -- handler for incoming messages |
| `ackWait` | 5 seconds (default acknowledgement timeout) |
| `subscriptionOptions()` | Delivers all available messages, manual ACK, durable name |
| `listen()` | Subscribes to the subject with queue group |
| `parseMessage(msg)` | Parses message data from string or buffer to JSON |

**Subscription behavior:**
- `setDeliverAllAvailable()` -- replays all historical messages on first connect.
- `setManualAckMode(true)` -- requires explicit `msg.ack()` in handler.
- `setDurableName(queueGroupName)` -- remembers last acknowledged message across reconnects.

---

### PublisherAbstract

**File:** `common/events/PublisherAbstract.ts`

Abstract base class for all NATS event publishers.

| Property / Method | Description |
|-------------------|-------------|
| `subject` | Abstract -- the NATS subject to publish to |
| `publish(data)` | Serializes data to JSON and publishes to the subject. Returns a Promise. |

---

## 5. Middleware

### CurrentUserMiddleware

**File:** `common/middlewares/current-user-middleware.ts`

Reads `req.session?.jwt`, verifies it using `JWT_KEY`, and sets `req.currentUser` with the decoded payload (`username`, `email`, `type`, `_id`). If no session or verification fails, the request proceeds without `req.currentUser`.

---

### CheckAuthorizedMiddleware

**File:** `common/middlewares/check-authorized-middleware.ts`

Checks for `req.session?.jwt`. If missing, throws `NotAuthorizedError` (401). Must be placed **before** `CurrentUserMiddleware` if both are used.

---

### CheckType

**File:** `common/middlewares/check-type.middleware.ts`

Factory function that returns middleware requiring `req.currentUser.type` to be in the provided roles array. Throws "Not Authorized" if the role does not match.

**Usage:** `CheckType(["owner", "employee"])`

---

### ValidateRequestMiddleware

**File:** `common/middlewares/validate-request-middleware.ts`

Reads `validationResult(req)` from express-validator. If validation errors exist, throws `RequestValidateError` with the serialized errors.

---

### ErrorHandlerMiddleware

**File:** `common/middlewares/error-handler.ts`

Global Express error handler. If the error is an instance of `CustomError`, sends `err.statusCode` with `{ errors: err.serializeErrors() }`. Otherwise, sends status 400 with `{ errors: [{ message: err.message }] }`.

---

## 6. Custom Error Classes

**Base class:** `common/errors/custom-error.ts`

```typescript
abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract serializeErrors(): { message: string; details?: any }[];
}
```

### Concrete Errors

| Error Class | Status Code | File | Use Case |
|-------------|------------|------|----------|
| `BadRequestError` | 400 | `common/errors/bad-request-error.ts` | General bad request |
| `NotFoundError` | 401 | `common/errors/not-found-error.ts` | Resource not found |
| `NotAuthorizedError` | 401 | `common/errors/not-authorized-error.ts` | Unauthorized access |
| `RequestValidateError` | 400 | `common/errors/request-validate-error.ts` | express-validator failures |

> **Note:** `NotFoundError` returns status code **401** instead of the conventional **404**. This appears to be a bug in the implementation.

### Error Response Format

All errors are serialized by `ErrorHandlerMiddleware` into:

```json
{
  "errors": [
    { "message": "Error description", "details": "optional field or context" }
  ]
}
```

---

## 7. Shared Types

### ApiResponse\<T\>

**File:** `common/types/base.ts`

Standard response wrapper used by all services:

```typescript
type ApiResponse<T = unknown> = {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  error?: {
    code: string;
    message: string;
    field?: string;
  };
};
```

---

## 8. Package Structure

```
common/
â”œâ”€â”€ enums/
â”‚   â”œâ”€â”€ event-subject.enum.ts     # SubjectsEnum
â”‚   â”œâ”€â”€ role.enum.ts              # RoleEnum
â”‚   â”œâ”€â”€ user-status.enum.ts       # UserStatusEnum
â”‚   â”œâ”€â”€ order-status.enum.ts      # OrderStatusEnum
â”‚   â”œâ”€â”€ product-type.enum.ts      # ProductTypeEnum
â”‚   â”œâ”€â”€ product-status.enum.ts    # ProductStatusEnum
â”‚   â”œâ”€â”€ payment-method.enum.ts    # PaymentMethodEnum
â”‚   â””â”€â”€ import-item-status.enum.ts # ImportItemStatusEnum
â”œâ”€â”€ events/
â”‚   â”œâ”€â”€ ListenerAbstract.ts       # Base listener class
â”‚   â”œâ”€â”€ PublisherAbstract.ts      # Base publisher class
â”‚   â”œâ”€â”€ OrderEventInterface.ts    # Order event types
â”‚   â”œâ”€â”€ ProductEventInterface.ts  # Product event types
â”‚   â”œâ”€â”€ InventoryEventInterface.ts # Inventory event types
â”‚   â”œâ”€â”€ ImportEventInterface.ts   # Import event types
â”‚   â””â”€â”€ PaymentEventInterface.ts  # Payment event types
â”œâ”€â”€ middlewares/
â”‚   â”œâ”€â”€ current-user-middleware.ts
â”‚   â”œâ”€â”€ check-authorized-middleware.ts
â”‚   â”œâ”€â”€ check-type.middleware.ts
â”‚   â”œâ”€â”€ validate-request-middleware.ts
â”‚   â””â”€â”€ error-handler.ts
â”œâ”€â”€ errors/
â”‚   â”œâ”€â”€ custom-error.ts
â”‚   â”œâ”€â”€ bad-request-error.ts
â”‚   â”œâ”€â”€ not-found-error.ts
â”‚   â”œâ”€â”€ not-authorized-error.ts
â”‚   â””â”€â”€ request-validate-error.ts
â”œâ”€â”€ types/
â”‚   â””â”€â”€ base.ts                   # ApiResponse type
â””â”€â”€ index.ts                      # Barrel export
```
