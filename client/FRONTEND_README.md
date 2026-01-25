# Table Tennis Shop - Angular Frontend

A modern, professional Angular frontend for an e-commerce table tennis equipment shop.

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── interceptors/        # HTTP interceptors
│   │   └── core.module.ts
│   ├── shared/                  # Shared across features
│   │   ├── models/              # Type definitions & interfaces
│   │   └── services/            # Shared services
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication feature
│   │   │   ├── pages/
│   │   │   ├── auth.module.ts
│   │   │   └── auth-routing.module.ts
│   │   ├── product/             # Products feature
│   │   │   ├── pages/
│   │   │   ├── product.module.ts
│   │   │   └── product-routing.module.ts
│   │   └── home/                # Home/Landing page
│   ├── app.component.*
│   ├── app-routing.module.ts
│   └── app.module.ts
├── main.ts
├── index.html
└── styles.scss
```

## Architecture Highlights

### Senior-Level Design Patterns

1. **Feature-Based Architecture**
   - Each feature (auth, product) is independently organized
   - Encapsulated routing and lazy loading
   - Isolated feature state management ready

2. **Separation of Concerns**
   - Models in `shared/models` for type safety
   - Services in `shared/services` for reusable logic
   - Core module for global concerns (interceptors)
   - Components handle presentation only

3. **Scalability**
   - Ready for NgRx/state management integration
   - Interceptor-based API communication
   - Lazy loading for better performance
   - Feature modules can be independently developed

4. **Production-Ready**
   - Type-safe interfaces
   - HTTP interceptors for auth & error handling
   - Reactive forms with validation
   - SCSS variables and mixins ready
   - Responsive design

## Models

### Shared Models
- `IBaseEntity`: Base interface for all entities
- `IApiResponse<T>`: Standardized API response
- `IPaginationResponse<T>`: Pagination support
- `IUser`, `ILoginRequest`, `IRegisterRequest`: Auth models
- `IProduct`, `IProductFilters`: Product models with enums

## Features

### Authentication Module
- **Login Page**: Email/password authentication
- **Register Page**: User registration with validation
- Form validation with error messages
- Reactive forms approach

### Product Module
- **Product List**: Display all products
- **Filtering**: By category, type, price range
- **Sorting**: By name, price, rating
- **Pagination**: Configurable page size
- Mock data for demonstration

### Home Module
- **Landing Page**: Hero section with CTA
- **Features Showcase**: Why choose us section
- **Product Showcase**: Featured products
- **Stats**: Quick metrics
- **Footer**: Navigation and contact info

## Services

### ApiService
```typescript
get<T>(endpoint, params)
post<T>(endpoint, body)
put<T>(endpoint, body)
patch<T>(endpoint, body)
delete<T>(endpoint)
```

### StorageService
- Token management (JWT)
- User state management with BehaviorSubject
- Authentication status checking

### HTTP Interceptors
- **AuthInterceptor**: Automatically adds JWT token
- **ErrorInterceptor**: Centralized error handling

## Routing

```typescript
/ → Landing Page (LandingComponent)
/home → Landing Page
/auth → Auth Module
  /login → Login Page
  /register → Register Page
/products → Product Module
  / → Product List
  /list → Product List
** → Redirect to home
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Install Angular CLI globally (if needed)
npm install -g @angular/cli
```

### Development Server

```bash
# Start development server
ng serve
# or
npm start

# Navigate to http://localhost:4200/
```

### Build

```bash
# Production build
ng build --configuration production

# Output in dist/table-tennis-shop/
```

## Dependencies

- `@angular/core` - Framework
- `@angular/common` - Common utilities
- `@angular/forms` - Reactive forms
- `@angular/router` - Routing
- `@angular/platform-browser` - Browser utilities
- `rxjs` - Reactive programming

## Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tabletennis.shop/api'
};
```

## Implementation Notes

### TODO Items (Ready for Implementation)

1. **Auth Service**: Integrate with backend auth endpoints
   - `login()` in LoginComponent
   - `register()` in RegisterComponent
   - Handle JWT token storage

2. **Product Service**: Connect to backend product endpoints
   - Fetch products list
   - Filter products
   - Search functionality

3. **State Management**: Consider NgRx for complex state
4. **Error Handling**: Implement toast/snackbar notifications
5. **Protected Routes**: Add route guards for authentication
6. **Shopping Cart**: Implement cart feature
7. **User Profile**: Add profile management
8. **Admin Panel**: Product management (optional)

## Best Practices Implemented

✅ Standalone components for landing page  
✅ Lazy-loaded feature modules  
✅ Strict mode TypeScript  
✅ Path aliases for clean imports  
✅ Responsive design  
✅ Reactive forms with validation  
✅ Type-safe API communication  
✅ Centralized interceptors  
✅ SCSS with organization  
✅ Accessibility considerations  

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Table Tennis Shop Development Team
