import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = isAdminAuthenticated();

  useEffect(() => {
    // Verificar se a sessão ainda é válida
    if (!isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redirecionar para login, salvando a localização atual
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;