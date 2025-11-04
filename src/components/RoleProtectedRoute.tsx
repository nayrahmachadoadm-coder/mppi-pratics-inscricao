import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isUserAuthenticated, isUserRole } from '@/lib/userAuth';
import { isSupabaseAuthenticated, hasSupabaseRole } from '@/lib/supabaseAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'jurado';
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, role }) => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [hasRoleState, setHasRoleState] = React.useState(false);

  useEffect(() => {
    const check = async () => {
      const localAuthed = isUserAuthenticated();
      const supAuthed = await isSupabaseAuthenticated();
      const anyAuthed = localAuthed || supAuthed;
      let roleOk = false;
      if (localAuthed) {
        roleOk = isUserRole(role);
      } else if (supAuthed) {
        roleOk = await hasSupabaseRole(role);
      }
      setAuthed(anyAuthed);
      setHasRoleState(roleOk);
      setLoading(false);
    };
    check();
  }, [role]);

  if (loading) return <LoadingSpinner />;

  if (!authed || !hasRoleState) {
    const loginPath = '/admin/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;