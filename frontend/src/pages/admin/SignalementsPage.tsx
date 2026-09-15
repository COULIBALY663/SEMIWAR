import { useEffect, useState } from 'react';
import { signalementApi } from '../../api/api';
import type { Signalement } from '../../types';
import { StatutBadge } from '../../components/StatutBadge';

export function SignalementsPage() {
  const [signalements, setSignalements] = useState<Signalement[]>([]);

  const charger = () => signalementApi.findAll().then(setSignalements);

  useEffect(() => {
    charger();
  }, []);

  const traiter = async (id: string) => {
    await signalementApi.traiter(id);
    charger();
  };

  return (
    <div>
      <h1>Signalements d'absences répétées</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Élève</th>
              <th>Classe</th>
              <th>Absences non justifiées</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {signalements.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.eleve?.prenom} {s.eleve?.nom}
                </td>
                <td>{s.eleve?.classe?.nom}</td>
                <td>{s.nbAbsencesNonJustifiees}</td>
                <td>
                  <StatutBadge statut={s.statut} />
                </td>
                <td>
                  {s.statut === 'NOUVEAU' && (
                    <button className="btn" onClick={() => traiter(s.id)}>
                      Marquer traité
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
