import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import { AdminLayout } from './AdminLayout';

export function Layout() {
  const { user, logout, isResponsableDeClasse } = useAuth();
  const navigate = useNavigate();

  const seDeconnecter = () => {
    const etaitAdmin = user?.role === 'ADMIN';
    logout();
    navigate(etaitAdmin ? '/administrateur' : '/login');
  };

  if (user?.role === 'ADMIN') return <AdminLayout />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="brand">
          <img src="/logo.jpg" alt="EPT SEWIMAR" className="brand-logo" />
          Appel SEWIMAR
        </span>
        <nav>
          {user?.role === 'ELEVE' && (
            <>
              <NavLink to="/eleve">Mon assiduité</NavLink>
              {isResponsableDeClasse && (
                <NavLink to="/chef">Espace Chef de Classe</NavLink>
              )}
            </>
          )}
          {user?.role === 'PARENT' && (
            <NavLink to="/parent">Espace Parent</NavLink>
          )}
        </nav>
        <ThemeToggle />
        {user && (
          <button className="btn secondary" onClick={seDeconnecter}>
            Déconnexion ({user.email})
          </button>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
