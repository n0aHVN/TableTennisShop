# Quick Start Guide - Table Tennis Shop Angular Frontend

## Setup Instructions

### 1. Prerequisites

```bash
# Check Node.js version (14.x or higher)
node --version

# Check npm version (6.x or higher)
npm --version

# Install Angular CLI globally
npm install -g @angular/cli
```

### 2. Navigate to Client Directory

```bash
cd client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
ng serve
# or
npm start
```

The app will be available at `http://localhost:4200`

## File Structure Quick Reference

```
client/
├── src/
│   ├── app/
│   │   ├── core/                      # Global app setup
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── core.module.ts
│   │   ├── shared/                    # Reusable across app
│   │   │   ├── models/
│   │   │   │   ├── base.model.ts
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── product.model.ts
│   │   │   │   ├── api-response.model.ts
│   │   │   │   └── index.ts (barrel export)
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       ├── storage.service.ts
│   │   │       └── index.ts
│   │   ├── features/                  # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth-routing.module.ts
│   │   │   ├── product/
│   │   │   │   ├── pages/
│   │   │   │   │   └── product-list/
│   │   │   │   ├── product.module.ts
│   │   │   │   └── product-routing.module.ts
│   │   │   └── home/
│   │   │       └── pages/
│   │   │           └── landing/
│   │   ├── app.component.ts
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── main.ts
│   ├── index.html
│   ├── styles.scss
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

## Available Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Redirect to `/home` | Default route |
| `/home` | LandingComponent | Home/landing page |
| `/auth/login` | LoginComponent | User login |
| `/auth/register` | RegisterComponent | User registration |
| `/products` | ProductListComponent | Product catalog |
| `**` | Redirect to `/home` | Catch-all |

## Testing Pages

### 1. Landing Page
- **URL**: `http://localhost:4200/home`
- **Features**: Hero section, navigation, features showcase, CTAs
- **Status**: ✅ Complete

### 2. Login Page
- **URL**: `http://localhost:4200/auth/login`
- **Features**: Email/password form, validation, remember me
- **Status**: ✅ Complete (ready for backend integration)

### 3. Register Page
- **URL**: `http://localhost:4200/auth/register`
- **Features**: Registration form, validation, password match
- **Status**: ✅ Complete (ready for backend integration)

### 4. Product List
- **URL**: `http://localhost:4200/products`
- **Features**: Product grid, filters, search, pagination
- **Status**: ✅ Complete with mock data

## Next Steps - Implementation Tasks

### Task 1: Create AuthService
**File**: `src/app/features/auth/services/auth.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.apiService.post('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.storageService.setToken(response.token);
          this.storageService.setCurrentUser(response.user);
        })
      );
  }

  register(data: IRegisterRequest): Observable<IAuthResponse> {
    return this.apiService.post('/auth/register', data)
      .pipe(
        tap(response => {
          this.storageService.setToken(response.token);
          this.storageService.setCurrentUser(response.user);
        })
      );
  }
}
```

**Update LoginComponent**:
```typescript
onSubmit(): void {
  this.loading = true;
  this.authService.login(this.loginForm.value).subscribe(
    (response) => {
      this.router.navigate(['/products']);
    },
    (error) => {
      this.error = error.message;
      this.loading = false;
    }
  );
}
```

### Task 2: Create ProductService
**File**: `src/app/features/product/services/product.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(filters: IProductFilters): Observable<IPaginationResponse<IProduct>> {
    return this.apiService.get('/products', filters);
  }

  searchProducts(term: string): Observable<IProduct[]> {
    return this.apiService.get('/products/search', { q: term });
  }
}
```

**Update ProductListComponent**:
```typescript
loadProducts(): void {
  this.loading = true;
  this.productService.getProducts(this.filterForm.value).subscribe(
    (response) => {
      this.products = response.data;
      this.totalProducts = response.total;
      this.applyFilters();
      this.loading = false;
    }
  );
}
```

### Task 3: Add Route Guards
**File**: `src/app/core/guards/auth.guard.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}
```

### Task 4: Add Notifications/Toast
Install `@angular/material` or similar for toast notifications

### Task 5: Implement Shopping Cart
**File**: `src/app/features/cart/cart.module.ts`

## Useful Commands

```bash
# Generate a new component
ng generate component features/product/components/product-card

# Generate a new service
ng generate service features/auth/services/auth

# Generate a new module
ng generate module features/orders

# Run tests
ng test

# Build for production
ng build --configuration production

# Lint the code
ng lint

# Format code
ng lint --fix
```

## API Integration Notes

### Backend URL
- **Development**: `http://localhost:3000/api`
- **Production**: Update in `src/environments/environment.prod.ts`

### Expected API Endpoints

**Auth**
```
POST   /auth/login          - User login
POST   /auth/register       - User registration
POST   /auth/logout         - User logout
GET    /auth/me             - Current user
```

**Products**
```
GET    /products            - List products
GET    /products/:id        - Get product details
POST   /products            - Create product (admin)
PUT    /products/:id        - Update product (admin)
DELETE /products/:id        - Delete product (admin)
```

### Example API Response Format

```typescript
// Successful response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* IUser */ },
    "token": "eyJhbGc...",
    "refreshToken": "..."
  }
}

// Error response
{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_LOGIN"
}
```

## Debugging Tips

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Check Network tab for API calls
3. Check Console tab for errors
4. Check Application tab for localStorage tokens

### Angular DevTools
```bash
# Install Angular DevTools browser extension
# Available for Chrome and Firefox
# Shows component tree, change detection, etc.
```

### API Testing
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test products endpoint
curl http://localhost:3000/api/products
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Backend needs CORS headers
```typescript
// Backend (Express example)
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Issue: Token not being sent
**Solution**: Check AuthInterceptor in DevTools Network tab

### Issue: Products not loading
**Solution**: 
1. Check API endpoint in ApiService
2. Check mock data in ProductListComponent
3. Verify backend is running

### Issue: Form validation not working
**Solution**: Ensure ReactiveFormsModule is imported in module

## Performance Tips

1. **Use trackBy in *ngFor**:
   ```typescript
   <div *ngFor="let item of items; trackBy: trackBy">
   ```

2. **Use OnPush Change Detection**:
   ```typescript
   changeDetection: ChangeDetectionStrategy.OnPush
   ```

3. **Unsubscribe from observables**:
   ```typescript
   private destroy$ = new Subject<void>();
   
   ngOnInit() {
     this.service$.pipe(
       takeUntil(this.destroy$)
     ).subscribe();
   }
   
   ngOnDestroy() {
     this.destroy$.next();
   }
   ```

## Support & Documentation

- [Angular Docs](https://angular.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [RxJS Docs](https://rxjs.dev/)
- Project ARCHITECTURE.md - See advanced patterns
- Project FRONTEND_README.md - See detailed setup

---

**Happy Coding! 🎾**
