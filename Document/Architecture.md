# System Architecture Document

**Document Version:** 1.0  
**Last Updated:** January 25, 2026  
**Author:** Technical Architecture Team  
**Status:** Approved

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Design Principles](#design-principles)
3. [Service Architecture](#service-architecture)
4. [Data Architecture](#data-architecture)
5. [Communication Patterns](#communication-patterns)
6. [Security Architecture](#security-architecture)
7. [Scalability & Performance](#scalability--performance)
8. [Disaster Recovery](#disaster-recovery)

---

## Architecture Overview

### Architecture Style
**Microservices Architecture** with event-driven communication patterns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Load Balancer                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Ingress Controller                        │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────────┘
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
   ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐
   │Auth│    │Prod│    │Inv │    │Ord │    │Pay │
   │Svc │    │Svc │    │Svc │    │Svc │    │Svc │
   └─┬──┘    └─┬──┘    └─┬──┘    └─┬──┘    └─┬──┘
     │         │         │         │         │
     ▼         ▼         ▼         ▼         ▼
   ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐
   │Mongo│   │Mongo│   │Mongo│   │Mongo│   │Mongo│
   └────┘    └────┘    └────┘    └────┘    └────┘

              ┌──────────────────────────┐
              │   NATS Streaming Server  │  (Event Bus)
              └──────────────────────────┘
                          ▲
                          │
                    ┌─────┴─────┐
                    │ Expiration│
                    │  Service  │
                    └───────────┘
```

---

## Design Principles

### 1. Domain-Driven Design (DDD)
- Each microservice owns a specific business domain
- Clear bounded contexts
- Services are autonomous and independently deployable

### 2. Single Responsibility
- Each service has one reason to change
- Focused business capabilities
- Minimal coupling between services

### 3. API-First Design
- Well-defined API contracts
- Versioned APIs for backward compatibility
- RESTful conventions

### 4. Event-Driven Architecture
- Asynchronous communication for non-blocking operations
- Event sourcing for audit trails
- Eventual consistency model

### 5. Defense in Depth
- Multiple layers of security
- Authentication at API gateway
- Authorization at service level
- Data encryption at rest and in transit

### 6. Observability
- Structured logging
- Distributed tracing
- Metrics and monitoring
- Health checks for all services

---

## Service Architecture

### 1. Authentication Service (auth)

**Purpose:** Identity and access management

**Responsibilities:**
- User registration and email verification
- Login with JWT token issuance
- Password reset and recovery
- Session management
- Role-based access control (RBAC)

**API Endpoints:**
```
POST   /api/auth/signup       - User registration
POST   /api/auth/signin       - User login
POST   /api/auth/signout      - User logout
GET    /api/auth/currentuser  - Get current authenticated user
POST   /api/auth/reset        - Password reset
```

**Events Published:**
- `UserCreated`
- `UserUpdated`
- `UserDeleted`

**Database:** MongoDB (users collection)

---

### 2. Product Service (product)

**Purpose:** Product catalog management

**Responsibilities:**
- CRUD operations for products
- Product categorization and tagging
- Search and filtering
- Pricing management
- Product images and media

**API Endpoints:**
```
GET    /api/products           - List all products (with pagination)
GET    /api/products/:id       - Get product details
POST   /api/products           - Create product (admin only)
PUT    /api/products/:id       - Update product (admin only)
DELETE /api/products/:id       - Delete product (admin only)
GET    /api/products/search    - Search products
```

**Events Published:**
- `ProductCreated`
- `ProductUpdated`
- `ProductDeleted`
- `ProductPriceChanged`

**Database:** MongoDB (products collection)

---

### 3. Inventory Service (inventory)

**Purpose:** Stock and inventory management

**Responsibilities:**
- Real-time stock tracking
- Stock reservation for pending orders
- Stock release on order cancellation
- Low stock alerts
- Inventory replenishment tracking

**API Endpoints:**
```
GET    /api/inventory/:productId     - Get stock level
POST   /api/inventory/reserve        - Reserve stock
POST   /api/inventory/release        - Release reserved stock
PUT    /api/inventory/:productId     - Update stock level (admin)
```

**Events Published:**
- `InventoryReserved`
- `InventoryReleased`
- `StockUpdated`
- `LowStockAlert`

**Events Consumed:**
- `OrderCreated` → Reserve inventory
- `OrderCancelled` → Release inventory
- `OrderExpired` → Release inventory

**Database:** MongoDB (inventory collection)

---

### 4. Order Service (order)

**Purpose:** Order lifecycle management

**Responsibilities:**
- Order creation and validation
- Order status tracking
- Order history
- Order cancellation
- Shopping cart management

**API Endpoints:**
```
POST   /api/orders              - Create new order
GET    /api/orders              - List user's orders
GET    /api/orders/:id          - Get order details
PATCH  /api/orders/:id/cancel   - Cancel order
```

**Order States:**
- `Created` → Order placed, awaiting payment
- `AwaitingPayment` → Payment processing
- `Paid` → Payment confirmed
- `Cancelled` → Order cancelled by user or expired
- `Completed` → Order fulfilled

**Events Published:**
- `OrderCreated`
- `OrderCancelled`
- `OrderCompleted`

**Events Consumed:**
- `PaymentProcessed` → Mark order as paid
- `OrderExpired` → Cancel order

**Database:** MongoDB (orders collection)

---

### 5. Payment Service (payment)

**Purpose:** Payment processing

**Responsibilities:**
- Payment authorization and capture
- Integration with payment gateways (Stripe, PayPal, etc.)
- Refund processing
- Payment history
- Transaction logging

**API Endpoints:**
```
POST   /api/payments            - Process payment
GET    /api/payments/:orderId   - Get payment status
POST   /api/payments/refund     - Issue refund (admin)
```

**Events Published:**
- `PaymentProcessed`
- `PaymentFailed`
- `RefundIssued`

**Events Consumed:**
- `OrderCreated` → Initiate payment flow

**Database:** MongoDB (payments collection)

---

### 6. Expiration Service (expiration)

**Purpose:** Time-based order expiration

**Responsibilities:**
- Monitor pending orders
- Trigger expiration after timeout (e.g., 15 minutes)
- Release reserved inventory
- Cancel unpaid orders

**Events Published:**
- `OrderExpired`

**Events Consumed:**
- `OrderCreated` → Start expiration timer

**Database:** Redis (for TTL-based queue)

---

### 7. Client Service (client)

**Purpose:** User-facing web application

**Responsibilities:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- API integration
- State management
- Responsive UI/UX

**Technology:** Next.js, React, TypeScript

---

### 8. Common Library (common)

**Purpose:** Shared code across services

**Contents:**
- TypeScript types and interfaces
- Custom error classes
- Middleware functions (auth, validation, error handling)
- Event definitions and base classes
- Utility functions

**Distribution:** Published as NPM package

---

## Data Architecture

### Database-per-Service Pattern
Each microservice owns its database to ensure:
- Data encapsulation
- Independent scaling
- Technology flexibility
- Fault isolation

### Data Consistency
- **Strong consistency:** Within a single service
- **Eventual consistency:** Across services via events
- **Saga pattern:** For distributed transactions

### Data Schema Example (Order)

```typescript
interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
```

---

## Communication Patterns

### 1. Synchronous Communication (REST APIs)

**Use Cases:**
- Client-to-service requests
- Real-time data retrieval
- Immediate feedback required

**Example Flow:**
```
Client → GET /api/products → Product Service → Response
```

**Considerations:**
- Request/response timeout: 5 seconds
- Retry logic with exponential backoff
- Circuit breaker pattern for resilience

---

### 2. Asynchronous Communication (NATS Events)

**Use Cases:**
- Inter-service communication
- Non-blocking operations
- Event-driven workflows

**Event Flow Example:**
```
1. User creates order
2. Order Service publishes OrderCreated event
3. Inventory Service consumes event → Reserves stock
4. Payment Service consumes event → Initiates payment
5. Expiration Service consumes event → Starts timer
```

**Event Structure:**
```typescript
interface Event {
  subject: string;          // e.g., "order:created"
  data: any;                // Event payload
  timestamp: Date;
  version: string;          // Event schema version
}
```

---

## Security Architecture

### 1. Authentication
- JWT-based authentication
- Token expiration: 15 minutes (access token)
- Refresh token rotation
- Secure HTTP-only cookies

### 2. Authorization
- Role-based access control (RBAC)
- Middleware enforcement at service level
- Principle of least privilege

### 3. Data Protection
- TLS 1.3 for data in transit
- MongoDB encryption at rest
- Sensitive data masking in logs
- PII compliance (GDPR, CCPA)

### 4. API Security
- Rate limiting (100 requests/min per user)
- Input validation and sanitization
- SQL/NoSQL injection prevention
- CORS configuration

---

## Scalability & Performance

### Horizontal Scaling
- Kubernetes auto-scaling based on CPU/memory
- Stateless service design
- Database read replicas

### Caching Strategy
- Redis for session storage
- Product catalog caching (TTL: 5 minutes)
- CDN for static assets

### Performance Targets
- API response time: <100ms (p95)
- Database query time: <50ms (p95)
- Event processing time: <1 second

---

## Disaster Recovery

### Backup Strategy
- MongoDB automated daily backups
- Point-in-time recovery (PITR)
- Backup retention: 30 days

### High Availability
- Multi-zone deployment
- Database replication (3 replicas)
- Health checks and auto-recovery

### Recovery Time Objectives (RTO)
- RTO: 1 hour
- RPO: 15 minutes
