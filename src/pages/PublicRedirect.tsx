import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PublicRedirect: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fromPath = location.pathname;
    const search = new URLSearchParams({ notice: 'encerradas', from: fromPath }).toString();
    navigate(`/?${search}`, { replace: true });
  }, [location.pathname]);

  return null;
};

export default PublicRedirect;