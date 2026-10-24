import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  classeApi,
  eleveApi,
  parentApi,
  signalementApi,
  smsLogApi,
  trimestreApi,
} from '../../api/api';
import type { Classe, Eleve, Parent, Signalement, SmsLog, Trimestre } from '../../types';
import { Icon, type IconName } from '../../components/Icon';

interface Donnees {
  classes: Classe[];
  eleves: Eleve[];
  parents: Parent[];
  signalements: Signalement[];
  smsLogs: SmsLog[];
  trimestre: Trimestre | null;
}

/** Chaque source est chargée indépendamment : une API en échec (ex. aucun
 * trimestre en cours) ne doit pas vider tout le tableau de bord. */
function valeur<T>(r: PromiseSettledResult<T>, defaut: T): T {
  return r.status === 'fulfilled' ? r.value : defaut;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

const formatDateHeure = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

function Kpi({
  to,
  icon,
  label,
  value,
  detail,
  ton = 'primary',
}: {
  to: string;
  icon: IconName;
  label: string;
  value: number | string;
  detail: string;
  ton?: 'primary' | 'danger' | 'accent';
}) {
  return (
    <Link to={to} className={`kpi kpi-${ton}`}>
      <span className="kpi-icon">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
        <span className="kpi-detail">{detail}</span>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const [donnees, setDonnees] = useState<Donnees | null>(null);

  useEffect(() => {
    Promise.allSettled([
      classeApi.findAll(),
      eleveApi.findAll(),
      parentApi.findAll(),
      signalementApi.findAll(),
      smsLogApi.findAll(),
      trimestreApi.findEnCours(),
    ]).then(([classes, eleves, parents, signalements, smsLogs, trimestre]) =>
      setDonnees({
        classes: valeur(classes, []),
        eleves: valeur(eleves, []),
        parents: valeur(parents, []),
        signalements: valeur(signalements, []),
        smsLogs: valeur(smsLogs, []),
        trimestre: valeur<Trimestre | null>(trimestre, null),
      }),
    );
  }, []);

  if (!donnees) return <div className="page-loading">Chargement du tableau de bord…</div>;

  const { classes, eleves, parents, signalements, smsLogs, trimestre } = donnees;

  const aTraiter = signalements
    .filter((s) => s.statut === 'NOUVEAU')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const smsEnvoyes = smsLogs.filter((s) => s.statut === 'ENVOYE').length;
  const smsEchecs = smsLogs.length - smsEnvoyes;
  const tauxSms = smsLogs.length ? Math.round((smsEnvoyes / smsLogs.length) * 100) : null;
  const derniersSms = [...smsLogs].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, 5);

  const effectifs = classes
    .map((c) => ({ classe: c, total: eleves.filter((e) => e.classeId === c.id).length }))
    .sort((a, b) => b.total - a.total);
  const effectifMax = Math.max(1, ...effectifs.map((e) => e.total));
  const classesSansChef = classes.filter((c) => !c.chefId).length;

  let progression: { pct: number; joursRestants: number } | null = null;
  if (trimestre) {
    const debut = new Date(trimestre.dateDebut).getTime();
    const fin = new Date(trimestre.dateFin).getTime();
    const maintenant = Date.now();
    const pct = Math.min(100, Math.max(0, ((maintenant - debut) / (fin - debut)) * 100));
    progression = {
      pct: Math.round(pct),
      joursRestants: Math.max(0, Math.ceil((fin - maintenant) / 86_400_000)),
    };
  }

  return (
    <div className="dashboard">
      <section className="dash-hero">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de l'assiduité et de l'activité de l'établissement.</p>
        </div>
        <div className="dash-trimestre">
          {trimestre && progression ? (
            <>
              <div className="dash-trimestre-entete">
                <span>Trimestre en cours</span>
                <strong>{trimestre.nom}</strong>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-valuenow={progression.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Avancement du trimestre"
              >
                <span style={{ width: `${progression.pct}%` }} />
              </div>
              <div className="dash-trimestre-pied">
                <span>
                  {formatDate(trimestre.dateDebut)} → {formatDate(trimestre.dateFin)}
                </span>
                <span>
                  {progression.pct}% · {progression.joursRestants} j restants
                </span>
              </div>
            </>
          ) : (
            <div className="dash-trimestre-vide">
              <span>Aucun trimestre en cours</span>
              <Link to="/admin/trimestres">Configurer un trimestre</Link>
            </div>
          )}
        </div>
      </section>

      <section className="kpi-grid">
        <Kpi
          to="/admin/eleves"
          icon="eleves"
          label="Élèves inscrits"
          value={eleves.length}
          detail={`Répartis dans ${classes.length} classe${classes.length > 1 ? 's' : ''}`}
        />
        <Kpi
          to="/admin/classes"
          icon="classes"
          label="Classes"
          value={classes.length}
          detail={
            classesSansChef
              ? `${classesSansChef} sans chef de classe`
              : 'Toutes ont un chef de classe'
          }
        />
        <Kpi
          to="/admin/parents"
          icon="parents"
          label="Parents"
          value={parents.length}
          detail="Contacts joignables par SMS"
        />
        <Kpi
          to="/admin/signalements"
          icon="signalements"
          label="Signalements à traiter"
          value={aTraiter.length}
          detail={aTraiter.length ? 'Action requise' : 'Aucun en attente'}
          ton={aTraiter.length ? 'danger' : 'primary'}
        />
        <Kpi
          to="/admin/sms-logs"
          icon="sms"
          label="SMS délivrés"
          value={tauxSms === null ? '—' : `${tauxSms}%`}
          detail={`${smsEnvoyes} envoyés · ${smsEchecs} en échec`}
          ton="accent"
        />
      </section>

      <section className="dash-grid">
        <div className="panel panel-large">
          <header className="panel-header">
            <div>
              <h2>Effectifs par classe</h2>
              <span>Nombre d'élèves inscrits</span>
            </div>
            <Link to="/admin/classes" className="panel-link">
              Gérer <Icon name="arrow" size={14} />
            </Link>
          </header>
          {effectifs.length === 0 ? (
            <p className="panel-empty">Aucune classe créée pour l'instant.</p>
          ) : (
            <ul className="bar-list">
              {effectifs.map(({ classe, total }) => (
                <li key={classe.id}>
                  <Link to={`/admin/classes/${classe.id}`} className="bar-row">
                    <span className="bar-label">{classe.nom}</span>
                    <span
                      className="bar-track"
                      title={`${classe.nom} : ${total} élève${total > 1 ? 's' : ''}`}
                    >
                      <span
                        className="bar-fill"
                        style={{ width: `${(total / effectifMax) * 100}%` }}
                      />
                    </span>
                    <span className="bar-value">{total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <header className="panel-header">
            <div>
              <h2>Notifications SMS</h2>
              <span>Envois aux parents</span>
            </div>
          </header>
          {smsLogs.length === 0 ? (
            <p className="panel-empty">Aucun SMS envoyé pour l'instant.</p>
          ) : (
            <>
              <div className="sms-ratio">
                <strong>{tauxSms}%</strong>
                <span>taux de délivrance</span>
              </div>
              <div
                className="split-bar"
                title={`${smsEnvoyes} envoyés, ${smsEchecs} en échec`}
              >
                <span className="split-ok" style={{ flexGrow: smsEnvoyes }} />
                <span className="split-ko" style={{ flexGrow: smsEchecs }} />
              </div>
              <ul className="legend">
                <li>
                  <span className="dot dot-ok" /> Envoyés <strong>{smsEnvoyes}</strong>
                </li>
                <li>
                  <span className="dot dot-ko" /> En échec <strong>{smsEchecs}</strong>
                </li>
              </ul>
            </>
          )}
        </div>

        <div className="panel panel-large">
          <header className="panel-header">
            <div>
              <h2>Signalements à traiter</h2>
              <span>Élèves ayant dépassé le seuil d'absences</span>
            </div>
            <Link to="/admin/signalements" className="panel-link">
              Tout voir <Icon name="arrow" size={14} />
            </Link>
          </header>
          {aTraiter.length === 0 ? (
            <p className="panel-empty">
              <Icon name="check" size={16} /> Aucun signalement en attente.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Absences non justifiées</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {aTraiter.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td>{s.eleve ? `${s.eleve.prenom} ${s.eleve.nom}` : '—'}</td>
                    <td>{s.eleve?.classe?.nom ?? '—'}</td>
                    <td>
                      <span className="badge nouveau">{s.nbAbsencesNonJustifiees}</span>
                    </td>
                    <td>{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <header className="panel-header">
            <div>
              <h2>Derniers SMS</h2>
              <span>Activité récente</span>
            </div>
            <Link to="/admin/sms-logs" className="panel-link">
              Journal <Icon name="arrow" size={14} />
            </Link>
          </header>
          {derniersSms.length === 0 ? (
            <p className="panel-empty">Aucune activité récente.</p>
          ) : (
            <ul className="activity">
              {derniersSms.map((sms) => (
                <li key={sms.id}>
                  <span className={`dot ${sms.statut === 'ENVOYE' ? 'dot-ok' : 'dot-ko'}`} />
                  <div>
                    <strong>{sms.telephone}</strong>
                    <span>
                      {sms.statut === 'ENVOYE' ? 'Envoyé' : 'Échec'} ·{' '}
                      {formatDateHeure(sms.sentAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="quick-actions">
        <Link to="/admin/eleves" className="quick-action">
          <Icon name="eleves" /> Inscrire un élève
        </Link>
        <Link to="/admin/classes" className="quick-action">
          <Icon name="classes" /> Créer une classe
        </Link>
        <Link to="/admin/matieres" className="quick-action">
          <Icon name="matieres" /> Ajouter une matière
        </Link>
        <Link to="/admin/statistiques" className="quick-action">
          <Icon name="statistiques" /> Consulter les statistiques
        </Link>
      </section>
    </div>
  );
}
