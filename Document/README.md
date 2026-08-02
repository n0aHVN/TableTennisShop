# TableTennisShop — Documentation Index

**Standard:** banking-lite (business → architecture → security → services → operations → data)  
**Owner:** Engineering / PM  
**Last restructured:** 2026-08-02  

Use this index as the single entry point. Folder rules are also enforced by `.cursor/rules/documentation-structure.mdc`.

---

## 01 — Business & requirements

| Document | Description |
|----------|-------------|
| [BRD.md](./01-business/BRD.md) | Business requirements, scope, stakeholders |
| [FRD.md](./01-business/FRD.md) | Functional requirements & acceptance criteria |
| [NFR.md](./01-business/NFR.md) | Non-functional requirements (perf, avail, retention) |

## 02 — Architecture

| Document | Description |
|----------|-------------|
| [SYSTEM_ARCHITECTURE.md](./02-architecture/SYSTEM_ARCHITECTURE.md) | System context & container view |
| [EVENT_ARCHITECTURE.md](./02-architecture/EVENT_ARCHITECTURE.md) | NATS event catalog & flows |
| [INFRA_DOCUMENT.md](./02-architecture/INFRA_DOCUMENT.md) | Kubernetes, Skaffold, secrets (local) |
| [adr/](./02-architecture/adr/) | Architecture Decision Records |

## 03 — Security & access

| Document | Description |
|----------|-------------|
| [SECURITY_BASELINE.md](./03-security/SECURITY_BASELINE.md) | Auth, secrets, TLS, payment controls |
| [ACCESS_CONTROL_MATRIX.md](./03-security/ACCESS_CONTROL_MATRIX.md) | Role → API permissions |

## 04 — Service handbooks

| Document | Service |
|----------|---------|
| [AUTH_DOCUMENT.md](./04-services/AUTH_DOCUMENT.md) | Auth |
| [PRODUCT_DOCUMENT.md](./04-services/PRODUCT_DOCUMENT.md) | Product + media |
| [ORDER_DOCUMENT.md](./04-services/ORDER_DOCUMENT.md) | Order + analytics |
| [PAYMENT_DOCUMENT.md](./04-services/PAYMENT_DOCUMENT.md) | Payment |
| [INVENTORY_DOCUMENT.md](./04-services/INVENTORY_DOCUMENT.md) | Inventory |
| [EXPIRATION_DOCUMENT.md](./04-services/EXPIRATION_DOCUMENT.md) | Order expiration worker |
| [COMMON_DOCUMENT.md](./04-services/COMMON_DOCUMENT.md) | Shared `@tabletennisshop/common` |
| [CLIENT_DOCUMENT.md](./04-services/CLIENT_DOCUMENT.md) | Storefront (Next.js) |

## 05 — Operations

| Document | Description |
|----------|-------------|
| [RUNBOOK.md](./05-operations/RUNBOOK.md) | Start/stop, incidents, local cluster recovery |
| [TEST_STRATEGY.md](./05-operations/TEST_STRATEGY.md) | Test levels, UAT checklist |

## 06 — Data

| Document | Description |
|----------|-------------|
| [DATA_DICTIONARY.md](./06-data/DATA_DICTIONARY.md) | Entities, PII flags, retention (draft) |
| [Database-Structure.drawio](./assets/Database-Structure.drawio) | ER / structure diagram |

---

## Lightweight local profiles (memory)

Prefer slim Skaffold profiles when developing:

```bash
skaffold dev -f skaffold-minio.yaml   # product + mongo + minio + nats
skaffold dev                         # full stack (heavy)
```

See [RUNBOOK.md](./05-operations/RUNBOOK.md).
