import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';

type Profil = 'ELEVE' | 'CHEF' | 'PARENT';

const PROFILS: { id: Profil; titre: string; description: string }[] = [
  {
    id: 'ELEVE',
    titre: 'Je suis élève',
    description: 'Connexion avec votre matricule et votre date de naissance.',
  },
  {
    id: 'CHEF',
    titre: 'Je suis chef ou sous-chef de classe',
    description:
      "Connexion avec votre matricule et le mot de passe donné par l'administration.",
  },
  {
    id: 'PARENT',
    titre: 'Je suis parent',
    description: 'Connexion avec votre numéro de téléphone et votre nom.',
  },
];

export function LoginPage() {
  const { loginEleve, loginChef, loginParent } = useAuth();
  const navigate = useNavigate();
  const [profil, setProfil] = useState<Profil | null>(null);

  const [matricule, setMatricule] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nom, setNom] = useState('');

  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const revenir = () => {
    setProfil(null);
    setErreur(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      if (profil === 'PARENT') {
        await loginParent(telephone, nom);
      } else if (profil === 'CHEF') {
        await loginChef(matricule, motDePasse);
      } else {
        await loginEleve(matricule, dateNaissance);
      }
      navigate('/');
    } catch {
      setErreur('Identifiants incorrects');
    } finally {
      setEnCours(false);
    }
  };

  const profilChoisi = PROFILS.find((p) => p.id === profil);

  return (
    <div className="login-shell">
      <div className="login-brand-panel">
        <div className="login-brand-mark">
          <span className="dot" />
          Appel SEMIWAR
        </div>
        <h1>Le suivi de présence, simplifié pour toute l'école</h1>
        <p>
          Appels de classe, notification SMS des parents et suivi des absences
          en temps réel — pour les délégués, les élèves et les familles.
        </p>
      </div>

      <div className="login-form-panel">
        <div className="login-panel-top">
          <ThemeToggle />
        </div>
        {!profil && (
          <div className="card login-card">
            <h2>Connexion</h2>
            <p className="login-subtitle">Qui êtes-vous ?</p>

            <div className="profil-cards">
              {PROFILS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="profil-card"
                  onClick={() => setProfil(p.id)}
                >
                  <strong>{p.titre}</strong>
                  <span>{p.description}</span>
                </button>
              ))}
            </div>

            <p className="login-admin-link">
              Vous êtes administrateur ?{' '}
              <Link to="/administrateur">Connexion administrateur</Link>
            </p>
          </div>
        )}

        {profil && (
          <form className="card login-card" onSubmit={onSubmit}>
            <button type="button" className="profil-back" onClick={revenir}>
              ← Changer de profil
            </button>
            <h2>{profilChoisi?.titre}</h2>
            <p className="login-subtitle">{profilChoisi?.description}</p>

            {profil === 'PARENT' && (
              <>
                <div className="form-row">
                  <label htmlFor="telephone">Numéro de téléphone</label>
                  <input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="nomFamille">Nom de famille</label>
                  <input
                    id="nomFamille"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {profil === 'CHEF' && (
              <>
                <div className="form-row">
                  <label htmlFor="matriculeChef">Matricule</label>
                  <input
                    id="matriculeChef"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="motDePasse">Mot de passe</label>
                  <input
                    id="motDePasse"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {profil === 'ELEVE' && (
              <>
                <div className="form-row">
                  <label htmlFor="matricule">Matricule</label>
                  <input
                    id="matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="dateNaissance">Date de naissance</label>
                  <input
                    id="dateNaissance"
                    type="date"
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {erreur && <p className="error-message">{erreur}</p>}
            <button className="btn" type="submit" disabled={enCours}>
              {enCours ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
