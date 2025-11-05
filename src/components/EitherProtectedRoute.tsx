import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole, currentUserMustChangePassword } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EitherProtectedRouteProps {
  children: React.ReactNode;
}

const EitherProtectedRoute: React.FC<EitherProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isJurado, setIsJurado] = useState(false);
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      const juradoRole = authenticated ? await hasRole('jurado') : false;
      const mustChangePassword = authenticated ? await currentUserMustChangePassword() : false;

      setAuthed(authenticated);
      setIsJurado(juradoRole);
      setMustChange(mustChangePassword);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authed) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (isJurado && mustChange && location.pathname !== '/jurado/senha') {
    return <Navigate to="/jurado/senha" replace />;
  }

  return <>{children}</>;
};

export default EitherProtectedRoute;