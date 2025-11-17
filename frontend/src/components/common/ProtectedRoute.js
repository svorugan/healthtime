import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login-portal" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      patient: '/patient',
      doctor: '/doctor',
      admin: '/admin',
      hospital: '/hospital',
      implant: '/implant'
    };
    
    const redirectPath = roleRedirects[user?.role] || '/login-portal';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
