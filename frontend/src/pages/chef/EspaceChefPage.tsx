import { useEffect, useMemo, useRef, useState } from 'react';
import { appelApi, creneauApi } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import type { Appel, Creneau } from '../../types';
import { StatutBadge } from '../../components/StatutBadge';

function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

function messageErreurGeolocalisation(erreur: GeolocationPositionError): string {
  switch (erreur.code) {
    case erreur.PERMISSION_DENIED:
      return "Position refusée : autorisez la localisation pour ce site dans les paramètres du navigateur, puis réessayez.";
    case erreur.POSITION_UNAVAILABLE:
      return 'Position indisponible : le navigateur/appareil ne parvient pas à déterminer votre position (GPS ou service de localisation désactivé ?).';
    case erreur.TIMEOUT:
      return "Délai dépassé en essayant d'obtenir votre position. Réessayez, si possible avec un meilleur signal GPS/Wi-Fi.";
    default:
      return "Impossible d'obtenir votre position : impossible de valider l'appel sans géolocalisation.";
  }
}

export function EspaceChefPage() {
  const { eleveProfile } = useAuth();
  const classeId = eleveProfile?.classeId;

  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [creneauId, setCreneauId] = useState('');
  const [appel, setAppel] = useState<Appel | null>(null);
  const [absents, setAbsents] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [maintenant, setMaintenant] = useState(new Date());
  const derniereRequete = useRef(0);

  useEffect(() => {
    if (classeId) creneauApi.findByClasse(classeId).then(setCreneaux);
  }, [classeId]);

  useEffect(() => {
    const t = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const appliquerAppel = (a: Appel) => {
    console.log('DEBUG appliquerAppel appele', a.id, a.statut, a.presences?.length);
    setAppel(a);
    setAbsents(new Set(a.presences.filter((p) => p.statut === 'ABSENT').map((p) => p.eleveId)));
  };

  useEffect(() => {
    if (!classeId) return;
    const seq = ++derniereRequete.current;
    appelApi.findByClasse(classeId).then((tous) => {
      if (derniereRequete.current !== seq) return;
      const existant = tous.find(
        (a) => a.date === aujourdHui() && (a.statut === 'EN_COURS' || a.statut === 'VALIDE'),
      );
      if (existant) {
        appelApi.findOne(existant.id).then((a) => {
          if (derniereRequete.current === seq) {
            appliquerAppel(a);
            setCreneauId(a.creneauId);
          }
        });
      }
    });
  }, [classeId]);

  const estVerrouille = useMemo(() => {
    if (!appel || appel.statut !== 'VALIDE' || !appel.lockedAt) return false;
    return maintenant > new Date(appel.lockedAt);
  }, [appel, maintenant]);

  const secondesRestantes = useMemo(() => {
    if (!appel?.lockedAt) return 0;
    return Math.max(
      0,
      Math.round((new Date(appel.lockedAt).getTime() - maintenant.getTime()) / 1000),
    );
  }, [appel, maintenant]);

  const modifiable = appel && (appel.statut === 'EN_COURS' || !estVerrouille);

  const demarrer = async () => {
    console.log('DEBUG demarrer appele, creneauId=', creneauId);
    setErreur(null);
    setMessage(null);
    if (!creneauId) return;
    const seq = ++derniereRequete.current;
    try {
      const nouvel = await appelApi.demarrer(creneauId, aujourdHui());
      console.log('DEBUG demarrer succes, seq=', seq, 'current=', derniereRequete.current);
      if (derniereRequete.current === seq) appliquerAppel(nouvel);
    } catch (e) {
      console.log('DEBUG demarrer erreur', e);
      setErreur('Impossible de démarrer cet appel (peut-être déjà fait aujourd’hui)');
    }
  };

  const toggleAbsent = (eleveId: string) => {
    setAbsents((prev) => {
      const next = new Set(prev);
      if (next.has(eleveId)) next.delete(eleveId);
      else next.add(eleveId);
      return next;
    });
  };

  const enregistrer = async () => {
    if (!appel) return;
    setErreur(null);
    const seq = ++derniereRequete.current;
    try {
      const maj = await appelApi.marquerAbsences(appel.id, Array.from(absents), appel.version);
      if (derniereRequete.current === seq) {
        appliquerAppel(maj);
        setMessage('Absences enregistrées');
      }
    } catch (e) {
      if (derniereRequete.current === seq) {
        await gererErreurConflit(e, "Impossible d'enregistrer (délai de modification écoulé ?)");
      }
    }
  };

  const valider = async () => {
    if (!appel) return;
    setErreur(null);
    if (!window.isSecureContext) {
      setErreur(
        "Géolocalisation bloquée : la page n'est pas servie en HTTPS (ou via localhost). " +
          "Les navigateurs refusent la géolocalisation sur une connexion non sécurisée — " +
          'accédez au site en HTTPS.',
      );
      return;
    }
    if (!navigator.geolocation) {
      setErreur('Géolocalisation non disponible sur cet appareil/navigateur');
      return;
    }
    const seq = ++derniereRequete.current;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const valide = await appelApi.valider(appel.id, {
            positionLat: position.coords.latitude,
            positionLng: position.coords.longitude,
            positionPrecision: position.coords.accuracy,
            version: appel.version,
          });
          if (derniereRequete.current === seq) {
            appliquerAppel(valide);
            setMessage('Appel validé. Les parents des absents ont été notifiés par SMS.');
          }
        } catch (e) {
          if (derniereRequete.current === seq) {
            await gererErreurConflit(e, 'Impossible de valider cet appel');
          }
        }
      },
      (erreurGeoloc) => {
        if (derniereRequete.current !== seq) return;
        setErreur(messageErreurGeolocalisation(erreurGeoloc));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /**
   * L'appel a un verrou optimiste (`version`) : si quelqu'un d'autre (autre
   * délégué, autre onglet) l'a modifié entre-temps, le serveur répond 409.
   * On recharge alors l'état à jour au lieu de laisser l'utilisateur
   * réessayer en boucle contre une version périmée.
   */
  const gererErreurConflit = async (e: unknown, messageEchec: string) => {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 409 && appel) {
      setErreur("Cet appel a été modifié par quelqu'un d'autre entre-temps : rechargement...");
      const frais = await appelApi.findOne(appel.id);
      appliquerAppel(frais);
      return;
    }
    setErreur(messageEchec);
  };

  if (!eleveProfile) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Espace Chef de Classe — {eleveProfile.classe?.nom}</h1>

      {!appel && (
        <div className="card form-inline">
          <div className="form-row">
            <label>Créneau du jour</label>
            <select value={creneauId} onChange={(e) => setCreneauId(e.target.value)}>
              <option value="">-- choisir --</option>
              {creneaux.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.jourSemaine} {c.heureDebut}-{c.heureFin} · {c.matiere?.nom}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={demarrer} disabled={!creneauId}>
            Démarrer l'appel
          </button>
        </div>
      )}

      {erreur && <p className="error-message">{erreur}</p>}
      {message && <p className="card">{message}</p>}

      {appel && (
        <div className="card">
          <h3>
            Appel du {appel.date} — <StatutBadge statut={appel.statut} />
          </h3>
          {appel.statut === 'VALIDE' && !estVerrouille && (
            <p>Modification encore possible pendant {secondesRestantes}s</p>
          )}
          {estVerrouille && <p>Appel verrouillé, seule l'administration peut le modifier.</p>}

          <table>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {appel.presences.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.eleve?.prenom} {p.eleve?.nom}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={absents.has(p.eleveId)}
                      disabled={!modifiable || p.statut === 'ABSENT_JUSTIFIE'}
                      onChange={() => toggleAbsent(p.eleveId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modifiable && (
            <div className="form-inline" style={{ marginTop: '1rem' }}>
              <button className="btn secondary" onClick={enregistrer}>
                Enregistrer les absences
              </button>
              {appel.statut === 'EN_COURS' && (
                <button className="btn" onClick={valider}>
                  Valider l'appel (capture la position)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
