'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires authentication; if false, requires no authentication
  fallbackPath?: string; // Path to redirect to if auth check fails
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // If route requires authentication but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push(fallbackPath);
      }
      // If route requires no authentication but user is authenticated (e.g., login page)
      if (!requireAuth && isAuthenticated && pathname !== fallbackPath) {
        router.push('/tasks'); // Redirect authenticated users to dashboard
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, fallbackPath, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth check failed and user shouldn't be here, return null while redirecting
  if (
    (requireAuth && !isAuthenticated) ||
    (!requireAuth && isAuthenticated && pathname !== fallbackPath)
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;