# Data Dictionary (draft)

| Field | Value |
|-------|-------|
| **Version** | 0.1 |
| **Last updated** | 2026-08-02 |

Authoritative field lists remain in each service handbook / Mongoose models. This file classifies **cross-cutting** concerns.

Diagram: [../assets/Database-Structure.drawio](../assets/Database-Structure.drawio)

---

## 1. Datastores

| Store | Owner service | Notes |
|-------|---------------|-------|
| Mongo `auth` | Auth | Users, credentials |
| Mongo `product` | Product | Catalog, media refs |
| Mongo `order` | Order | Orders, analytics source |
| Mongo `payment` | Payment | Payment records |
| Mongo `inventory` | Inventory | Stock, imports |
| Mongo `config` | Config | CMS/landing settings |
| MinIO | Product (primary) | Object blobs |
| Redis | Expiration | Job / delay state |

## 2. Core entities (summary)

| Entity | PII? | Retention proposal | Notes |
|--------|------|--------------------|-------|
| User | **Yes** (email, username) | Until deletion request | Password hashed only |
| Product | No | While listed + archive | Media keys in MinIO |
| Order | **Partial** (user id link) | ≥ 5 years (intent) | Financial audit |
| Payment | **Partial** | ≥ 5 years (intent) | **No raw card data** |
| Inventory / ImportItem | No | Business need | Stock audit trail desired |
| Events (NATS) | Avoid PII | Ephemeral / short | Prefer ids over emails |

## 3. Event payload rule

Prefer opaque ids + version numbers. Do not put passwords, tokens, or full card numbers on the bus.

## 4. Gaps

- Formal column-level dictionary per collection TBD.
- Backup/restore procedures per PVC TBD in runbook expansion.
- Legal hold / export process TBD.
