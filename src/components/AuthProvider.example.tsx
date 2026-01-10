// Example usage of the AuthProvider component
import React from 'react';
import { AuthProvider, useAuth } from './AuthProvider';

// Example component that uses the auth context
const AuthDependentComponent: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'test@example.com',
        password: 'password123',
        callbackURL: '/dashboard'
      });
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      });
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('Logged out successfully');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Authentication Status</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username || user?.email}!</p>
          <p>User ID: {user?.user_id}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not authenticated</p>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}
    </div>
  );
};

// Example App component that wraps the app with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <div>
        <h1>My App</h1>
        <AuthDependentComponent />
      </div>
    </AuthProvider>
  );
};

export default App;