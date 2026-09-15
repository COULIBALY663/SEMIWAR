import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, eleveApi, parentApi } from '../api/api';
import type { AuthUser, Eleve, Parent } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  eleveProfile: Eleve | null;
  parentProfile: Parent | null;
  loading: boolean;
  isResponsableDeClasse: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginEleve: (matricule: string, dateNaissance: string) => Promise<void>;
  loginChef: (matricule: string, password: string) => Promise<void>;
  loginParent: (telephone: string, nom: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [eleveProfile, setEleveProfile] = useState<Eleve | null>(null);
  const [parentProfile, setParentProfile] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);

  const chargerProfil = async (authUser: AuthUser) => {
    if (authUser.role === 'ELEVE') {
      setEleveProfile(await eleveApi.me());
      setParentProfile(null);
    } else if (authUser.role === 'PARENT') {
      setParentProfile(await parentApi.me());
      setEleveProfile(null);
    } else {
      setEleveProfile(null);
      setParentProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(async (authUser) => {
        setUser(authUser);
        await chargerProfil(authUser);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const appliquerConnexion = async (authUser: AuthUser, accessToken: string) => {
    localStorage.setItem('token', accessToken);
    setUser(authUser);
    await chargerProfil(authUser);
  };

  const login = async (email: string, password: string) => {
    const { accessToken, user: authUser } = await authApi.login(
      email,
      password,
    );
    await appliquerConnexion(authUser, accessToken);
  };

  const loginEleve = async (matricule: string, dateNaissance: string) => {
    const { accessToken, user: authUser } = await authApi.loginEleve(
      matricule,
      dateNaissance,
    );
    await appliquerConnexion(authUser, accessToken);
  };

  const loginChef = async (matricule: string, password: string) => {
    const { accessToken, user: authUser } = await authApi.loginChef(
      matricule,
      password,
    );
    await appliquerConnexion(authUser, accessToken);
  };

  const loginParent = async (telephone: string, nom: string) => {
    const { accessToken, user: authUser } = await authApi.loginParent(
      telephone,
      nom,
    );
    await appliquerConnexion(authUser, accessToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setEleveProfile(null);
    setParentProfile(null);
  };

  const isResponsableDeClasse = useMemo(() => {
    if (!eleveProfile?.classe) return false;
    return (
      eleveProfile.classe.chefId === eleveProfile.id ||
      eleveProfile.classe.sousChefId === eleveProfile.id
    );
  }, [eleveProfile]);

  const refreshProfile = async () => {
    if (user) await chargerProfil(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        eleveProfile,
        parentProfile,
        loading,
        isResponsableDeClasse,
        login,
        loginEleve,
        loginChef,
        loginParent,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
