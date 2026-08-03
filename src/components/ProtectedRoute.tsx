import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
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

  const patientAllowedPrefixes = ['/patient', '/acceuil_patient', '/chatbot', '/settings'];
  if (user?.role === 'patient' && !patientAllowedPrefixes.some((path) => location.pathname.startsWith(path))) {
    return <Navigate to="/patient" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
