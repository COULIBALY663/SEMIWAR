import { useEffect, useState, type FormEvent } from 'react';
import { smsLogApi } from '../../api/api';
import type { SmsLog } from '../../types';
import { StatutBadge } from '../../components/StatutBadge';

export function SmsLogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [telephoneTest, setTelephoneTest] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [resultatTest, setResultatTest] = useState<{ ok: boolean; texte: string } | null>(
    null,
  );

  const [config, setConfig] = useState<{ fournisseur: string; reel: boolean } | null>(
    null,
  );

  useEffect(() => {
    smsLogApi.findAll().then(setLogs);
    smsLogApi.configuration().then(setConfig).catch(() => setConfig(null));
  }, []);

  const envoyerTest = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoiEnCours(true);
    setResultatTest(null);
    try {
      const r = await smsLogApi.envoyerTest(telephoneTest);
      setResultatTest(
        r.success && r.simulation
          ? {
              ok: false,
              texte:
                'Mode simulation : aucun SMS réel n’a été envoyé. Configurez un fournisseur (Orange ou Twilio) sur le serveur.',
            }
          : r.success
          ? { ok: true, texte: `SMS envoyé via ${r.fournisseur ?? 'le fournisseur'} (réf. ${r.providerRef})` }
          : { ok: false, texte: `Échec : ${r.error}` },
      );
    } catch {
      setResultatTest({ ok: false, texte: "Impossible de joindre le serveur" });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div>
      <h1>Journal des SMS</h1>

      {config && (
        <p className={config.reel ? 'hint-text' : 'error-message'}>
          {config.reel
            ? `Envoi réel activé — fournisseur : ${config.fournisseur}`
            : 'Mode simulation : les SMS ne sont PAS envoyés aux parents. Configurez Orange ou Twilio sur le serveur.'}
        </p>
      )}

      <form className="card" onSubmit={envoyerTest}>
        <div className="form-inline">
          <div className="form-row">
            <label>Envoyer un SMS de test (ex : 07 07 12 34 56)</label>
            <input
              value={telephoneTest}
              onChange={(e) => setTelephoneTest(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={envoiEnCours}>
            {envoiEnCours ? 'Envoi…' : 'Envoyer le test'}
          </button>
        </div>
        {resultatTest && (
          <p className={resultatTest.ok ? 'hint-text' : 'error-message'}>
            {resultatTest.texte}
          </p>
        )}
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Téléphone</th>
              <th>Message</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.sentAt).toLocaleString()}</td>
                <td>{l.telephone}</td>
                <td>{l.message}</td>
                <td title={l.erreur ?? undefined}>
                  <StatutBadge statut={l.statut} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
