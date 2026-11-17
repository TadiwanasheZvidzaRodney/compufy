import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "finance" | "teacher";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) {
      console.error("fetchRoles error", error);
      setRoles([]);
      return;
    }
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    let active = true;
    let revision = 0;
    const load = async (newSession: Session | null) => {
      const current = ++revision;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setRoles([]);
      setLoading(true);
      if (newSession?.user) {
        const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", newSession.user.id);
        if (active && current === revision) {
          setRoles(error ? [] : (data ?? []).map(r => r.role as AppRole));
        }
      }
      if (active && current === revision) setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Schedule outside the auth callback to avoid waiting on Supabase's auth lock.
      queueMicrotask(() => { if (active) void load(newSession); });
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (active && revision === 0) void load(existing);
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshRoles = async () => {
    if (user) await fetchRoles(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, roles, loading, signOut, hasRole, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
