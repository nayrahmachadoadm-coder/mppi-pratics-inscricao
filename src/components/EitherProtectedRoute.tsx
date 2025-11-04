import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isUserAuthenticated, isUserRole, currentUserMustChangePassword } from '@/lib/userAuth';
import { isSupabaseAuthenticated, hasSupabaseRole, getSupabaseSession } from '@/lib/supabaseAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EitherProtectedRouteProps {
  children: React.ReactNode;
}

const EitherProtectedRoute: React.FC<EitherProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [isJurado, setIsJurado] = React.useState(false);
  const [mustChange, setMustChange] = React.useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const adminAuthed = isAdminAuthenticated();
      // Sessão local (legado)
      const userAuthedLocal = isUserAuthenticated();
      // Sessão Supabase
      const userAuthedSupabase = await isSupabaseAuthenticated();
      const anyAuthed = adminAuthed || userAuthedLocal || userAuthedSupabase;

      let juradoRole = false;
      if (userAuthedLocal) {
        juradoRole = isUserRole('jurado');
      } else if (userAuthedSupabase) {
        juradoRole = await hasSupabaseRole('jurado');
      }

      // Must change password apenas para fluxo local por enquanto
      const mustChangeLocal = currentUserMustChangePassword();

      setAuthed(anyAuthed);
      setIsJurado(juradoRole);
      setMustChange(mustChangeLocal);
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