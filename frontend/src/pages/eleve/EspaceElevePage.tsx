import { useEffect, useState } from 'react';
import { statistiqueApi, trimestreApi } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import type { StatistiqueEleve, Trimestre } from '../../types';

export function EspaceElevePage() {
  const { eleveProfile } = useAuth();
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [trimestreId, setTrimestreId] = useState('');
  const [stats, setStats] = useState<StatistiqueEleve | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    trimestreApi.findAll().then(setTrimestres);
  }, []);

  useEffect(() => {
    if (!eleveProfile) return;
    setErreur(null);
    statistiqueApi
      .pourEleve(eleveProfile.id, trimestreId || undefined)
      .then(setStats)
      .catch(() => setErreur('Aucune donnée pour ce trimestre'));
  }, [eleveProfile, trimestreId]);

  if (!eleveProfile) return <p>Chargement...</p>;

  return (
    <div>
      <h1>
        Mon assiduité — {eleveProfile.prenom} {eleveProfile.nom} ({eleveProfile.classe?.nom})
      </h1>
      <div className="card form-row">
        <label>Trimestre</label>
        <select value={trimestreId} onChange={(e) => setTrimestreId(e.target.value)}>
          <option value="">Trimestre en cours</option>
          {trimestres.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>
      </div>

      {erreur && <p className="error-message">{erreur}</p>}

      {stats && (
        <div className="grid-cards">
          <div className="stat-tile">
            <div className="value">{stats.heuresAbsence}h</div>
            <div className="label">Heures d'absence</div>
          </div>
          <div className="stat-tile">
            <div className="value">{stats.heuresAbsenceJustifiee}h</div>
            <div className="label">Heures d'absence justifiée</div>
          </div>
          <div className="stat-tile">
            <div className="value">{stats.nbAbsencesNonJustifiees}</div>
            <div className="label">Absences non justifiées</div>
          </div>
        </div>
      )}
    </div>
  );
}
