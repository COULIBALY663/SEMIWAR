import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { classeApi } from '../../api/api';
import type { Classe, NiveauClasse } from '../../types';

const NIVEAUX: NiveauClasse[] = ['BT1', 'BT2', 'BT3'];

export function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [niveau, setNiveau] = useState<NiveauClasse>('BT1');
  const [filiere, setFiliere] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => classeApi.findAll().then(setClasses);

  useEffect(() => {
    charger();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    try {
      await classeApi.create({ niveau, filiere });
      setNiveau('BT1');
      setFiliere('');
      charger();
    } catch {
      setErreur('Impossible de créer la classe (filière déjà utilisée pour ce niveau ?)');
    }
  };

  return (
    <div>
      <h1>Classes</h1>
      <form className="card form-inline" onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="niveau">Niveau</label>
          <select
            id="niveau"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value as NiveauClasse)}
            required
          >
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="filiere">Filière</label>
          <input
            id="filiere"
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit">
          Créer
        </button>
      </form>
      {erreur && <p className="error-message">{erreur}</p>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Niveau</th>
              <th>Filière</th>
              <th>Chef</th>
              <th>Sous-chef</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td>{c.nom}</td>
                <td>{c.niveau}</td>
                <td>{c.filiere}</td>
                <td>{c.chef ? `${c.chef.prenom} ${c.chef.nom}` : '—'}</td>
                <td>{c.sousChef ? `${c.sousChef.prenom} ${c.sousChef.nom}` : '—'}</td>
                <td>
                  <Link to={`/admin/classes/${c.id}`}>Gérer</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
