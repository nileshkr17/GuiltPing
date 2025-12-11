import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = { id: string; email: string; name?: string; streak?: number; groupId?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const res = await api.signup(email, password, name);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm glass rounded-3xl p-6 text-center animate-slide-up">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17a2 2 0 0 0 2-2V7a2 2 0 1 0-4 0v8a2 2 0 0 0 2 2z" />
              <path d="M19 11v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in to access your dashboard and history.
          </p>
          <a href="/auth" className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-95 transition">
            Go to Login
          </a>
          <div className="mt-3 text-xs text-muted-foreground">
            Don’t have an account? Sign up in seconds.
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
