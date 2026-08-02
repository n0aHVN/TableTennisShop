# Test Strategy

| Field | Value |
|-------|-------|
| **Version** | 0.1 (draft) |
| **Last updated** | 2026-08-02 |

---

## 1. Test levels

| Level | Where | Goal |
|-------|-------|------|
| Unit / route tests | `*/src/routes/__test__`, service tests | API contracts & domain rules |
| Integration (service + Mongo memory) | Existing Jest setups | Persistence & middleware |
| Contract (target) | OpenAPI + consumer tests | Prevent breaking changes |
| E2E / UAT | Manual or future Playwright | Critical business paths |

## 2. Commands (per service)

```bash
cd <service>
npm test
```

Shared types/events: exercise via service tests after `common` build.

## 3. UAT checklist (MVP)

| # | Scenario | Pass? |
|---|----------|-------|
| 1 | Sign up / sign in / current user | ☐ |
| 2 | Create product (authorized) + list | ☐ |
| 3 | Upload/view product media | ☐ |
| 4 | Import/update inventory; product reflects stock events | ☐ |
| 5 | Create order; payment create; order status updates via events | ☐ |
| 6 | Unpaid order expires via expiration service | ☐ |
| 7 | Cancel order; downstream services react | ☐ |
| 8 | Analytics endpoints denied for customer, allowed for staff | ☐ |

Map to FR ids in [FRD.md](../01-business/FRD.md).

## 4. Definition of done (change)

- Tests updated/added for behavior change
- Docs updated if API/event/role changed
- Access matrix updated if authz changed
- No secrets committed
