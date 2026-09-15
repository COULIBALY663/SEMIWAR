import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { classeApi, eleveApi } from '../../api/api';
import type { Classe, Eleve, NiveauClasse } from '../../types';

const NIVEAUX: NiveauClasse[] = ['BT1', 'BT2', 'BT3'];

const FORM_VIDE = {
  nom: '',
  prenom: '',
  matricule: '',
  dateNaissance: '',
  classeId: '',
  parentNom: '',
  parentPrenom: '',
  parentTelephone: '',
};

export function ElevesPage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [form, setForm] = useState(FORM_VIDE);
  const [erreur, setErreur] = useState<string | null>(null);

  const [filtreClasseId, setFiltreClasseId] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState<NiveauClasse | ''>('');
  const [filtreMatricule, setFiltreMatricule] = useState('');

  const charger = () => eleveApi.findAll().then(setEleves);

  useEffect(() => {
    charger();
    classeApi.findAll().then(setClasses);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    const parentRenseigne = form.parentNom || form.parentPrenom || form.parentTelephone;
    if (parentRenseigne && (!form.parentNom || !form.parentPrenom || !form.parentTelephone)) {
      setErreur('Renseignez nom, prénom ET téléphone du parent, ou laissez les trois vides');
      return;
    }
    try {
      await eleveApi.inscrire({
        nom: form.nom,
        prenom: form.prenom,
        matricule: form.matricule,
        dateNaissance: form.dateNaissance,
        classeId: form.classeId,
        parent: parentRenseigne
          ? { nom: form.parentNom, prenom: form.parentPrenom, telephone: form.parentTelephone }
          : undefined,
      });
      setForm(FORM_VIDE);
      charger();
    } catch {
      setErreur(
        "Impossible d'inscrire l'élève (matricule ou téléphone parent déjà utilisé ?)",
      );
    }
  };

  const classeNom = (classeId: string) =>
    classes.find((c) => c.id === classeId)?.nom ?? '—';

  const classesDuNiveau = useMemo(
    () => (filtreNiveau ? classes.filter((c) => c.niveau === filtreNiveau) : classes),
    [classes, filtreNiveau],
  );

  const elevesFiltres = useMemo(() => {
    const matriculeRecherche = filtreMatricule.trim().toLowerCase();
    return eleves.filter((e) => {
      if (filtreClasseId && e.classeId !== filtreClasseId) return false;
      if (filtreNiveau) {
        const classe = classes.find((c) => c.id === e.classeId);
        if (classe?.niveau !== filtreNiveau) return false;
      }
      if (matriculeRecherche && !e.matricule.toLowerCase().includes(matriculeRecherche)) {
        return false;
      }
      return true;
    });
  }, [eleves, classes, filtreClasseId, filtreNiveau, filtreMatricule]);

  return (
    <div>
      <h1>Élèves</h1>
      <form className="card" onSubmit={onSubmit}>
        <div className="form-inline">
          <div className="form-row">
            <label>Nom</label>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
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
            <label>Matricule</label>
            <input
              value={form.matricule}
              onChange={(e) => setForm({ ...form, matricule: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>Classe</label>
            <select
              value={form.classeId}
              onChange={(e) => setForm({ ...form, classeId: e.target.value })}
              required
            >
              <option value="">-- choisir --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-inline">
          <div className="form-row">
            <label>Date de naissance (sert d'identifiant de connexion)</label>
            <input
              type="date"
              value={form.dateNaissance}
              onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-inline">
          <div className="form-row">
            <label>Nom du parent</label>
            <input
              value={form.parentNom}
              onChange={(e) => setForm({ ...form, parentNom: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>Prénom du parent</label>
            <input
              value={form.parentPrenom}
              onChange={(e) => setForm({ ...form, parentPrenom: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>Téléphone du parent (optionnel, format international)</label>
            <input
              value={form.parentTelephone}
              onChange={(e) => setForm({ ...form, parentTelephone: e.target.value })}
            />
          </div>
          <button className="btn" type="submit">
            Inscrire
          </button>
        </div>
      </form>
      {erreur && <p className="error-message">{erreur}</p>}

      <div className="card">
        <h3>Filtrer</h3>
        <div className="form-inline">
          <div className="form-row">
            <label>Niveau</label>
            <select
              value={filtreNiveau}
              onChange={(e) => {
                setFiltreNiveau(e.target.value as NiveauClasse | '');
                setFiltreClasseId('');
              }}
            >
              <option value="">Tous</option>
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Classe</label>
            <select value={filtreClasseId} onChange={(e) => setFiltreClasseId(e.target.value)}>
              <option value="">Toutes</option>
              {classesDuNiveau.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Matricule</label>
            <input
              placeholder="Rechercher un matricule..."
              value={filtreMatricule}
              onChange={(e) => setFiltreMatricule(e.target.value)}
            />
          </div>
          {(filtreClasseId || filtreNiveau || filtreMatricule) && (
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setFiltreClasseId('');
                setFiltreNiveau('');
                setFiltreMatricule('');
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h3>
          Élèves ({elevesFiltres.length}
          {elevesFiltres.length !== eleves.length ? ` / ${eleves.length}` : ''})
        </h3>
        <table>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Date de naissance</th>
              <th>Classe</th>
            </tr>
          </thead>
          <tbody>
            {elevesFiltres.map((e) => (
              <tr key={e.id}>
                <td>{e.matricule}</td>
                <td>{e.nom}</td>
                <td>{e.prenom}</td>
                <td>{e.dateNaissance}</td>
                <td>{classeNom(e.classeId)}</td>
              </tr>
            ))}
            {elevesFiltres.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Aucun élève ne correspond à ces filtres
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
