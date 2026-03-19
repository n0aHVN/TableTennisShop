# Client (Frontend) Documentation

This document describes the Angular 18 frontend application for TableTennisShop.

---

## 1. Overview

| Aspect | Detail |
|--------|--------|
| **Framework** | Angular 18 |
| **Language** | TypeScript 5.2+ |
| **Styling** | SCSS |
| **Port** | `4200` (default Angular dev server) |
| **Source location** | `client/src` |
| **Architecture** | Hybrid NgModule + standalone components |

---

## 2. Run Locally

```bash
cd client
npm install
ng serve
```

The app is available at `http://localhost:4200`.

### Key Dependencies

| Package | Version |
|---------|---------|
| `@angular/core` | ^18.0.0 |
| `@angular/router` | ^18.0.0 |
| `@angular/forms` | ^18.0.0 |
| `@angular/common` | ^18.0.0 |
| `rxjs` | ^7.8.0 |
| `zone.js` | ^0.14.0 |
| `typescript` | ^5.2.0 |

---

## 3. Application Bootstrap

**Entry point:** `src/main.ts`

The app uses `bootstrapApplication()` with `AppComponent` as the root standalone component. Providers are imported from `AppRoutingModule` and `CoreModule` via `importProvidersFrom()`.

---

## 4. Routing

**File:** `src/app/app-routing.module.ts`

| Path | Component / Module | Loading |
|------|--------------------|---------|
| `/` | Redirects to `/home` | -- |
| `/home` | `LandingComponent` | Lazy (`loadComponent`) |
| `/auth` | `AuthModule` | Lazy (`loadChildren`) |
| `/products` | `ProductModule` | Lazy (`loadChildren`) |
| `**` | Redirects to `/home` | -- |

### Auth Sub-routes

**File:** `src/app/features/auth/auth-routing.module.ts`

| Path | Component |
|------|-----------|
| `/auth` | Redirects to `/auth/login` |
| `/auth/login` | `LoginComponent` |
| `/auth/register` | `RegisterComponent` |

### Product Sub-routes

**File:** `src/app/features/product/product-routing.module.ts`

| Path | Component |
|------|-----------|
| `/products` | `ProductListComponent` |
| `/products/list` | `ProductListComponent` |

---

## 5. Module Structure

```
client/src/app/
├── app.component.ts            # Root standalone component (router-outlet)
├── app.module.ts               # Root NgModule (imports CoreModule)
├── app-routing.module.ts       # Top-level routes
├── core/
│   ├── core.module.ts          # Provides HTTP interceptors
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
├── shared/
│   ├── services/
│   │   ├── api.service.ts      # HTTP client wrapper
│   │   └── storage.service.ts  # LocalStorage + auth state
│   └── models/                 # TypeScript interfaces
├── features/
│   ├── home/
│   │   └── pages/landing/      # LandingComponent (standalone)
│   ├── auth/
│   │   ├── auth.module.ts      # AuthModule (NgModule)
│   │   ├── auth-routing.module.ts
│   │   └── pages/
│   │       ├── login/          # LoginComponent
│   │       └── register/       # RegisterComponent
│   └── product/
│       ├── product.module.ts   # ProductModule (NgModule)
│       ├── product-routing.module.ts
│       └── pages/
│           └── product-list/   # ProductListComponent
└── environments/
    ├── environment.ts          # Dev config
    └── environment.prod.ts     # Prod config
```

---

## 6. Key Services

### ApiService

**File:** `src/app/shared/services/api.service.ts`

Generic HTTP wrapper providing typed methods for all REST operations.

| Method | Signature | Description |
|--------|-----------|-------------|
| `get<T>()` | `get<T>(url: string): Observable<IApiResponse<T>>` | GET request |
| `post<T>()` | `post<T>(url: string, body: any): Observable<IApiResponse<T>>` | POST request |
| `put<T>()` | `put<T>(url: string, body: any): Observable<IApiResponse<T>>` | PUT request |
| `patch<T>()` | `patch<T>(url: string, body: any): Observable<IApiResponse<T>>` | PATCH request |
| `delete<T>()` | `delete<T>(url: string): Observable<IApiResponse<T>>` | DELETE request |

**Base URL:** `http://localhost:3000/api` (hardcoded, does not use `environment.apiUrl`).

---

### StorageService

**File:** `src/app/shared/services/storage.service.ts`

Manages authentication tokens and user state in `localStorage`.

| Method | Description |
|--------|-------------|
| `setToken(token)` | Store auth token |
| `getToken()` | Retrieve auth token |
| `setRefreshToken(token)` | Store refresh token |
| `getRefreshToken()` | Retrieve refresh token |
| `setCurrentUser(user)` | Store user object |
| `getCurrentUser()` | Get user as Observable |
| `getCurrentUserValue()` | Get user synchronously |
| `isAuthenticated()` | Check if token exists |
| `clearAll()` | Remove all stored data |

**Storage keys:** `auth_token`, `refresh_token`, `current_user`

**Reactive state:** Exposes `currentUser$` as a `BehaviorSubject` for reactive user state across components.

---

## 7. HTTP Interceptors

Registered in `CoreModule` via `HTTP_INTERCEPTORS`:

### AuthInterceptor

**File:** `src/app/core/interceptors/auth.interceptor.ts`

Adds `Authorization: Bearer <token>` header to all outgoing HTTP requests when a token exists in `StorageService`.

### ErrorInterceptor

**File:** `src/app/core/interceptors/error.interceptor.ts`

Catches HTTP errors, logs them to `console.error`, and rethrows with a normalized error object `{ status, message, error }`.

---

## 8. Backend Communication

| Setting | Development | Production |
|---------|------------|------------|
| **API Base URL** | `http://localhost:3000/api` | `https://api.tabletennis.shop/api` |
| **Auth mechanism** | Cookie session (JWT) | Cookie session (JWT) |
| **Proxy** | None | None |

**Environment files:**

- `src/environments/environment.ts` -- `apiUrl: 'http://localhost:3000/api'`
- `src/environments/environment.prod.ts` -- `apiUrl: 'https://api.tabletennis.shop/api'`

> **Note:** `ApiService` currently uses a hardcoded base URL rather than reading from the environment files. This should be updated for production deployments.

---

## 9. Path Aliases

**File:** `tsconfig.json`

| Alias | Maps To |
|-------|---------|
| `@app/*` | `src/app/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@core/*` | `src/app/core/*` |
| `@models/*` | `src/app/shared/models/*` |
| `@services/*` | `src/app/shared/services/*` |

---

## 10. Build Configuration

**File:** `angular.json`

| Setting | Value |
|---------|-------|
| Project name | `table-tennis-shop` |
| Builder | `@angular-devkit/build-angular` |
| Entry point | `src/main.ts` |
| Global styles | `src/styles.scss` |
| Assets | `src/favicon.ico`, `src/assets` |
| Initial bundle warning | 500 KB |
| Initial bundle error | 1 MB |
| Component style warning | 2 KB |
| Component style error | 4 KB |

---

## 11. Current Status and TODOs

The frontend is partially implemented. Based on code review:

| Feature | Status |
|---------|--------|
| App shell and routing | Implemented |
| Landing page | Implemented |
| Login page (UI) | Implemented |
| Register page (UI) | Implemented |
| Product list page | Implemented (uses mock data) |
| AuthService (API integration) | Not implemented |
| AuthGuard (route protection) | Not implemented |
| Product detail page | Not implemented |
| Shopping cart | Not implemented |
| Order management UI | Not implemented |
| Payment UI | Not implemented |
| Admin dashboard | Not implemented |

---

## 12. Risks and Recommendations

- `ApiService` uses a hardcoded base URL instead of environment configuration.
- `AuthService` is referenced in documentation but not yet implemented -- login and register forms are non-functional.
- No route guards exist -- all routes are accessible without authentication.
- `bootstrapApplication()` in `main.ts` uses `provideRouter([])` alongside `AppRoutingModule`, which may cause route conflicts.
- No unit or e2e tests are present in the client.
- Product list uses mock data rather than the backend API.
