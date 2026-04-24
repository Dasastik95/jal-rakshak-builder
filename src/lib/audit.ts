import { useAuth } from "@/lib/auth-context";
import { supabaseOrThrow } from "@/integrations/supabase/client";

interface LogParams {
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

/** Writes an entry to admin_audit_logs. Best-effort — never throws to caller. */
export async function logAdminAction(params: LogParams) {
  try {
    const sb = supabaseOrThrow();
    const { data: userData } = await sb.auth.getUser();
    await sb.from("admin_audit_logs").insert({
      admin_id: userData.user?.id,
      action: params.action,
      entity_type: params.entity_type ?? null,
      entity_id: params.entity_id ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    console.warn("[audit] failed to log action", e);
  }
}

export function useAuditLog() {
  const { client } = useAuth();
  return async (params: LogParams) => {
    if (!client) return;
    try {
      const { data: userData } = await client.auth.getUser();
      await client.from("admin_audit_logs").insert({
        admin_id: userData.user?.id,
        action: params.action,
        entity_type: params.entity_type ?? null,
        entity_id: params.entity_id ?? null,
        metadata: params.metadata ?? {},
      });
    } catch (e) {
      console.warn("[audit] failed", e);
    }
  };
}
