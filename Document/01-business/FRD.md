# Functional Requirements Document (FRD)

| Field | Value |
|-------|-------|
| **Product** | TableTennisShop |
| **Version** | 0.1 (draft) |
| **Status** | Draft |
| **Last updated** | 2026-08-02 |

Derived from existing service handbooks. Each requirement should stay testable.

---

## 1. Identity & access

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-AUTH-01 | User can sign up | Valid email/username/password creates user; JWT session set | `04-services/AUTH_DOCUMENT.md` |
| FR-AUTH-02 | User can sign in / sign out | Credentials issue session; signout clears session | Auth |
| FR-AUTH-03 | Current user endpoint | Authenticated cookie returns current user; anonymous handled safely | Auth |
| FR-AUTH-04 | Role-based access | Protected APIs reject callers without required role | Auth + Access matrix |

## 2. Catalog & media

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-PRD-01 | List/get products | Paginated/list and get-by-id work | Product |
| FR-PRD-02 | Admin create/update product | Authorized role can mutate; events published | Product |
| FR-PRD-03 | Product media | Upload/serve via MinIO-backed APIs | Product |

## 3. Inventory

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-INV-01 | Track stock per product/variant | Inventory records CRUD as documented | Inventory |
| FR-INV-02 | Import stock | Import APIs update inventory and emit events | Inventory |
| FR-INV-03 | Sync to other services | Product/Order consume inventory events | Event architecture |

## 4. Order lifecycle

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-ORD-01 | Create order | Authenticated user creates order; `order:created` published | Order |
| FR-ORD-02 | List/get/update order | Owner/staff rules as documented | Order |
| FR-ORD-03 | Cancel order | Cancel emits `order:cancelled`; payment/inventory react | Order |
| FR-ORD-04 | Expire unpaid order | Expiration service emits `order:expired`; order transitions | Expiration + Order |
| FR-ORD-05 | Analytics (staff) | Stats/revenue/bestsellers require elevated role | Order |

## 5. Payment

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-PAY-01 | Create payment for order | Payment created for eligible order; `payment:created` published | Payment |
| FR-PAY-02 | React to order events | Payment service handles created/cancelled/updated | Payment |
| FR-PAY-03 | No raw card storage | System must not persist full PAN/CVV (control) | Security baseline |

## 6. Storefront

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-UI-01 | Browse catalog | Next.js client loads product data from APIs | Client |
| FR-UI-02 | Auth session | Cookie session works across API ingress host | Client + Auth |

## 7. Cross-cutting events

| ID | Requirement | Acceptance criteria | Primary doc |
|----|-------------|---------------------|-------------|
| FR-EVT-01 | At-least-once delivery | Publishers/subscribers use NATS Streaming + ACK | Event architecture |
| FR-EVT-02 | Optimistic concurrency | `version` field prevents stale writes | Event architecture |

---

## Traceability

Business goals → see [BRD.md](./BRD.md).  
API detail → `04-services/*`.  
Security → `03-security/*`.
