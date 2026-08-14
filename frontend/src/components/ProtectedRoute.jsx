import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      if (!token.includes('.')) {
        throw new Error("Token mal formatado");
      }
      
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      const userRole = decodedPayload.role || 'cliente';

      if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Erro na validação do token:", error);
  
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  }


  return <Outlet />;
}