# Client (Frontend) Documentation

| Field | Value |
|-------|-------|
| **Status** | Active — **Next.js** (Angular doc superseded) |
| **Last updated** | 2026-08-02 |

---

## 1. Overview

The storefront lives in `client/` and is a **Next.js** App Router application (not Angular).

| Aspect | Detail |
|--------|--------|
| **Framework** | Next.js `16.2.0` |
| **UI** | React `19.2.4` |
| **Styling** | Tailwind CSS v4 |
| **i18n** | `next-intl` |
| **State** | Zustand |
| **Motion** | Framer Motion, Lenis |
| **Source** | `client/src` |
| **Dev command** | `npm run dev` |

> Historical Angular 18 content previously in this file is **obsolete**. Do not follow `ng serve` / port `4200` instructions.

---

## 2. Run locally (recommended outside K8s)

Running the client on the host saves cluster RAM.

```bash
cd client
npm install
npm run dev
```

Default Next.js URL: `http://localhost:3000` (conflict possible if Skaffold port-forwards `client-service` to 3000 — adjust ports as needed).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

---

## 3. Backend communication

- APIs are exposed via ingress prefixes (`/api/users`, `/api/products`, …) or Skaffold port-forwards.
- Auth uses **cookie-session JWT** from the Auth service — same-site / proxy configuration must allow cookies.
- Media URLs: see client helpers (e.g. `client/src/lib/media-url.ts`) and Product/MinIO docs.

---

## 4. Deployment

- Image: `nguyennoah/client-ttshop` via `client/Dockerfile` (Skaffold artifact).
- Prefer **local `npm run dev`** during feature work; include client in full `skaffold dev` only when testing in-cluster routing.

---

## 5. Documentation gaps (TODO)

- Route map / app directory structure
- i18n locale strategy
- E2E smoke tests
- Accessibility checklist

## 6. Related docs

- [AUTH_DOCUMENT.md](./AUTH_DOCUMENT.md)
- [PRODUCT_DOCUMENT.md](./PRODUCT_DOCUMENT.md)
- [../05-operations/RUNBOOK.md](../05-operations/RUNBOOK.md)
- [../01-business/FRD.md](../01-business/FRD.md)
