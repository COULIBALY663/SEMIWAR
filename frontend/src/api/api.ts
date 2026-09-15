import { apiClient } from './client';
import type {
  Appel,
  AuthUser,
  Classe,
  Creneau,
  Eleve,
  JourSemaine,
  Matiere,
  NiveauClasse,
  Parent,
  Signalement,
  SmsLog,
  StatistiqueEleve,
  Trimestre,
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient
      .post<{ accessToken: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      })
      .then((r) => r.data),
  loginEleve: (matricule: string, dateNaissance: string) =>
    apiClient
      .post<{ accessToken: string; user: AuthUser }>('/auth/login/eleve', {
        matricule,
        dateNaissance,
      })
      .then((r) => r.data),
  loginChef: (matricule: string, password: string) =>
    apiClient
      .post<{ accessToken: string; user: AuthUser }>('/auth/login/chef', {
        matricule,
        password,
      })
      .then((r) => r.data),
  loginParent: (telephone: string, nom: string) =>
    apiClient
      .post<{ accessToken: string; user: AuthUser }>('/auth/login/parent', {
        telephone,
        nom,
      })
      .then((r) => r.data),
  me: () => apiClient.get<AuthUser>('/auth/me').then((r) => r.data),
};

export const classeApi = {
  findAll: () => apiClient.get<Classe[]>('/classes').then((r) => r.data),
  findOne: (id: string) =>
    apiClient.get<Classe>(`/classes/${id}`).then((r) => r.data),
  create: (data: { niveau: NiveauClasse; filiere: string }) =>
    apiClient.post<Classe>('/classes', data).then((r) => r.data),
  affecterResponsable: (
    id: string,
    data: { eleveId: string; poste: 'CHEF' | 'SOUS_CHEF' },
  ) =>
    apiClient
      .post<{ classe: Classe; motDePasse: string }>(
        `/classes/${id}/responsable`,
        data,
      )
      .then((r) => r.data),
};

export const eleveApi = {
  me: () => apiClient.get<Eleve>('/eleves/me').then((r) => r.data),
  findAll: (classeId?: string) =>
    apiClient
      .get<Eleve[]>('/eleves', { params: classeId ? { classeId } : {} })
      .then((r) => r.data),
  create: (data: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance: string;
    classeId: string;
  }) => apiClient.post<Eleve>('/eleves', data).then((r) => r.data),
  /** Inscrit l'élève et, si fourni, crée/relie son parent en une seule requête. */
  inscrire: (data: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance: string;
    classeId: string;
    parent?: { nom: string; prenom: string; telephone: string };
  }) => apiClient.post<Eleve>('/eleves/inscription', data).then((r) => r.data),
  reinitialiserMotDePasse: (id: string) =>
    apiClient
      .post<{ motDePasse: string }>(`/eleves/${id}/reinitialiser-mot-de-passe`)
      .then((r) => r.data),
};

export const parentApi = {
  me: () => apiClient.get<Parent>('/parents/me').then((r) => r.data),
  findAll: () => apiClient.get<Parent[]>('/parents').then((r) => r.data),
  create: (data: { nom: string; prenom: string; telephone: string }) =>
    apiClient.post<Parent>('/parents', data).then((r) => r.data),
  lierEnfant: (parentId: string, eleveId: string) =>
    apiClient
      .post(`/parents/${parentId}/enfants`, { eleveId })
      .then((r) => r.data),
  enfants: (parentId: string) =>
    apiClient.get<Eleve[]>(`/parents/${parentId}/enfants`).then((r) => r.data),
};

export const matiereApi = {
  findAll: () => apiClient.get<Matiere[]>('/matieres').then((r) => r.data),
  create: (nom: string) =>
    apiClient.post<Matiere>('/matieres', { nom }).then((r) => r.data),
};

export const creneauApi = {
  findByClasse: (classeId: string) =>
    apiClient
      .get<Creneau[]>('/creneaux', { params: { classeId } })
      .then((r) => r.data),
  create: (data: {
    classeId: string;
    matiereId: string;
    jourSemaine: JourSemaine;
    heureDebut: string;
    heureFin: string;
  }) => apiClient.post<Creneau>('/creneaux', data).then((r) => r.data),
};

export const appelApi = {
  findByClasse: (classeId: string) =>
    apiClient
      .get<Appel[]>('/appels', { params: { classeId } })
      .then((r) => r.data),
  findOne: (id: string) =>
    apiClient.get<Appel>(`/appels/${id}`).then((r) => r.data),
  demarrer: (creneauId: string, date: string) =>
    apiClient.post<Appel>('/appels', { creneauId, date }).then((r) => r.data),
  marquerAbsences: (appelId: string, eleveIdsAbsents: string[], version: number) =>
    apiClient
      .patch<Appel>(`/appels/${appelId}/presences`, { eleveIdsAbsents, version })
      .then((r) => r.data),
  valider: (
    appelId: string,
    data: {
      positionLat: number;
      positionLng: number;
      positionPrecision: number;
      version: number;
    },
  ) =>
    apiClient
      .post<Appel>(`/appels/${appelId}/valider`, data)
      .then((r) => r.data),
};

export const presenceApi = {
  justifier: (id: string, justification: string) =>
    apiClient
      .patch(`/presences/${id}/justifier`, { justification })
      .then((r) => r.data),
};

export const trimestreApi = {
  findAll: () =>
    apiClient.get<Trimestre[]>('/trimestres').then((r) => r.data),
  findEnCours: () =>
    apiClient.get<Trimestre>('/trimestres/en-cours').then((r) => r.data),
  create: (data: { nom: string; dateDebut: string; dateFin: string }) =>
    apiClient.post<Trimestre>('/trimestres', data).then((r) => r.data),
};

export const statistiqueApi = {
  pourEleve: (eleveId: string, trimestreId?: string) =>
    apiClient
      .get<StatistiqueEleve>(`/statistiques/eleve/${eleveId}`, {
        params: trimestreId ? { trimestreId } : {},
      })
      .then((r) => r.data),
  pourClasse: (classeId: string, trimestreId?: string) =>
    apiClient
      .get<StatistiqueEleve[]>(`/statistiques/classe/${classeId}`, {
        params: trimestreId ? { trimestreId } : {},
      })
      .then((r) => r.data),
};

export const signalementApi = {
  findAll: () =>
    apiClient.get<Signalement[]>('/signalements').then((r) => r.data),
  traiter: (id: string) =>
    apiClient.patch(`/signalements/${id}/traiter`).then((r) => r.data),
};

export const smsLogApi = {
  findAll: () => apiClient.get<SmsLog[]>('/sms-logs').then((r) => r.data),
};
