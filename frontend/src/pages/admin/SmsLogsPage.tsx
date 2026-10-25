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

  useEffect(() => {
    smsLogApi.findAll().then(setLogs);
  }, []);

  const envoyerTest = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoiEnCours(true);
    setResultatTest(null);
    try {
      const r = await smsLogApi.envoyerTest(telephoneTest);
      setResultatTest(
        r.success
          ? { ok: true, texte: `SMS envoyé (réf. ${r.providerRef})` }
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
