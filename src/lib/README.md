# Better Auth Implementation

This project uses Better Auth for authentication. The implementation includes:

## Files Created

1. `src/lib/auth.ts` - Main Better Auth client configuration and utility functions
2. `src/contexts/AuthContext.tsx` - React context provider for authentication state management
3. `src/components/LoginForm.tsx` - Example login/signup form component

## Setup Instructions

1. Install the required dependencies:
```bash
npm install better-auth
```

2. Make sure you have the following environment variables in your `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

3. The auth client is configured with:
   - Base URL from environment variables
   - Error handling
   - Success callbacks

## Usage

### Wrap your app with AuthProvider

In your layout or page component:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Use authentication in your components

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Features

- Email/password authentication
- Session management
- User state tracking
- Loading and error states
- Type-safe interfaces
- React context for global auth state
- Example login form component

## Server-side Implementation

For the complete authentication flow, you'll also need to implement the Better Auth server in your API routes or middleware.