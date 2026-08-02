# Security Baseline

| Field | Value |
|-------|-------|
| **Version** | 0.1 (draft) |
| **Status** | Draft — not a certification |
| **Last updated** | 2026-08-02 |

Banking-lite controls for TableTennisShop. Gaps are explicit.

---

## 1. Authentication & session

| Control | Current state | Required |
|---------|---------------|----------|
| Credential auth | Email/username + password (bcrypt via common patterns) | Keep |
| Session | JWT in cookie-session | Document cookie flags for prod (`Secure`, `HttpOnly`, `SameSite`) |
| JWT secret | K8s `jwt-secret` | Never commit real prod keys |
| Logout | Clears session | Keep |

## 2. Authorization

See [ACCESS_CONTROL_MATRIX.md](./ACCESS_CONTROL_MATRIX.md). Enforce on **server** (middleware), never UI-only.

## 3. Transport & secrets

| Control | Local | Production target |
|---------|-------|-------------------|
| Ingress TLS | Often disabled / localhost | Mandatory TLS |
| Secrets in git | Dev defaults in YAML/scripts | External secret manager / sealed secrets |
| MinIO creds | `minio-secret` | Rotate; least privilege buckets |

## 4. Payment controls (critical)

| Control | Requirement | Current gap |
|---------|-------------|-------------|
| No raw PAN/CVV storage | Must not persist full card data | Confirm payment model fields; forbid card blobs |
| Tokenization / PSP | Prefer external processor | Not integrated yet — document as gap |
| Refund / chargeback | Process + audit trail | Not fully specified — track in FRD/Payment doc |
| Reconciliation | Daily order↔payment match report | Not implemented — backlog |

## 5. Audit logging (intent)

Log at least for money/stock paths:

- actor id / role
- action
- resource id
- timestamp
- correlation / request id (target)

Store logs outside mutable app containers in prod.

## 6. Data protection

- Classify fields in [DATA_DICTIONARY.md](../06-data/DATA_DICTIONARY.md) (PII flags).
- Minimize PII in events and logs.

## 7. Secure development

- Dependency updates on `common` and services.
- No secrets in client bundles.
- Rate-limit auth endpoints (target).

## 8. Known infra risks

From infra handbook: default JWT/MinIO secrets, TLS commented out, no probes/HPA — unacceptable for production banking workloads without remediation.
