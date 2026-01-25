# Table Tennis Shop - Component & Flow Diagram

## 🏗️ Project Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     App Component                           │
│                   (app.component.ts)                        │
│                     <router-outlet>                         │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Landing Page    Auth Module      Product Module
   (Standalone)    (Lazy-loaded)    (Lazy-loaded)
        │                │                │
        │         ┌───────┴───────┐       │
        │         ▼               ▼       │
        │    LoginComponent  RegisterComponent
        │         │               │       │
        └─────────┼───────────────┼───────┘
                  │               │
                  ▼               ▼
            ProductListComponent (Shared Landing)
```

---

## 📊 Module Dependencies

```
AppModule
├── CoreModule (Singleton)
│   ├── AuthInterceptor
│   └── ErrorInterceptor
├── AppRoutingModule
└── HttpClientModule
    
AuthModule (Lazy)
├── LoginComponent
├── RegisterComponent
└── AuthRoutingModule
    
ProductModule (Lazy)
├── ProductListComponent
├── ProductRoutingModule
└── ProductService (TODO)

SharedModule (Implicit)
├── Models
│   ├── auth.model.ts
│   ├── product.model.ts
│   ├── api-response.model.ts
│   └── base.model.ts
└── Services
    ├── ApiService
    └── StorageService
```

---

## 🔄 Data Flow Diagrams

### Login Flow

```
┌──────────────┐
│ Login Form   │
│ (User Input) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Form Validation      │
│ - Email format       │
│ - Password length    │
└──────┬───────────────┘
       │
       ▼ (Valid)
┌──────────────────────┐
│ AuthService.login()  │
│ (Call backend)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ ApiService.post()        │
│ /auth/login              │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ AuthInterceptor          │
│ (Add JWT to header)      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Backend API              │
│ POST /auth/login         │
└──────┬───────────────────┘
       │
       ▼ (Success)
┌──────────────────────────┐
│ Response                 │
│ { user, token }          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ StorageService           │
│ - setToken()             │
│ - setCurrentUser()       │
│ - currentUser$ emits     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Navigate to /products    │
│ User logged in ✓         │
└──────────────────────────┘
```

### Product Filtering Flow

```
┌──────────────────────┐
│ ProductListComponent │
│ ngOnInit()           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Load Mock Data           │
│ products: IProduct[]     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ User Interacts Filters   │
│ - Search                 │
│ - Category               │
│ - Price Range            │
│ - Sort Options           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ onFilterChange()         │
│ Triggered               │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ applyFilters()           │
│ - Search filter          │
│ - Category filter        │
│ - Type filter            │
│ - Price filter           │
│ - Sort & order           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ filteredProducts: []     │
│ Updated                  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ displayedProducts        │
│ (Paginated)              │
│ Updated                  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Template Re-renders      │
│ Products Grid Updated ✓  │
└──────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
app-root
├── app-landing (/)
│   ├── Navbar
│   ├── Hero Section
│   ├── Features Section
│   │   ├── Feature Card (×4)
│   ├── Products Showcase
│   │   ├── Product Card (×4)
│   ├── Stats Section
│   │   ├── Stat Item (×4)
│   ├── CTA Section
│   └── Footer
│
├── app-login (/auth/login)
│   ├── Login Card
│   │   ├── Header
│   │   ├── Form
│   │   │   ├── Email Field
│   │   │   ├── Password Field
│   │   │   ├── Remember Me
│   │   │   ├── Submit Button
│   │   │   └── Links
│   │   └── Sign Up Link
│
├── app-register (/auth/register)
│   ├── Register Card
│   │   ├── Header
│   │   ├── Form
│   │   │   ├── First Name Field
│   │   │   ├── Last Name Field
│   │   │   ├── Email Field
│   │   │   ├── Password Field
│   │   │   ├── Confirm Password
│   │   │   ├── Terms Checkbox
│   │   │   ├── Submit Button
│   │   │   └── Links
│   │   └── Sign In Link
│
└── app-product-list (/products)
    ├── Header
    ├── Layout
    │   ├── Filters Sidebar
    │   │   ├── Search Input
    │   │   ├── Category Select
    │   │   ├── Type Select
    │   │   ├── Price Range
    │   │   ├── Sort Options
    │   │   └── Reset Button
    │   └── Products Grid
    │       ├── Results Info
    │       ├── Product Card (×12)
    │       │   ├── Image
    │       │   ├── Name
    │       │   ├── Description
    │       │   ├── Meta (Badges)
    │       │   ├── Rating
    │       │   ├── Price
    │       │   └── Actions (Details, Add to Cart)
    │       └── Pagination
    │           ├── Previous Button
    │           ├── Page Info
    │           └── Next Button
```

---

## 📦 Service Interaction Map

```
Components
    │
    ├──→ AuthService (TODO)
    │    └──→ ApiService
    │        └──→ HttpClient
    │            └──→ [AuthInterceptor]
    │                └──→ [ErrorInterceptor]
    │                    └──→ Backend
    │
    ├──→ ProductService (TODO)
    │    └──→ ApiService
    │        └──→ HttpClient
    │            └──→ [AuthInterceptor]
    │                └──→ [ErrorInterceptor]
    │                    └──→ Backend
    │
    └──→ StorageService
         ├──→ localStorage
         └──→ BehaviorSubject (currentUser$)
```

---

## 🔌 HTTP Request Flow

```
Component
    │
    ▼
Service Method (e.g., authService.login())
    │
    ▼
ApiService Method (e.g., post())
    │
    ▼
HttpClient.post()
    │
    ▼
┌─────────────────────────────┐
│   AuthInterceptor           │
│   1. Get token from storage │
│   2. Add Authorization      │
│      header with JWT        │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│   Network Request           │
│   POST /auth/login          │
│   Authorization: Bearer ... │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│   Backend Response          │
│   { success, data, error }  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│   ErrorInterceptor          │
│   1. Check for errors       │
│   2. Log errors             │
│   3. Pass to component      │
└─────────────────────────────┘
    │
    ▼
Observable Stream
    │
    ▼
Component (subscribe)
    └──→ Success: Update state
    └──→ Error: Display error
```

---

## 🗂️ File Organization Tree

```
client/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── models/
│   │   │   │   ├── base.model.ts
│   │   │   │   ├── api-response.model.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── product.model.ts
│   │   │   │   └── index.ts
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       ├── storage.service.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── login.component.ts
│   │   │   │   │   │   ├── login.component.html
│   │   │   │   │   │   └── login.component.scss
│   │   │   │   │   └── register/
│   │   │   │   │       ├── register.component.ts
│   │   │   │   │       ├── register.component.html
│   │   │   │   │       └── register.component.scss
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth-routing.module.ts
│   │   │   │
│   │   │   ├── product/
│   │   │   │   ├── pages/
│   │   │   │   │   └── product-list/
│   │   │   │   │       ├── product-list.component.ts
│   │   │   │   │       ├── product-list.component.html
│   │   │   │   │       └── product-list.component.scss
│   │   │   │   ├── product.module.ts
│   │   │   │   └── product-routing.module.ts
│   │   │   │
│   │   │   └── home/
│   │   │       └── pages/
│   │   │           └── landing/
│   │   │               ├── landing.component.ts
│   │   │               ├── landing.component.html
│   │   │               └── landing.component.scss
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   │
│   ├── main.ts
│   ├── index.html
│   ├── styles.scss
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
│
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── package.json
├── FRONTEND_README.md
├── ARCHITECTURE.md
├── QUICK_START.md
├── FILE_INDEX.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 🎨 Color & Styling System

```
Primary Colors:
┌──────────────────────────────┐
│ Primary Purple: #667eea      │
│ Secondary Purple: #764ba2    │
│ Gradient: 135deg             │
└──────────────────────────────┘

Neutral Colors:
┌──────────────────────────────┐
│ Dark Text: #333              │
│ Medium Text: #666            │
│ Light Text: #999             │
│ Borders: #ddd                │
│ Backgrounds: #f8f9fa         │
└──────────────────────────────┘

Status Colors:
┌──────────────────────────────┐
│ Error: #f44336               │
│ Warning: #ff9800             │
│ Success: #4caf50             │
│ Info: #2196f3                │
└──────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 480px   (Phone)
Tablet:     < 768px   (iPad)
Desktop:    > 768px   (Laptop)
Large:      > 1200px  (Large Monitor)

Grid Changes:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Large: 4-6 columns
```

---

## 🔐 Security Flow

```
User Data (Form)
    │
    ▼
[Client-side Validation]
    │
    ▼
[HTTPS Encryption]
    │
    ▼
[Send to Backend]
    │
    ▼
[Backend Validation]
    │
    ▼
[Database Storage]
    │
    ▼
[JWT Token Generated]
    │
    ▼
[Client receives Token]
    │
    ▼
[StorageService saves]
    │
    ▼
[AuthInterceptor adds to requests]
    │
    ▼
[Backend validates JWT]
    │
    ▼
[Access granted]
```

---

## 📈 Performance Optimization

```
Initial Load Sequence:
1. Load main.ts
2. Bootstrap AppComponent
3. Load AppModule
4. Render Landing (empty bundle)
5. User clicks /auth
6. Lazy load AuthModule (~50kb)
7. Render Login/Register
8. User clicks /products
9. Lazy load ProductModule (~50kb)
10. Render Product List

Tree-shaking removes unused code
Compression reduces bundle size
Lazy loading speeds up initial load
```

---

## 🧪 Testing Pyramid

```
        /\
       /  \  E2E Tests
      /────\
     /      \
    /────────\  Integration Tests
   /          \
  /────────────\ Unit Tests
 /              \
──────────────────
```

**Current Status**: Framework ready for all levels

---

**This architecture is designed to scale with your application!**
