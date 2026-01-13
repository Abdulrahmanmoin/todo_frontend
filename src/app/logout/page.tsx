'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const LogoutPage: React.FC = () => {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      if (isAuthenticated) {
        await logout();
      }
      // Redirect to login after logout
      router.push('/login');
      router.refresh();
    };

    handleLogout();
  }, [logout, router, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Signing out...
          </h2>
          <p className="mt-2 text-gray-600">
            You are being logged out of your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;