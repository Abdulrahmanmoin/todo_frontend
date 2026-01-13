// frontend/src/lib/auth.ts
import { createAuthClient } from 'better-auth/react';

// Create the Better Auth client instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',

  // Add plugins if needed (example with common plugins)
  // plugins: [
  //   organizationClient(),
  //   twoFactorClient({
  //     twoFactorPage: '/two-factor',
  //     onTwoFactorRedirect() {
  //       window.location.href = '/two-factor';
  //     },
  //   }),
  //   passkeyClient(),
  // ],

  fetchOptions: {
    onError(error) {
      console.error('Auth error:', error);
      // Handle specific error cases
      if (error.error.status === 429) {
        console.error('Too many requests. Please try again later.');
      } else if (error.error.status === 401) {
        console.error('Unauthorized access');
      }
    },
    onSuccess(data) {
      console.log('Auth action successful:', data);
    },
  },
});

// Export the individual functions from the client
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  resetPassword,
  changePassword,
  verifyEmail,
  sendVerificationEmail,
} = authClient;

// Define TypeScript types based on Better Auth patterns
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields can be added based on your server configuration
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
  accessToken?: string; // This might be available depending on your configuration
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  image?: string;
  callbackURL?: string;
}

// Additional utility functions that complement Better Auth
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const sessionResponse = await getSession() as any;
  const sessionData = sessionResponse?.data || sessionResponse;

  if (sessionData?.session) {
    return {
      Authorization: `Bearer ${sessionData.session.id}`, // Using session ID as token
    };
  }
  return {};
};

export const getCurrentUser = async (): Promise<User | null> => {
  const sessionResponse = await getSession() as any;
  const sessionData = sessionResponse?.data || sessionResponse;
  return sessionData?.user || null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const sessionResponse = await getSession() as any;
  const sessionData = sessionResponse?.data || sessionResponse;
  return !!sessionData?.user;
};

// Convenience function to get complete auth state
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const sessionResponse = await getSession() as any;
    const sessionData = sessionResponse?.data || sessionResponse;
    const isLoading = false; // Better Auth handles loading states in the hook
    const error = null;

    return {
      user: sessionData?.user || null,
      session: sessionData as Session || null,
      isAuthenticated: !!sessionData?.user,
      isLoading,
      error,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

// Export default for easy import
export default authClient;