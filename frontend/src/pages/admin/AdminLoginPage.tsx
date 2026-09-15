import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ThemeToggle } from '../../theme/ThemeToggle';

export function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setErreur('Identifiants incorrects');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-brand-panel login-brand-panel-admin">
        <div className="login-brand-mark">
          <span className="dot" />
          Appel SEMIWAR — Administration
        </div>
        <h1>Pilotez les classes, élèves et signalements de votre établissement</h1>
        <p>
          Espace réservé à l'administration : gestion des classes, des
          inscriptions, des statistiques et du suivi des absences.
        </p>
      </div>

      <div className="login-form-panel">
        <div className="login-panel-top">
          <ThemeToggle />
        </div>
        <form className="card login-card" onSubmit={onSubmit}>
          <h2>Connexion administrateur</h2>
          <p className="login-subtitle">Réservé au personnel administratif</p>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {erreur && <p className="error-message">{erreur}</p>}
          <button className="btn" type="submit" disabled={enCours}>
            {enCours ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="login-admin-link">
            Vous êtes élève, chef de classe ou parent ?{' '}
            <Link to="/login">Connexion ici</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
