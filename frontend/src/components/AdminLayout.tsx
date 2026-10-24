import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import { signalementApi } from '../api/api';
import { Icon, type IconName } from './Icon';

interface LienNav {
  to: string;
  label: string;
  icon: IconName;
}

const sections: { titre: string; liens: LienNav[] }[] = [
  {
    titre: 'Pilotage',
    liens: [
      { to: '/admin', label: 'Tableau de bord', icon: 'dashboard' },
      { to: '/admin/statistiques', label: 'Statistiques', icon: 'statistiques' },
      { to: '/admin/signalements', label: 'Signalements', icon: 'signalements' },
      { to: '/admin/sms-logs', label: 'Journal SMS', icon: 'sms' },
    ],
  },
  {
    titre: 'Gestion',
    liens: [
      { to: '/admin/classes', label: 'Classes', icon: 'classes' },
      { to: '/admin/eleves', label: 'Élèves', icon: 'eleves' },
      { to: '/admin/parents', label: 'Parents', icon: 'parents' },
      { to: '/admin/matieres', label: 'Matières', icon: 'matieres' },
      { to: '/admin/trimestres', label: 'Trimestres', icon: 'trimestres' },
    ],
  },
];

const titres: { prefixe: string; titre: string }[] = [
  { prefixe: '/admin/classes', titre: 'Classes' },
  { prefixe: '/admin/appels', titre: "Détail de l'appel" },
  { prefixe: '/admin/eleves', titre: 'Élèves' },
  { prefixe: '/admin/parents', titre: 'Parents' },
  { prefixe: '/admin/matieres', titre: 'Matières' },
  { prefixe: '/admin/trimestres', titre: 'Trimestres' },
  { prefixe: '/admin/statistiques', titre: 'Statistiques' },
  { prefixe: '/admin/signalements', titre: 'Signalements' },
  { prefixe: '/admin/sms-logs', titre: 'Journal SMS' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [nbSignalements, setNbSignalements] = useState(0);

  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);

  useEffect(() => {
    signalementApi
      .findAll()
      .then((s) => setNbSignalements(s.filter((x) => x.statut === 'NOUVEAU').length))
      .catch(() => setNbSignalements(0));
  }, [pathname]);

  const seDeconnecter = () => {
    logout();
    navigate('/administrateur');
  };

  const titrePage =
    titres.find((t) => pathname.startsWith(t.prefixe))?.titre ?? 'Tableau de bord';
  const initiale = user?.email.charAt(0).toUpperCase() ?? 'A';
  const aujourdhui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`admin-shell${menuOuvert ? ' menu-ouvert' : ''}`}>
      <aside className="admin-sidebar" aria-label="Navigation administration">
        <div className="admin-sidebar-brand">
          <img src="/logo.jpg" alt="" className="admin-sidebar-logo" />
          <div>
            <strong>Appel SEWIMAR</strong>
            <span>Espace administrateur</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMenuOuvert(false)}
            aria-label="Fermer la navigation"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {sections.map((section) => (
            <div key={section.titre} className="admin-nav-section">
              <span className="admin-nav-titre">{section.titre}</span>
              {section.liens.map((lien) => (
                <NavLink key={lien.to} to={lien.to} end={lien.to === '/admin'}>
                  <Icon name={lien.icon} />
                  <span>{lien.label}</span>
                  {lien.to === '/admin/signalements' && nbSignalements > 0 && (
                    <span className="admin-nav-badge">{nbSignalements}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-avatar">{initiale}</span>
            <div>
              <strong>Administrateur</strong>
              <span title={user?.email}>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="admin-logout" onClick={seDeconnecter}>
            <Icon name="logout" size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="admin-overlay" onClick={() => setMenuOuvert(false)} />

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir la navigation"
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="admin-topbar-titre">
            <span>Administration</span>
            <span aria-hidden="true">/</span>
            <strong>{titrePage}</strong>
          </div>
          <span className="admin-topbar-date">{aujourdhui}</span>
          <ThemeToggle />
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
