# Architecture Guide - Table Tennis Shop Frontend

## Design Philosophy

This frontend is built with **senior-level architecture principles** prioritizing:

1. **Scalability** - Easy to add new features
2. **Maintainability** - Clear separation of concerns
3. **Type Safety** - Strong TypeScript usage
4. **Performance** - Lazy loading, tree-shaking
5. **Testability** - Isolated, mockable services

## Module Organization

### Feature Modules

Each feature is self-contained with its own:
- **Pages**: Main components
- **Models**: Type definitions
- **Services**: Business logic
- **Routing**: Feature-specific routes

```
Feature Module
├── pages/
│   └── [page-name]/
│       ├── [page].component.ts
│       ├── [page].component.html
│       └── [page].component.scss
├── services/
│   └── [feature].service.ts
├── models/
│   └── [feature].model.ts
├── [feature].module.ts
└── [feature]-routing.module.ts
```

### Auth Feature

**Purpose**: Manage user authentication and authorization

**Components**:
- `LoginComponent`: User login form
- `RegisterComponent`: User registration form

**Services** (TODO - Implement):
- `AuthService`: Authentication logic
  - `login(credentials): Observable<IAuthResponse>`
  - `register(data): Observable<IAuthResponse>`
  - `logout(): void`
  - `getCurrentUser(): Observable<IUser>`

**Integration Points**:
```typescript
// Login flow
1. User submits form in LoginComponent
2. AuthService.login() called with credentials
3. ApiService makes POST request
4. Response stored in StorageService
5. User redirected to /products
```

### Product Feature

**Purpose**: Display and manage product catalog

**Components**:
- `ProductListComponent`: Product grid with filters

**Services** (TODO - Implement):
- `ProductService`: Product operations
  - `getProducts(filters): Observable<IPaginationResponse<IProduct>>`
  - `getProductById(id): Observable<IProduct>`
  - `searchProducts(term): Observable<IProduct[]>`

**Integration Points**:
```typescript
// Product flow
1. Component loads with mock data
2. Replace mock with ProductService.getProducts()
3. Filters call applyFilters() → ProductService
4. Results paginated on frontend
```

### Home Feature

**Purpose**: Landing page and onboarding

**Components**:
- `LandingComponent`: Hero, features, CTA sections

**Standalone Component** (Modern Angular):
```typescript
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
```

## Shared Layer

### Models (Type Safety)

All models are interfaces (not classes) for:
- Smaller bundle size
- Better tree-shaking
- Runtime polymorphism

```typescript
// ✅ Good
export interface IProduct extends IBaseEntity {
  name: string;
  price: number;
}

// ❌ Avoid
export class Product implements IProduct {
  constructor(public name: string) {}
}
```

### Services (Business Logic)

**ApiService** - HTTP Communication
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  
  get<T>(endpoint, params) { /* ... */ }
  post<T>(endpoint, body) { /* ... */ }
}
```

**StorageService** - State Persistence
```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  currentUser$ = new BehaviorSubject<IUser | null>(null);
  
  setToken(token: string) { /* ... */ }
  getToken(): string | null { /* ... */ }
}
```

## Core Module

Handles application-level concerns.

### HTTP Interceptors

**AuthInterceptor** - JWT Management
```typescript
// Automatically adds Authorization header to requests
request = request.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

**ErrorInterceptor** - Centralized Error Handling
```typescript
// Catches all HTTP errors
// Can route to login on 401, show toast on failure, etc.
catchError((error) => {
  // Handle error
})
```

## Routing Strategy

### Lazy Loading

```typescript
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.module')
        .then(m => m.AuthModule)
  }
];
```

**Benefits**:
- Auth bundle only loaded when needed
- Main bundle is smaller
- Faster initial page load

### Route Guards (TODO - Implement)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}

// Usage
{
  path: 'cart',
  component: CartComponent,
  canActivate: [AuthGuard]
}
```

## State Management (TODO - Implement)

Current: Component state (via StorageService)

**Future: NgRx**
```typescript
// For medium-to-large apps
// Auth store, Product store, Cart store
// with actions, reducers, selectors
```

## Communication Flow

### Login Flow

```
User Input
  ↓
LoginComponent
  ↓
AuthService.login()
  ↓
ApiService.post('/auth/login')
  ↓
[AuthInterceptor adds token]
  ↓
Backend
  ↓
Response
  ↓
StorageService.setToken()
StorageService.setCurrentUser()
  ↓
currentUser$ BehaviorSubject emits
  ↓
Component updates
```

### Product Fetch Flow

```
ProductListComponent.ngOnInit()
  ↓
ProductService.getProducts()
  ↓
ApiService.get('/products')
  ↓
[AuthInterceptor adds token]
[ErrorInterceptor catches errors]
  ↓
Backend
  ↓
Response
  ↓
applyFilters() on frontend
  ↓
Template updates with filtered data
```

## Type Safety

### Strict Mode

```typescript
// tsconfig.json
"strict": true,
"strictNullChecks": true,
"strictFunctionTypes": true,
"noImplicitAny": true
```

### Model Examples

```typescript
// ✅ Type-safe API calls
Observable<IApiResponse<IProduct[]>>

// ✅ Type-safe forms
FormGroup (with type hints for form values)

// ✅ Type-safe storage
BehaviorSubject<IUser | null>

// ✅ Type-safe enums
ProductCategory, ProductType
```

## Performance Optimization

### Implemented

1. **Lazy Loading** - Feature modules loaded on demand
2. **Tree-shaking** - Unused code removed
3. **Standalone Components** - For landing page
4. **Responsive Images** - Placeholder support
5. **SCSS Optimization** - Organized, mixins ready

### Ready to Implement

1. **OnPush Change Detection**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

2. **TrackBy in *ngFor**
   ```typescript
   <div *ngFor="let item of items; trackBy: trackByFn">
   
   trackByFn(index, item) {
     return item.id;
   }
   ```

3. **Async Pipe**
   ```typescript
   {{ (observable$ | async) }}
   // Instead of: subscription + ngOnInit
   ```

## Code Organization Examples

### Auth Feature Complete Structure

```
auth/
├── pages/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.scss
│   └── register/
│       ├── register.component.ts
│       ├── register.component.html
│       └── register.component.scss
├── services/
│   └── auth.service.ts (TODO)
├── models/
│   └── auth.model.ts ✅
├── auth.module.ts ✅
└── auth-routing.module.ts ✅
```

### Service Implementation Template

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private authSubject = new BehaviorSubject<IUser | null>(null);
  public auth$ = this.authSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.restoreSession();
  }

  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.apiService.post<IAuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.storageService.setToken(response.token);
          this.storageService.setCurrentUser(response.user);
          this.authSubject.next(response.user);
        })
      );
  }

  logout(): void {
    this.storageService.clearAll();
    this.authSubject.next(null);
  }

  private restoreSession(): void {
    const user = this.storageService.getCurrentUserValue();
    if (user) {
      this.authSubject.next(user);
    }
  }
}
```

## Testing Strategy (TODO)

```typescript
// Service Test Example
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login user', () => {
    const mockResponse: IAuthResponse = { /* ... */ };
    
    service.login(credentials).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

## Deployment Checklist

- [ ] Update API URLs in `environment.prod.ts`
- [ ] Build with `ng build --configuration production`
- [ ] Remove mock data from ProductListComponent
- [ ] Implement AuthService fully
- [ ] Add error handling/toast notifications
- [ ] Set up route guards
- [ ] Test on target browsers
- [ ] Configure CORS on backend
- [ ] Set up HTTPS
- [ ] Enable compression

## Key Takeaways

1. **Modularity**: Each feature is independent and reusable
2. **Type Safety**: All data is typed with interfaces
3. **Scalability**: Easy to add new features and services
4. **Maintainability**: Clear folder structure and patterns
5. **Performance**: Lazy loading and tree-shaking built-in
6. **Testability**: Services are mockable and testable

---

**Next Steps**: Implement the TODO items (AuthService, ProductService, etc.)
