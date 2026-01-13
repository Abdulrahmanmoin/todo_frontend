// frontend/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User as BetterAuthUser,
  Session as BetterAuthSession,
  LoginCredentials,
  RegisterData,
  getSession,
  signIn,
  signUp,
  signOut
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

      // Use the custom API to get the current user
      try {
        const apiUser = await api.user.getCurrentUser();
        if (apiUser) {
          setUser(apiUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
      } catch (apiError) {
        // If API call fails, user is not authenticated
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

      // Use Custom Backend for login
      const response = await api.auth.login({
        email: credentials.email,
        password: credentials.password,
      });

      const token = response.token || (response as any).access_token;
      if (response && token) {
        // Store the token for the API utility to use
        localStorage.setItem('authToken', token);
        // Refresh user data after successful login
        await refreshUser();
      } else {
        throw new Error('Login failed - no token returned');
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

      const username = (userData.name || userData.email.split('@')[0])
        .replace(/\s+/g, '_')
        .toLowerCase();

      // Use Custom Backend for registration
      const response = await api.auth.register({
        email: userData.email,
        password: userData.password,
        username: username,
      });

      const token = response.token || (response as any).access_token;
      if (response && token) {
        // Store the token for the API utility to use
        localStorage.setItem('authToken', token);
        // Refresh user data after successful registration
        await refreshUser();
      } else {
        throw new Error('Registration failed - no token returned');
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
      await signOut();

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