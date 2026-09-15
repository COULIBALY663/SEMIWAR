import { useEffect, useState } from 'react';
import { smsLogApi } from '../../api/api';
import type { SmsLog } from '../../types';
import { StatutBadge } from '../../components/StatutBadge';

export function SmsLogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);

  useEffect(() => {
    smsLogApi.findAll().then(setLogs);
  }, []);

  return (
    <div>
      <h1>Journal des SMS</h1>
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
                <td>
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
