import { useEffect, useState, type FormEvent } from 'react';
import { parentApi } from '../../api/api';
import type { Eleve, Parent } from '../../types';

export function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [enfantsParParent, setEnfantsParParent] = useState<Record<string, Eleve[]>>({});
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
  });
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = async () => {
    const liste = await parentApi.findAll();
    setParents(liste);
    const entrees = await Promise.all(
      liste.map(async (p) => [p.id, await parentApi.enfants(p.id)] as const),
    );
    setEnfantsParParent(Object.fromEntries(entrees));
  };

  useEffect(() => {
    charger();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    try {
      await parentApi.create(form);
      setForm({ nom: '', prenom: '', telephone: '' });
      charger();
    } catch {
      setErreur('Impossible de créer le parent (téléphone déjà utilisé ?)');
    }
  };

  return (
    <div>
      <h1>Parents</h1>
      <p className="hint-text">
        Le rattachement parent ↔ enfant se fait au moment de l'inscription de l'élève
        (page Élèves). Ce formulaire ne sert qu'à créer un parent sans enfant pour
        l'instant.
      </p>
      <form className="card" onSubmit={onSubmit}>
        <div className="form-inline">
          <div className="form-row">
            <label>Nom</label>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Prénom</label>
            <input
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>Téléphone (format international, ex: +223...)</label>
            <input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              required
            />
          </div>
          <button className="btn" type="submit">
            Créer
          </button>
        </div>
      </form>
      {erreur && <p className="error-message">{erreur}</p>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Enfants</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.prenom} {p.nom}
                </td>
                <td>{p.telephone}</td>
                <td>
                  {(enfantsParParent[p.id] ?? []).length > 0
                    ? enfantsParParent[p.id].map((e) => `${e.prenom} ${e.nom}`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
