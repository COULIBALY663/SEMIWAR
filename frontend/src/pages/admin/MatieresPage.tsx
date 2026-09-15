import { useEffect, useState, type FormEvent } from 'react';
import { matiereApi } from '../../api/api';
import type { Matiere } from '../../types';

export function MatieresPage() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => matiereApi.findAll().then(setMatieres);

  useEffect(() => {
    charger();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    try {
      await matiereApi.create(nom);
      setNom('');
      charger();
    } catch {
      setErreur('Impossible de créer la matière (nom déjà utilisé ?)');
    }
  };

  return (
    <div>
      <h1>Matières</h1>
      <form className="card form-inline" onSubmit={onSubmit}>
        <div className="form-row">
          <label>Nom de la matière</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required />
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
            </tr>
          </thead>
          <tbody>
            {matieres.map((m) => (
              <tr key={m.id}>
                <td>{m.nom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
