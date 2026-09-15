import { useEffect, useState } from 'react';
import { statistiqueApi, trimestreApi } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import type { StatistiqueEleve, Trimestre } from '../../types';

export function EspaceParentPage() {
  const { parentProfile } = useAuth();
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [trimestreId, setTrimestreId] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [stats, setStats] = useState<StatistiqueEleve | null>(null);

  useEffect(() => {
    trimestreApi.findAll().then(setTrimestres);
  }, []);

  useEffect(() => {
    if (parentProfile?.enfants?.length && !eleveId) {
      setEleveId(parentProfile.enfants[0].id);
    }
  }, [parentProfile, eleveId]);

  useEffect(() => {
    if (!eleveId) return;
    statistiqueApi.pourEleve(eleveId, trimestreId || undefined).then(setStats);
  }, [eleveId, trimestreId]);

  if (!parentProfile) return <p>Chargement...</p>;

  return (
    <div>
      <h1>
        Espace Parent — {parentProfile.prenom} {parentProfile.nom}
      </h1>

      <div className="card form-inline">
        <div className="form-row">
          <label>Enfant</label>
          <select value={eleveId} onChange={(e) => setEleveId(e.target.value)}>
            {(parentProfile.enfants ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom} ({e.classe?.nom})
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
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
      </div>

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
