import { useState, type ChangeEvent } from 'react';
import { eleveApi } from '../api/api';
import type { Classe } from '../types';
import {
  lireFichierEleves,
  telechargerModele,
  type LigneEleveImport,
} from '../utils/lireFichierEleves';

const TAILLE_LOT = 200;

type ResultatImport = Awaited<ReturnType<typeof eleveApi.importer>>[number];

interface Props {
  classes: Classe[];
  onImportTermine: () => void;
}

export function ImportElevesExcel({ classes, onImportTermine }: Props) {
  const [classeId, setClasseId] = useState('');
  const [nomFichier, setNomFichier] = useState('');
  const [lignes, setLignes] = useState<LigneEleveImport[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [progression, setProgression] = useState<string | null>(null);
  const [resultats, setResultats] = useState<ResultatImport[] | null>(null);

  const lignesValides = lignes.filter((l) => l.erreurs.length === 0);
  const lignesInvalides = lignes.filter((l) => l.erreurs.length > 0);

  const onFichier = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;
    setErreur(null);
    setResultats(null);
    setLignes([]);
    setNomFichier(fichier.name);
    try {
      const lues = await lireFichierEleves(fichier);
      if (lues.length === 0) setErreur('Aucun élève trouvé dans le fichier');
      setLignes(lues);
    } catch (err) {
      setErreur(
        err instanceof Error && err.message.startsWith('Colonne')
          ? err.message
          : 'Fichier illisible : utilisez un fichier Excel .xlsx',
      );
    }
  };

  const importer = async () => {
    setErreur(null);
    const tous: ResultatImport[] = [];
    try {
      for (let i = 0; i < lignesValides.length; i += TAILLE_LOT) {
        setProgression(`Import en cours… ${i} / ${lignesValides.length}`);
        const lot = lignesValides.slice(i, i + TAILLE_LOT).map((l) => ({
          matricule: l.matricule,
          nom: l.nom,
          prenom: l.prenom,
          dateNaissance: l.dateNaissance,
          parentNom: l.parentNom || undefined,
          parentPrenom: l.parentPrenom || undefined,
          parentTelephone: l.parentTelephone || undefined,
        }));
        tous.push(...(await eleveApi.importer({ classeId, eleves: lot })));
      }
      setLignes([]);
      setNomFichier('');
    } catch {
      setErreur(
        `L'import s'est interrompu après ${tous.length} élève(s). Relancez-le : les élèves déjà inscrits seront ignorés.`,
      );
    } finally {
      setProgression(null);
      setResultats(tous);
      onImportTermine();
    }
  };

  const compter = (statut: ResultatImport['statut']) =>
    resultats?.filter((r) => r.statut === statut).length ?? 0;
  const nonCrees = resultats?.filter((r) => r.statut !== 'CREE') ?? [];

  return (
    <div className="card">
      <h3>Importer depuis un fichier Excel</h3>
      <p className="hint-text" style={{ margin: '0 0 1rem' }}>
        Colonnes attendues : Matricule, Nom, Prénom, Date de naissance (JJ/MM/AAAA) et,
        facultativement, Nom parent, Prénom parent, Téléphone parent. Tous les élèves du
        fichier sont inscrits dans la classe choisie.
      </p>
      <div className="form-inline">
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
          <label>Fichier Excel (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFichier}
          />
        </div>
        <button className="btn secondary" type="button" onClick={() => telechargerModele()}>
          Télécharger le modèle
        </button>
      </div>

      {erreur && <p className="error-message">{erreur}</p>}

      {lignes.length > 0 && (
        <>
          <p>
            <strong>{nomFichier}</strong> : {lignesValides.length} élève(s) prêt(s) à importer
            {lignesInvalides.length > 0 &&
              `, ${lignesInvalides.length} ligne(s) avec erreur (ignorées)`}
            .
          </p>
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Ligne</th>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Naissance</th>
                  <th>Parent</th>
                  <th>Téléphone</th>
                  <th>Contrôle</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.numeroLigne}>
                    <td>{l.numeroLigne}</td>
                    <td>{l.matricule}</td>
                    <td>{l.nom}</td>
                    <td>{l.prenom}</td>
                    <td>{l.dateNaissance}</td>
                    <td>{[l.parentPrenom, l.parentNom].filter(Boolean).join(' ')}</td>
                    <td>{l.parentTelephone}</td>
                    <td>
                      {l.erreurs.length === 0 ? (
                        <span className="badge valide">OK</span>
                      ) : (
                        <span className="badge absent">{l.erreurs.join(' · ')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-inline" style={{ marginTop: '1rem' }}>
            <button
              className="btn"
              type="button"
              disabled={!classeId || lignesValides.length === 0 || progression !== null}
              onClick={importer}
            >
              {progression ?? `Importer ${lignesValides.length} élève(s)`}
            </button>
            {!classeId && <span className="hint-text" style={{ margin: 0 }}>Choisissez d'abord une classe</span>}
          </div>
        </>
      )}

      {resultats && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            <span className="badge valide">{compter('CREE')} inscrit(s)</span>{' '}
            <span className="badge en-cours">{compter('IGNORE')} déjà existant(s)</span>{' '}
            <span className="badge absent">{compter('ERREUR')} erreur(s)</span>
          </p>
          {nonCrees.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {nonCrees.map((r) => (
                  <tr key={r.matricule}>
                    <td>{r.matricule}</td>
                    <td>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
