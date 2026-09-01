import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAuthenticated, hasRole, logoutUser } from '@/lib/auth';

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isJurado, setIsJurado] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      const juradoRole = authenticated ? await hasRole('jurado') : false;
      setIsLogged(authenticated);
      setIsJurado(juradoRole);
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      navigate('/');
    }
  };

  if (!isLogged) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-yellow-500 bg-gradient-to-r from-primary-dark via-primary to-primary-dark shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-hidden">
      {/* Subtle star pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #FFD700 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="w-full pl-2 sm:pl-3 lg:pl-4 pr-2 sm:pr-3 lg:pr-4 h-14 flex items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-2 pr-4 sm:pr-6">
          <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
          <span className="font-semibold text-primary-foreground text-xl sm:text-2xl whitespace-nowrap">Prêmio Melhores Práticas do MPPI - 10ª Edição</span>
          <span className="hidden md:inline-flex items-center justify-center bg-yellow-500 text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2 shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse">
            10 Anos
          </span>
        </div>

        {isLogged && (
          <nav className="hidden md:flex items-center gap-2 mx-4 sm:mx-6">
            <NavLink to="/admin/regulamento">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Regulamento</Button>
            </NavLink>
            <NavLink to="/admin/jurados">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Comissão Julgadora</Button>
            </NavLink>
            <NavLink to="/admin/cronograma">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Cronograma</Button>
            </NavLink>
            <NavLink to="/admin/edicoes-anteriores">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Edições Anteriores</Button>
            </NavLink>
            <NavLink to="/admin/inscritos">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Inscritos</Button>
            </NavLink>
            <NavLink to="/admin/julgamento">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Julgamento</Button>
            </NavLink>
            <NavLink to="/voto-popular">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Voto Popular</Button>
            </NavLink>
            <NavLink to="/admin/premiacao">
              <Button variant="ghost" size="sm" className="w-32 whitespace-nowrap justify-center text-primary-foreground text-[12px] px-2 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">Premiação</Button>
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-transparent border-primary-light text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
