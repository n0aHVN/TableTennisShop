# ADR-001: NATS Streaming as event bus

| Field | Value |
|-------|-------|
| **Status** | Accepted (legacy-aware) |
| **Date** | 2026-08-02 |
| **Deciders** | Engineering |

## Context

Services need async integration for order, payment, inventory, and product updates without distributed transactions.

## Decision

Use **NATS Streaming** (`nats-streaming:0.17.0`) with cluster id `ticketing`, queue groups, and manual ACK. Shared event types live in `@tabletennisshop/common`.

## Consequences

- **Positive:** Simple local deploy; existing code/docs mature.
- **Negative:** NATS Streaming is deprecated upstream; limited cloud ecosystem vs JetStream/Kafka.
- **Follow-up:** Plan migration ADR when touching messaging heavily.
