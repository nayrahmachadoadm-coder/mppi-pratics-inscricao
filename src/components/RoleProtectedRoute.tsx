import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isUserAuthenticated, isUserRole } from '@/lib/userAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'jurado';
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, role }) => {
  const location = useLocation();
  const authed = isUserAuthenticated();
  const hasRole = isUserRole(role);

  useEffect(() => {
    if (!authed || !hasRole) {
      console.log('Acesso negado para papel:', role);
    }
  }, [authed, hasRole, role]);

  if (!authed || !hasRole) {
    const loginPath = '/admin/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;