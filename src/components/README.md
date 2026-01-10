# AuthProvider Component

The `AuthProvider` is a React context provider that manages authentication state throughout the application. It integrates with Better Auth for authentication flows and provides a consistent interface for managing user sessions.

## Features

- User state management
- Login/logout functionality
- Token handling
- Loading states
- Proper TypeScript typing
- Integration with Better Auth and the application's API layer

## Usage

### 1. Wrap your application with AuthProvider

```tsx
import { AuthProvider } from './components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      {/* Your application components */}
    </AuthProvider>
  );
}
```

### 2. Use the auth context in your components

```tsx
import { useAuth } from './components/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated, isLoading, error, login, logout, register } = useAuth();

  // Use the auth functions and state as needed
}
```

## API

### Context Values

- `user: User | null` - Current user data
- `session: BetterAuthSession | null` - Current session data
- `isAuthenticated: boolean` - Whether the user is authenticated
- `isLoading: boolean` - Loading state for auth operations
- `error: string | null` - Error message if any auth operation fails

### Functions

- `login(credentials: LoginCredentials): Promise<void>` - Authenticate user with email/password
- `register(userData: RegisterData): Promise<void>` - Create a new user account
- `logout(): Promise<void>` - Sign out the current user
- `refreshUser(): Promise<void>` - Refresh the current user data

### Types

- `LoginCredentials`:
  - `email: string`
  - `password: string`
  - `rememberMe?: boolean`
  - `callbackURL?: string`

- `RegisterData`:
  - `email: string`
  - `password: string`
  - `name?: string`

## Integration

The AuthProvider integrates with:
- Better Auth for authentication flows
- The application's API layer for user data retrieval
- LocalStorage for token management