# ADR-002: Database per service (MongoDB)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-02 |

## Context

Microservices must own their data to avoid shared-DB coupling.

## Decision

Each domain service uses its **own MongoDB** deployment/PVC (auth, product, order, payment, inventory, config). Cross-service data is replicated via events.

## Consequences

- **Positive:** Clear ownership; independent schema evolution.
- **Negative:** Higher local memory (many `mongod` processes); eventual consistency complexity.
- **Mitigation:** WiredTiger cache limits; slim Skaffold profiles for day-to-day work.
