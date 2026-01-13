'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User as BetterAuthUser,
  Session as BetterAuthSession,
  LoginCredentials,
  RegisterData,
  getSession,
  signIn as betterAuthSignIn,
  signUp as betterAuthSignUp,
  signOut as betterAuthSignOut
} from '../lib/auth';
import { User } from '../types/user';
import { api } from '../lib/api';

// Define the context type
interface AuthContextType {
  user: User | null;
  session: BetterAuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<BetterAuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert BetterAuth user to our User type
  const convertBetterAuthUserToUser = (betterAuthUser: BetterAuthUser): User => {
    return {
      user_id: betterAuthUser.id,
      email: betterAuthUser.email,
      username: betterAuthUser.name || betterAuthUser.email.split('@')[0], // Fallback to email prefix if no name
      created_at: betterAuthUser.createdAt,
      updated_at: betterAuthUser.updatedAt,
      is_active: true, // Assuming active if authenticated
    };
  };

  // Function to refresh user data from the API
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get the session from Better Auth first
      const betterAuthSession = await getSession();

      // Better Auth returns a response that may have data or error properties
      // We need to check if it's a successful response with user data
      if (betterAuthSession && typeof betterAuthSession === 'object') {
        // Type assertion to handle Better Auth's response type
        const sessionData = betterAuthSession as any;

        // Check for user in the response (could be direct or nested in data)
        const user = sessionData.user || sessionData.data?.user;

        if (user) {
          // If Better Auth session exists, use it
          const convertedUser = convertBetterAuthUserToUser(user);
          setUser(convertedUser);
          setSession(sessionData as BetterAuthSession);
          setIsAuthenticated(true);
        } else {
          // If Better Auth session doesn't exist, try to get user from API
          try {
            const apiUser = await api.user.getCurrentUser();
            setUser(apiUser);
            setIsAuthenticated(true);
          } catch (apiError) {
            // If API call fails, user is not authenticated
            setUser(null);
            setSession(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // No session data, user is not authenticated
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Better Auth for login
      const loginResult = await betterAuthSignIn.email({
        email: credentials.email,
        password: credentials.password,
        rememberMe: true,
        // callbackURL is used for redirect after login
        callbackURL: credentials.callbackURL || '/dashboard',
      }) as any;

      // Check if login was successful
      if (loginResult && !loginResult.error) {
        // Refresh user data after successful login
        await refreshUser();
      } else if (loginResult?.error) {
        // Handle specific error cases from Better Auth
        const errorMsg = loginResult.error.message || loginResult.error.toString();
        if (errorMsg.includes('Invalid credentials') || errorMsg.includes('invalid')) {
          throw new Error('Invalid email or password');
        } else if (errorMsg.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error(errorMsg || 'Login failed');
        }
      } else {
        throw new Error('Login failed - no response returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Better Auth for registration
      const registerResult = await betterAuthSignUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.email.split('@')[0], // Use email prefix as default name
      }) as any;

      // Check if registration was successful
      if (registerResult && !registerResult.error) {
        // Refresh user data after successful registration
        await refreshUser();
      } else if (registerResult?.error) {
        // Handle specific error cases from Better Auth
        const errorMsg = registerResult.error.message || registerResult.error.toString();
        if (errorMsg.includes('User already exists') || errorMsg.includes('already')) {
          throw new Error('A user with this email already exists');
        } else if (errorMsg.includes('Too many requests')) {
          throw new Error('Too many registration attempts. Please try again later.');
        } else {
          throw new Error(errorMsg || 'Registration failed');
        }
      } else {
        throw new Error('Registration failed - no response returned');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Better Auth for logout
      await betterAuthSignOut();

      // Also clear the API token from localStorage
      api.auth.logout();

      // Reset state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      // Still reset the state even if logout fails to ensure clean state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    refreshUser();

    // Set up a periodic check to maintain session state
    const interval = setInterval(refreshUser, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [refreshUser]);

  // Context value
  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};