import { useEffect, useState, type FormEvent } from 'react';
import { trimestreApi } from '../../api/api';
import type { Trimestre } from '../../types';

export function TrimestresPage() {
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [form, setForm] = useState({ nom: '', dateDebut: '', dateFin: '' });
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => trimestreApi.findAll().then(setTrimestres);

  useEffect(() => {
    charger();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    try {
      await trimestreApi.create(form);
      setForm({ nom: '', dateDebut: '', dateFin: '' });
      charger();
    } catch {
      setErreur('Impossible de créer le trimestre');
    }
  };

  return (
    <div>
      <h1>Trimestres</h1>
      <form className="card form-inline" onSubmit={onSubmit}>
        <div className="form-row">
          <label>Nom</label>
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
        </div>
        <div className="form-row">
          <label>Début</label>
          <input
            type="date"
            value={form.dateDebut}
            onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Fin</label>
          <input
            type="date"
            value={form.dateFin}
            onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
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
              <th>Début</th>
              <th>Fin</th>
            </tr>
          </thead>
          <tbody>
            {trimestres.map((t) => (
              <tr key={t.id}>
                <td>{t.nom}</td>
                <td>{t.dateDebut}</td>
                <td>{t.dateFin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
