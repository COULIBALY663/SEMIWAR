import { useEffect, useState } from 'react';
import { classeApi, eleveApi, statistiqueApi, trimestreApi } from '../../api/api';
import type { Classe, Eleve, StatistiqueEleve, Trimestre } from '../../types';

export function StatistiquesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [classeId, setClasseId] = useState('');
  const [trimestreId, setTrimestreId] = useState('');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [stats, setStats] = useState<StatistiqueEleve[]>([]);

  useEffect(() => {
    classeApi.findAll().then(setClasses);
    trimestreApi.findAll().then(setTrimestres);
  }, []);

  useEffect(() => {
    if (!classeId) return;
    eleveApi.findAll(classeId).then(setEleves);
    statistiqueApi.pourClasse(classeId, trimestreId || undefined).then(setStats);
  }, [classeId, trimestreId]);

  const eleveNom = (eleveId: string) => {
    const e = eleves.find((x) => x.id === eleveId);
    return e ? `${e.prenom} ${e.nom}` : eleveId;
  };

  return (
    <div>
      <h1>Statistiques d'assiduité</h1>
      <div className="card form-inline">
        <div className="form-row">
          <label>Classe</label>
          <select value={classeId} onChange={(e) => setClasseId(e.target.value)}>
            <option value="">-- choisir --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
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

      {classeId && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Heures d'absence</th>
                <th>Heures d'absence justifiée</th>
                <th>Absences non justifiées</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.eleveId}>
                  <td>{eleveNom(s.eleveId)}</td>
                  <td>{s.heuresAbsence}h</td>
                  <td>{s.heuresAbsenceJustifiee}h</td>
                  <td>{s.nbAbsencesNonJustifiees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
