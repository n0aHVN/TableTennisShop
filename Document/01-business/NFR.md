# Non-Functional Requirements (NFR)

| Field | Value |
|-------|-------|
| **Version** | 0.1 (draft) |
| **Status** | Draft |
| **Last updated** | 2026-08-02 |

---

## 1. Environments

| Env | Purpose | Notes |
|-----|---------|-------|
| Local K8s (Docker Desktop kubeadm + Skaffold) | Day-to-day | Memory-constrained; use slim profiles |
| Future staging/prod | Not fully specified | Secrets, TLS, HA TBD |

## 2. Performance (MVP targets)

| Area | Target |
|------|--------|
| API p95 (local, single user) | < 500ms for simple GETs |
| Event propagation | Seconds, not minutes, on local NATS |
| Concurrent full-stack local | Prefer slim profile; full stack needs ≥6GB WSL/Docker RAM |

## 3. Availability & recovery

| Topic | Requirement |
|-------|-------------|
| RPO (local) | Best-effort; PVC/hostPath data may survive pod restart |
| RTO (local) | Recover by restarting Docker Desktop + `skaffold dev` |
| Prod HA | Not committed (single replica today) |

## 4. Security (summary)

See [SECURITY_BASELINE.md](../03-security/SECURITY_BASELINE.md).

- TLS on ingress for non-local environments.
- No prod secrets in git.
- JWT key from K8s secret.

## 5. Scalability

- Horizontal scale of app pods possible later; Mongo per service remains single primary unless redesigned.
- NATS Streaming is a known legacy choice (see ADRs).

## 6. Observability

| Signal | Current | Target |
|--------|---------|--------|
| Logs | `kubectl logs` / Skaffold stream | Structured JSON + correlation id |
| Metrics | Minimal | RED metrics per service |
| Traces | None | OpenTelemetry later |

## 7. Data retention

Draft only — see [DATA_DICTIONARY.md](../06-data/DATA_DICTIONARY.md).

| Data class | Retention (proposal) |
|------------|----------------------|
| Orders / payments | ≥ 5 years (commerce/audit intent) |
| Auth accounts | Until account deletion request |
| Product media | While product active + grace period |
| Dev secrets / local DB | Ephemeral |

## 8. Compliance posture

Not certified. Aim for **banking-lite controls**: least privilege, auditability of money/stock paths, no raw card data, documented gaps.
