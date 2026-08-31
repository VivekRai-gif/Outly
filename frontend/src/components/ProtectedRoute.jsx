import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, publicOnly = false }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (publicOnly && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!publicOnly && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
