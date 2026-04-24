import * as React from "react";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/integrations/supabase/client";

export type AdminRole = "super_admin" | "sub_admin";

export interface AuthState {
  loading: boolean;
  client: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  roles: AdminRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  mfaRequired: boolean; // user has MFA enrolled but current session is AAL1
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = React.useState<SupabaseClient | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [roles, setRoles] = React.useState<AdminRole[]>([]);
  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchRolesAndMfa = React.useCallback(
    async (sb: SupabaseClient, currentSession: Session | null) => {
      if (!currentSession?.user) {
        setRoles([]);
        setMfaRequired(false);
        return;
      }
      // Roles
      const { data: roleRows } = await sb
        .from("user_roles")
        .select("role")
        .eq("user_id", currentSession.user.id);
      const r = ((roleRows ?? []) as { role: AdminRole }[]).map((x) => x.role);
      setRoles(r);

      // MFA: if user enrolled in TOTP but current AAL is aal1, they must verify
      try {
        const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
        const enrolled = (currentSession.user as User & { factors?: unknown[] }).factors;
        const hasFactor = Array.isArray(enrolled) && enrolled.length > 0;
        setMfaRequired(
          !!hasFactor && aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2",
        );
      } catch {
        setMfaRequired(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const sb = await getSupabase();
      if (cancelled) return;
      setClient(sb);
      if (!sb) {
        setLoading(false);
        return;
      }

      // Auth listener FIRST
      const { data: subscription } = sb.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        // Defer fetches to avoid deadlocks in callback
        setTimeout(() => {
          void fetchRolesAndMfa(sb, newSession);
        }, 0);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();

      // Initial session
      const { data } = await sb.auth.getSession();
      setSession(data.session);
      await fetchRolesAndMfa(sb, data.session);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [fetchRolesAndMfa]);

  const refresh = React.useCallback(async () => {
    if (!client) return;
    const { data } = await client.auth.getSession();
    setSession(data.session);
    await fetchRolesAndMfa(client, data.session);
  }, [client, fetchRolesAndMfa]);

  const signOut = React.useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
    setRoles([]);
    setMfaRequired(false);
  }, [client]);

  const value: AuthState = React.useMemo(
    () => ({
      loading,
      client,
      session,
      user: session?.user ?? null,
      roles,
      isAdmin: roles.length > 0,
      isSuperAdmin: roles.includes("super_admin"),
      mfaRequired,
      refresh,
      signOut,
    }),
    [loading, client, session, roles, mfaRequired, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
