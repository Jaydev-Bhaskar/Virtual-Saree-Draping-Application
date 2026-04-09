import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // If trying to access admin page without permission, send to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
