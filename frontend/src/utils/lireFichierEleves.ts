import { readSheet } from 'read-excel-file/browser';
import writeXlsxFile from 'write-excel-file/browser';

export interface LigneEleveImport {
  numeroLigne: number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  parentNom: string;
  parentPrenom: string;
  parentTelephone: string;
  erreurs: string[];
}

type Champ = Exclude<keyof LigneEleveImport, 'numeroLigne' | 'erreurs'>;

const ENTETES_MODELE = [
  'Matricule',
  'Nom',
  'Prénom',
  'Date de naissance',
  'Nom parent',
  'Prénom parent',
  'Téléphone parent',
];

/** Intitulés de colonnes acceptés, une fois normalisés (minuscules, sans accents ni espaces). */
const ALIAS: Record<Champ, string[]> = {
  matricule: ['matricule', 'mat', 'numeromatricule'],
  nom: ['nom', 'nomeleve', 'nomdeleleve'],
  prenom: ['prenom', 'prenoms', 'prenomeleve', 'prenomsdeleleve'],
  dateNaissance: ['datedenaissance', 'datenaissance', 'naissance', 'nele', 'neele', 'nee'],
  parentNom: ['nomparent', 'nomduparent', 'nomtuteur', 'nomdututeur'],
  parentPrenom: ['prenomparent', 'prenomsparent', 'prenomduparent', 'prenomtuteur'],
  parentTelephone: [
    'telephoneparent',
    'telparent',
    'telephone',
    'tel',
    'contact',
    'contactparent',
    'telephoneduparent',
  ],
};

const normaliser = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const deuxChiffres = (n: number) => String(n).padStart(2, '0');

function dateValide(annee: number, mois: number, jour: number): string | null {
  const d = new Date(Date.UTC(annee, mois - 1, jour));
  if (d.getUTCFullYear() !== annee || d.getUTCMonth() !== mois - 1 || d.getUTCDate() !== jour) {
    return null;
  }
  return `${annee}-${deuxChiffres(mois)}-${deuxChiffres(jour)}`;
}

function versDateIso(valeur: unknown): string | null {
  if (valeur instanceof Date) {
    return `${valeur.getUTCFullYear()}-${deuxChiffres(valeur.getUTCMonth() + 1)}-${deuxChiffres(valeur.getUTCDate())}`;
  }
  if (typeof valeur === 'number') {
    // Numéro de série Excel (jours depuis le 30/12/1899).
    return versDateIso(new Date(Math.round((valeur - 25569) * 86_400_000)));
  }
  if (typeof valeur === 'string') {
    const texte = valeur.trim();
    const iso = texte.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) return dateValide(+iso[1], +iso[2], +iso[3]);
    const fr = texte.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (fr) return dateValide(+fr[3], +fr[2], +fr[1]);
  }
  return null;
}

function versTexte(valeur: unknown): string {
  if (valeur === null || valeur === undefined) return '';
  return String(valeur).trim();
}

function versTelephone(valeur: unknown): string {
  // Une cellule numérique perd le 0 initial : 0707123456 devient 707123456.
  if (typeof valeur === 'number') {
    const chiffres = String(valeur);
    return chiffres.length === 9 ? `0${chiffres}` : chiffres;
  }
  return versTexte(valeur);
}

export async function lireFichierEleves(fichier: File): Promise<LigneEleveImport[]> {
  const lignes = (await readSheet(fichier)) as unknown[][];

  const indexEntete = lignes.findIndex((ligne) =>
    ligne.some((cellule) => typeof cellule === 'string' && ALIAS.matricule.includes(normaliser(cellule))),
  );
  if (indexEntete === -1) {
    throw new Error('Colonne « Matricule » introuvable dans le fichier');
  }

  const colonnes: Partial<Record<Champ, number>> = {};
  lignes[indexEntete].forEach((cellule, i) => {
    if (typeof cellule !== 'string') return;
    const cle = normaliser(cellule);
    const champ = (Object.keys(ALIAS) as Champ[]).find((c) => ALIAS[c].includes(cle));
    if (champ && colonnes[champ] === undefined) colonnes[champ] = i;
  });

  const manquantes = (['nom', 'prenom', 'dateNaissance'] as Champ[]).filter(
    (c) => colonnes[c] === undefined,
  );
  if (manquantes.length > 0) {
    const libelles = { nom: 'Nom', prenom: 'Prénom', dateNaissance: 'Date de naissance' };
    throw new Error(
      `Colonne(s) introuvable(s) : ${manquantes.map((c) => libelles[c as keyof typeof libelles]).join(', ')}`,
    );
  }

  const cellule = (ligne: unknown[], champ: Champ) =>
    colonnes[champ] === undefined ? null : ligne[colonnes[champ]!];

  return lignes
    .slice(indexEntete + 1)
    .map((ligne, i) => ({ ligne, numeroLigne: indexEntete + i + 2 }))
    .filter(({ ligne }) => ligne.some((c) => versTexte(c) !== ''))
    .map(({ ligne, numeroLigne }) => {
      const dateNaissance = versDateIso(cellule(ligne, 'dateNaissance'));
      const resultat: LigneEleveImport = {
        numeroLigne,
        matricule: versTexte(cellule(ligne, 'matricule')),
        nom: versTexte(cellule(ligne, 'nom')),
        prenom: versTexte(cellule(ligne, 'prenom')),
        dateNaissance: dateNaissance ?? versTexte(cellule(ligne, 'dateNaissance')),
        parentNom: versTexte(cellule(ligne, 'parentNom')),
        parentPrenom: versTexte(cellule(ligne, 'parentPrenom')),
        parentTelephone: versTelephone(cellule(ligne, 'parentTelephone')),
        erreurs: [],
      };
      if (!resultat.matricule) resultat.erreurs.push('Matricule manquant');
      if (!resultat.nom) resultat.erreurs.push('Nom manquant');
      if (!resultat.prenom) resultat.erreurs.push('Prénom manquant');
      if (!dateNaissance) resultat.erreurs.push('Date de naissance invalide (JJ/MM/AAAA)');
      const champsParent = [resultat.parentNom, resultat.parentPrenom, resultat.parentTelephone];
      if (champsParent.some(Boolean) && !champsParent.every(Boolean)) {
        resultat.erreurs.push('Parent incomplet (nom, prénom et téléphone requis)');
      }
      return resultat;
    });
}

export function telechargerModele() {
  return writeXlsxFile(
    [
      ENTETES_MODELE.map((value) => ({ value, fontWeight: 'bold' as const })),
      ['EPT2026001', 'KOUASSI', 'Aya Marie', '15/03/2010', 'KOUASSI', 'Jean', '07 07 12 34 56'],
    ],
    { columns: ENTETES_MODELE.map(() => ({ width: 20 })) },
  ).toFile('modele-import-eleves.xlsx');
}
