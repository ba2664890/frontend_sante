import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
