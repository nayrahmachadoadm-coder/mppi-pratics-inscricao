import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'jurado';
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, role }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [hasRoleState, setHasRoleState] = useState(false);

  useEffect(() => {
    const check = async () => {
      const authenticated = await isAuthenticated();
      const roleCheck = authenticated ? await hasRole(role) : false;
      setAuthed(authenticated);
      setHasRoleState(roleCheck);
      setLoading(false);
    };
    check();
  }, [role]);

  if (loading) return <LoadingSpinner />;

  if (!authed || !hasRoleState) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;