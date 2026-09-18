import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Layout() {
  const { user, logout, isResponsableDeClasse } = useAuth();
  const navigate = useNavigate();

  const seDeconnecter = () => {
    const etaitAdmin = user?.role === 'ADMIN';
    logout();
    navigate(etaitAdmin ? '/administrateur' : '/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="brand">
          <img src="/logo.jpg" alt="EPT SEWIMAR" className="brand-logo" />
          Appel SEMIWAR
        </span>
        <nav>
          {user?.role === 'ADMIN' && (
            <>
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/classes">Classes</NavLink>
              <NavLink to="/admin/eleves">Élèves</NavLink>
              <NavLink to="/admin/parents">Parents</NavLink>
              <NavLink to="/admin/matieres">Matières</NavLink>
              <NavLink to="/admin/trimestres">Trimestres</NavLink>
              <NavLink to="/admin/statistiques">Statistiques</NavLink>
              <NavLink to="/admin/signalements">Signalements</NavLink>
              <NavLink to="/admin/sms-logs">SMS</NavLink>
            </>
          )}
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
