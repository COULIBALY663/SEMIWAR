export type Role = 'ADMIN' | 'ELEVE' | 'PARENT';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export type NiveauClasse = 'BT1' | 'BT2' | 'BT3';

export interface Classe {
  id: string;
  nom: string;
  niveau: NiveauClasse;
  filiere: string;
  chefId: string | null;
  sousChefId: string | null;
  chef?: EleveResume | null;
  sousChef?: EleveResume | null;
}

/** Sous-ensemble d'un élève renvoyé dans les relations imbriquées
 * (chef/sous-chef de classe, présences d'un appel) : le backend n'y inclut
 * jamais matricule/dateNaissance, qui servent d'identifiants de connexion
 * élève et ne doivent pas fuiter en dehors du profil de l'élève lui-même. */
export interface EleveResume {
  id: string;
  nom: string;
  prenom: string;
  classeId?: string;
}

export interface Eleve {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  matricule: string;
  dateNaissance: string;
  classeId: string;
  classe?: Classe;
}

export interface Parent {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone: string;
  enfants?: Eleve[];
}

export interface Matiere {
  id: string;
  nom: string;
}

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI';

export interface Creneau {
  id: string;
  classeId: string;
  matiereId: string;
  matiere?: Matiere;
  jourSemaine: JourSemaine;
  heureDebut: string;
  heureFin: string;
}

export type PresenceStatut = 'PRESENT' | 'ABSENT' | 'ABSENT_JUSTIFIE';

export interface Presence {
  id: string;
  appelId: string;
  eleveId: string;
  eleve?: EleveResume;
  statut: PresenceStatut;
  justification: string | null;
  justifieAt: string | null;
}

export type AppelStatut = 'EN_COURS' | 'VALIDE';

export interface Appel {
  id: string;
  creneauId: string;
  creneau?: Creneau;
  classeId: string;
  date: string;
  effectueParEleveId: string;
  statut: AppelStatut;
  positionLat: number | null;
  positionLng: number | null;
  positionPrecision: number | null;
  validatedAt: string | null;
  lockedAt: string | null;
  /** Verrou optimiste : à renvoyer tel quel dans marquerAbsences/valider. */
  version: number;
  presences: Presence[];
}

export interface Trimestre {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
}

export interface StatistiqueEleve {
  eleveId: string;
  trimestreId: string;
  heuresAbsence: number;
  heuresAbsenceJustifiee: number;
  nbAbsencesNonJustifiees: number;
}

export type SignalementStatut = 'NOUVEAU' | 'TRAITE';

export interface Signalement {
  id: string;
  eleveId: string;
  eleve?: Eleve;
  trimestreId: string;
  nbAbsencesNonJustifiees: number;
  statut: SignalementStatut;
  createdAt: string;
}

export type SmsStatut = 'ENVOYE' | 'ECHEC';

export interface SmsLog {
  id: string;
  presenceId: string;
  parentId: string;
  telephone: string;
  message: string;
  statut: SmsStatut;
  providerRef: string | null;
  erreur: string | null;
  sentAt: string;
}
