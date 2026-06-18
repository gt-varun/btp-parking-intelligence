import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "@/lib/api";

export type Role = "admin" | "user";
export interface AuthUser { _id: string; email: string; role: Role; }

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "btp.jwt";

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Re-hydrate on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setReady(true); return; }
    api.get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post("/auth/login", { email, password });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post("/auth/register", { email, password });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
