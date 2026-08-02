# ADR-003: JWT in cookie-session

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-02 |

## Context

Browser clients need authenticated calls to multiple APIs behind ingress.

## Decision

Issue JWT after signup/signin and store it in **cookie-session** (`req.session.jwt`). `CurrentUserMiddleware` hydrates `req.currentUser`.

## Consequences

- **Positive:** Works with same-site browser flows; shared middleware in `common`.
- **Negative:** CSRF considerations for cookie auth; mobile/SPA cross-origin needs careful cookie flags.
- **Security:** See `03-security/SECURITY_BASELINE.md`.
