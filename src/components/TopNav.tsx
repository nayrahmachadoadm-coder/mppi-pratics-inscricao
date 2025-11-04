import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isUserAuthenticated, isUserRole, logoutUser } from '@/lib/userAuth';
import { logoutAdmin } from '@/lib/adminAuth';
import { isSupabaseAuthenticated, hasSupabaseRole } from '@/lib/supabaseAuth';

const TopNav: React.FC = () => {
  const navigate = useNavigate();

  const [isLogged, setIsLogged] = useState<boolean>(isUserAuthenticated() || isAdminAuthenticated() || isUserRole('admin'));
  const [isJurado, setIsJurado] = useState<boolean>(isUserRole('jurado'));

  useEffect(() => {
    const checkAuth = async () => {
      const adminLocal = isAdminAuthenticated() || isUserRole('admin');
      const userLocal = isUserAuthenticated();
      const supAuthed = await isSupabaseAuthenticated();
      let juradoRole = isUserRole('jurado');
      if (supAuthed) {
        juradoRole = await hasSupabaseRole('jurado');
      }
      setIsLogged(userLocal || adminLocal || supAuthed);
      setIsJurado(juradoRole);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    try {
      logoutUser();
      logoutAdmin();
    } finally {
      navigate('/');
    }
  };

  if (!isLogged) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-primary-dark shadow-sm">
      <div className="w-full pl-2 sm:pl-3 lg:pl-4 pr-2 sm:pr-3 lg:pr-4 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 pr-4 sm:pr-6">
          <img src="/favicon.ico" alt="Ícone" className="h-6 w-6 opacity-80" />
          <span className="font-semibold text-primary-foreground text-xl sm:text-2xl whitespace-nowrap">Prêmio Melhores Práticas do MPPI - 9ª Edição</span>
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