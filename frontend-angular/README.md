# healthtime Angular Frontend

Angular 17+ frontend application for the healthtime healthcare platform.

## Features

- **Unified Login**: Single login page for all user roles
- **Role-Based Routing**: Automatic redirect based on user role
- **Registration**: Multi-step registration for all user types
- **Feature Modules**: Separate modules for Patient, Doctor, Admin, Hospital, and Implant portals
- **Material Design**: Angular Material components
- **Authentication Guards**: Route protection based on authentication and roles
- **HTTP Interceptors**: Automatic token injection and error handling

## Project Structure

```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/          # Authentication service, guards
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   ├── models/        # TypeScript models
│   │   │   └── services/      # Core services (API service)
│   │   ├── features/
│   │   │   ├── auth/          # Login and registration
│   │   │   ├── patient/       # Patient portal
│   │   │   ├── doctor/        # Doctor portal
│   │   │   ├── admin/         # Admin portal
│   │   │   ├── hospital/      # Hospital portal
│   │   │   └── implant/       # Implant portal
│   │   └── app.component.ts   # Root component
│   ├── environments/          # Environment configurations
│   └── main.ts               # Application bootstrap
├── angular.json
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
cd frontend-angular
npm install
```

## Development

```bash
npm start
```

Navigate to `http://localhost:4200`

## Build

```bash
# Development build
npm run build

# Production build
npm run build -- --configuration production
```

## Environment Configuration

### Development (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### Production (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api'
};
```

## Key Components

### Authentication

- **LoginComponent**: Unified login for all roles
- **RegistrationOptionsComponent**: Registration type selection
- **AuthService**: Handles login, logout, token management
- **AuthGuard**: Protects routes requiring authentication
- **RoleGuard**: Protects routes based on user role

### Registration

- **PatientRegistrationComponent**: Multi-step patient registration
- **DoctorRegistrationComponent**: Doctor registration with surgery type selection
- **HospitalRegistrationComponent**: Hospital registration
- **ImplantRegistrationComponent**: Implant manufacturer registration

### Feature Modules

Each role has its own feature module with:
- Dashboard component
- Route configuration
- Role-specific features

## API Integration

The frontend communicates with the backend API through:

- **ApiService**: Base URL configuration
- **AuthInterceptor**: Adds JWT token to requests
- **ErrorInterceptor**: Handles HTTP errors globally

## Routing

Routes are configured in `app.routes.ts`:

- `/login` - Login page
- `/register` - Registration options
- `/register/:role` - Role-specific registration
- `/patient/*` - Patient portal (requires patient role)
- `/doctor/*` - Doctor portal (requires doctor role)
- `/admin/*` - Admin portal (requires admin role)
- `/hospital/*` - Hospital portal (requires hospital role)
- `/implant/*` - Implant portal (requires implant role)

## State Management

Currently uses:
- **LocalStorage**: For token and user data
- **BehaviorSubject**: For reactive user state
- **Services**: For shared state

Future enhancements could include:
- NgRx for complex state management
- Angular Signals (Angular 16+)

## Styling

- **Angular Material**: Component library
- **Global Styles**: `src/styles.css`
- **Component Styles**: Scoped to components

## Testing

```bash
npm test
```

## Deployment

The Angular app is deployed to AWS S3 and served via CloudFront. See `DEPLOYMENT.md` for details.

## Development Notes

- Uses standalone components (Angular 17+)
- No NgModules (except for lazy-loaded routes)
- TypeScript strict mode enabled
- Material Design components

## Next Steps

1. Complete registration forms with all fields
2. Implement dashboard components for each role
3. Add booking/appointment management
4. Implement file upload functionality
5. Add real-time notifications
6. Enhance error handling and user feedback

## Support

For issues or questions, refer to:
- Angular Documentation
- Angular Material Documentation
- Project README files

