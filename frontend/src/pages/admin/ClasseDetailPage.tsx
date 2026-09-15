import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  appelApi,
  classeApi,
  creneauApi,
  eleveApi,
  matiereApi,
} from '../../api/api';
import type { Appel, Classe, Creneau, Eleve, JourSemaine, Matiere } from '../../types';

const JOURS: JourSemaine[] = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
];

export function ClasseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [classe, setClasse] = useState<Classe | null>(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [appels, setAppels] = useState<Appel[]>([]);

  const [chefId, setChefId] = useState('');
  const [sousChefId, setSousChefId] = useState('');
  const [erreurResponsable, setErreurResponsable] = useState<string | null>(null);
  const [identifiantsAffiches, setIdentifiantsAffiches] = useState<{
    nom: string;
    matricule: string;
    motDePasse: string;
  } | null>(null);

  const [matiereId, setMatiereId] = useState('');
  const [jourSemaine, setJourSemaine] = useState<JourSemaine>('LUNDI');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('09:00');

  const charger = () => {
    if (!id) return;
    classeApi.findOne(id).then(setClasse);
    eleveApi.findAll(id).then(setEleves);
    creneauApi.findByClasse(id).then(setCreneaux);
    appelApi.findByClasse(id).then(setAppels);
  };

  useEffect(() => {
    charger();
    matiereApi.findAll().then(setMatieres);
  }, [id]);

  const affecter = async (poste: 'CHEF' | 'SOUS_CHEF', eleveId: string) => {
    if (!id || !eleveId) return;
    setErreurResponsable(null);
    try {
      const { motDePasse } = await classeApi.affecterResponsable(id, { eleveId, poste });
      const eleve = eleves.find((e) => e.id === eleveId);
      if (eleve) {
        setIdentifiantsAffiches({
          nom: `${eleve.prenom} ${eleve.nom}`,
          matricule: eleve.matricule,
          motDePasse,
        });
      }
      if (poste === 'CHEF') setChefId('');
      else setSousChefId('');
      charger();
    } catch {
      setErreurResponsable(
        poste === 'CHEF'
          ? 'Impossible de définir ce chef (déjà sous-chef ?)'
          : 'Impossible de définir ce sous-chef (déjà chef ?)',
      );
    }
  };

  const reinitialiserMotDePasse = async (eleveId: string | null | undefined) => {
    if (!eleveId) return;
    setErreurResponsable(null);
    const eleve = eleves.find((e) => e.id === eleveId);
    try {
      const { motDePasse } = await eleveApi.reinitialiserMotDePasse(eleveId);
      setIdentifiantsAffiches({
        nom: eleve ? `${eleve.prenom} ${eleve.nom}` : 'cet élève',
        matricule: eleve?.matricule ?? '',
        motDePasse,
      });
    } catch {
      setErreurResponsable('Impossible de réinitialiser le mot de passe');
    }
  };

  const creerCreneau = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !matiereId) return;
    await creneauApi.create({
      classeId: id,
      matiereId,
      jourSemaine,
      heureDebut,
      heureFin,
    });
    creneauApi.findByClasse(id).then(setCreneaux);
  };

  if (!classe) return <p>Chargement...</p>;

  return (
    <div>
      <p>
        <Link to="/admin/classes">← Retour aux classes</Link>
      </p>
      <h1>
        {classe.nom} ({classe.niveau} — {classe.filiere})
      </h1>

      <div className="card">
        <h3>Chef et sous-chef de classe</h3>
        <p className="hint-text">
          Une classe a exactement deux responsables : un chef et un sous-chef, occupés
          par deux élèves différents. Chacun se connecte avec son matricule et un mot
          de passe généré par l'administration — visible une seule fois ci-dessous.
        </p>

        {identifiantsAffiches && (
          <div className="card" style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
            <strong>Identifiants pour {identifiantsAffiches.nom}</strong>
            <p style={{ margin: '0.5rem 0' }}>
              Matricule : <code>{identifiantsAffiches.matricule}</code>
              <br />
              Mot de passe : <code>{identifiantsAffiches.motDePasse}</code>
            </p>
            <p className="hint-text" style={{ margin: 0 }}>
              Notez-le et transmettez-le maintenant : il ne sera plus jamais affiché.
            </p>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setIdentifiantsAffiches(null)}
              style={{ marginTop: '0.5rem' }}
            >
              J'ai noté, masquer
            </button>
          </div>
        )}

        <div className="form-inline">
          <div className="form-row">
            <label>Chef de classe (actuel : {classe.chef ? `${classe.chef.prenom} ${classe.chef.nom}` : '—'})</label>
            <select value={chefId} onChange={(e) => setChefId(e.target.value)}>
              <option value="">-- choisir --</option>
              {eleves
                .filter((e) => e.id !== classe.sousChefId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
            </select>
          </div>
          <button className="btn" onClick={() => affecter('CHEF', chefId)} disabled={!chefId}>
            Définir chef
          </button>
          {classe.chefId && (
            <button
              className="btn secondary"
              type="button"
              onClick={() => reinitialiserMotDePasse(classe.chefId)}
            >
              Réinitialiser son mot de passe
            </button>
          )}
        </div>
        <div className="form-inline">
          <div className="form-row">
            <label>
              Sous-chef (actuel : {classe.sousChef ? `${classe.sousChef.prenom} ${classe.sousChef.nom}` : '—'})
            </label>
            <select value={sousChefId} onChange={(e) => setSousChefId(e.target.value)}>
              <option value="">-- choisir --</option>
              {eleves
                .filter((e) => e.id !== classe.chefId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
            </select>
          </div>
          <button className="btn" onClick={() => affecter('SOUS_CHEF', sousChefId)} disabled={!sousChefId}>
            Définir sous-chef
          </button>
          {classe.sousChefId && (
            <button
              className="btn secondary"
              type="button"
              onClick={() => reinitialiserMotDePasse(classe.sousChefId)}
            >
              Réinitialiser son mot de passe
            </button>
          )}
        </div>
        {erreurResponsable && <p className="error-message">{erreurResponsable}</p>}
      </div>

      <div className="card">
        <h3>Élèves ({eleves.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Date de naissance</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e) => (
              <tr key={e.id}>
                <td>{e.matricule}</td>
                <td>{e.nom}</td>
                <td>{e.prenom}</td>
                <td>{e.dateNaissance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Emploi du temps</h3>
        <form className="form-inline" onSubmit={creerCreneau}>
          <div className="form-row">
            <label>Matière</label>
            <select value={matiereId} onChange={(e) => setMatiereId(e.target.value)} required>
              <option value="">-- choisir --</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Jour</label>
            <select value={jourSemaine} onChange={(e) => setJourSemaine(e.target.value as JourSemaine)}>
              {JOURS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Début</label>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Fin</label>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
          </div>
          <button className="btn" type="submit">
            Ajouter le créneau
          </button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Horaire</th>
              <th>Matière</th>
            </tr>
          </thead>
          <tbody>
            {creneaux.map((c) => (
              <tr key={c.id}>
                <td>{c.jourSemaine}</td>
                <td>
                  {c.heureDebut} - {c.heureFin}
                </td>
                <td>{c.matiere?.nom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Historique des appels</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.statut}</td>
                <td>
                  <Link to={`/admin/appels/${a.id}`}>Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
