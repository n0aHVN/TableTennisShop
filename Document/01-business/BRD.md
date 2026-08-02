# Business Requirements Document (BRD)

| Field | Value |
|-------|-------|
| **Product** | TableTennisShop |
| **Version** | 0.1 (draft) |
| **Status** | Draft |
| **Last updated** | 2026-08-02 |

---

## 1. Purpose

Build a cloud-native e-commerce platform for table tennis equipment (catalog, stock, cart/order, payment orchestration, and storefront) using microservices so domains can scale and evolve independently.

## 2. Business objectives

1. Sell products (blades, rubbers, balls, etc.) with accurate stock and pricing.
2. Support authenticated customers and staff roles (owner/employee/admin patterns via `RoleEnum`).
3. Complete order lifecycle: create → reserve/pay window → pay or expire/cancel.
4. Provide operational analytics for owners/employees (order stats, revenue, bestsellers).
5. Store product media reliably (object storage / MinIO).

## 3. Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Customer | Browse, order, pay |
| Shop owner / employee | Catalog, inventory, orders, analytics |
| Engineering | Maintainable microservices, events, local K8s |
| Ops (future) | Deployability, observability, recovery |

## 4. In scope

- Auth (signup/signin/signout/current user)
- Product catalog + media
- Inventory & import stock
- Orders + expiration of unpaid orders
- Payments (create payment against order; event-driven)
- Client storefront
- Event bus (NATS Streaming) for cross-service sync
- Local Kubernetes development (Skaffold)

## 5. Out of scope (current)

- Production multi-region HA / formal DR drills
- Full PCI-DSS certified card processing / external PSP integration (document controls; implement later)
- Native mobile apps
- Formal OpenAPI publication to external partners (planned)
- Multi-tenant SaaS

## 6. Success metrics (initial)

| Metric | Target (dev/MVP) |
|--------|------------------|
| Happy-path order → payment event | Works in local K8s |
| Unpaid order expires | Expiration service cancels/expires order |
| Stock consistency | Inventory events reflected in product/order views |
| Docs | Indexed under banking-lite taxonomy |

## 7. Constraints & assumptions

- One MongoDB per domain service (database-per-service).
- JWT in cookie-session for browser clients.
- Local secrets are **dev-only** defaults; not for production.
- Full stack is memory-heavy; prefer slim Skaffold profiles for day-to-day work.

## 8. Related documents

- [FRD.md](./FRD.md)
- [NFR.md](./NFR.md)
- [../02-architecture/SYSTEM_ARCHITECTURE.md](../02-architecture/SYSTEM_ARCHITECTURE.md)
- [../03-security/SECURITY_BASELINE.md](../03-security/SECURITY_BASELINE.md)
