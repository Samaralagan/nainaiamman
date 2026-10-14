import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const Ctx = createContext<{ user: User | null; ready: boolean; isAdmin: boolean; roleReady: boolean }>({
  user: null, ready: false, isAdmin: false, roleReady: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleFor, setRoleFor] = useState<string | null>(null);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getUser().then(({ data: d }) => { setUser(d.user); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = user?.id;
  useEffect(() => {
    if (!uid) { setIsAdmin(false); setRoleFor(null); return; }
    // Role is read from the protected roles table; access rules on every admin action are enforced by the database.
    supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").then(({ data }) => {
      setIsAdmin((data ?? []).length > 0);
      setRoleFor(uid);
    });
  }, [uid]);
  // Role is only "ready" once it was loaded for the current user, so pages never act on a stale answer.
  const roleReady = uid ? roleFor === uid : ready;

  return <Ctx.Provider value={{ user, ready, isAdmin, roleReady }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
