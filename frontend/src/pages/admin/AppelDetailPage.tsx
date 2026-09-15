import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { appelApi, presenceApi } from '../../api/api';
import type { Appel } from '../../types';
import { StatutBadge } from '../../components/StatutBadge';

export function AppelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [appel, setAppel] = useState<Appel | null>(null);
  const [justificationParPresence, setJustificationParPresence] = useState<
    Record<string, string>
  >({});

  const charger = () => {
    if (id) appelApi.findOne(id).then(setAppel);
  };

  useEffect(charger, [id]);

  const justifier = async (presenceId: string) => {
    const texte = justificationParPresence[presenceId];
    if (!texte) return;
    await presenceApi.justifier(presenceId, texte);
    charger();
  };

  if (!appel) return <p>Chargement...</p>;

  return (
    <div>
      <p>
        <Link to={`/admin/classes/${appel.classeId}`}>← Retour à la classe</Link>
      </p>
      <h1>Appel du {appel.date}</h1>
      <p>
        Statut : <StatutBadge statut={appel.statut} /> — Position capturée :{' '}
        {appel.positionLat && appel.positionLng
          ? `${appel.positionLat.toFixed(5)}, ${appel.positionLng.toFixed(5)}`
          : 'non disponible'}
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Élève</th>
              <th>Statut</th>
              <th>Justification</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appel.presences.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.eleve?.prenom} {p.eleve?.nom}
                </td>
                <td>
                  <StatutBadge statut={p.statut} />
                </td>
                <td>{p.justification ?? '—'}</td>
                <td>
                  {p.statut === 'ABSENT' && (
                    <div className="form-inline">
                      <input
                        placeholder="Motif de justification"
                        value={justificationParPresence[p.id] ?? ''}
                        onChange={(e) =>
                          setJustificationParPresence((prev) => ({
                            ...prev,
                            [p.id]: e.target.value,
                          }))
                        }
                      />
                      <button className="btn" onClick={() => justifier(p.id)}>
                        Justifier
                      </button>
                    </div>
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
