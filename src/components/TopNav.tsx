import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isUserAuthenticated, isUserRole, currentUserMustChangePassword, logoutUser } from '@/lib/userAuth';
import { logoutAdmin } from '@/lib/adminAuth';

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = isAdminAuthenticated() || isUserRole('admin');
  const isLogged = isUserAuthenticated() || isAdmin;
  const isJurado = isUserRole('jurado');
  const mustChange = currentUserMustChangePassword();

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
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Regulamento</Button>
            </NavLink>
            <NavLink to="/admin/jurados">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Comissão Julgadora</Button>
            </NavLink>
            <NavLink to="/admin/cronograma">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Cronograma</Button>
            </NavLink>
            <NavLink to="/admin/edicoes-anteriores">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Edições Anteriores</Button>
            </NavLink>
            <NavLink to="/admin/categorias">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Categorias</Button>
            </NavLink>
            <NavLink to="/voto-popular">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Voto Popular</Button>
            </NavLink>
            <NavLink to="/admin/premiacao">
              <Button variant="ghost" size="sm" className="w-36 whitespace-nowrap justify-center text-primary-foreground text-sm hover:text-base hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">Premiação</Button>
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-auto">
          {isLogged && isJurado && mustChange && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/jurado/senha')}>Trocar senha</Button>
          )}
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