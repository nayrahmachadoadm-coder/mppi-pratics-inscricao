import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isUserAuthenticated } from '@/lib/userAuth';

interface EitherProtectedRouteProps {
  children: React.ReactNode;
}

const EitherProtectedRoute: React.FC<EitherProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const adminAuthed = isAdminAuthenticated();
  const userAuthed = isUserAuthenticated();

  useEffect(() => {
    if (!adminAuthed && !userAuthed) {
      console.log('Acesso negado: é necessário login de admin ou jurado');
    }
  }, [adminAuthed, userAuthed]);

  if (!adminAuthed && !userAuthed) {
    // Como a rota é utilizada por jurados para avaliar, redirecionar para login do jurado
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default EitherProtectedRoute;