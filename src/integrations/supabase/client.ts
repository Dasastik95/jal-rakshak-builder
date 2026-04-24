import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config.functions";

let cached: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Lazily creates the browser supabase client using config fetched from the server.
 * Cached across the session.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (cached) return cached;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const cfg = await getSupabaseConfig();
      if (!cfg.configured) {
        console.error("[supabase] not configured:", cfg.error);
        return null;
      }
      cached = createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "purulia-admin-auth",
        },
      });
      return cached;
    } catch (e) {
      console.error("[supabase] init failed:", e);
      return null;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/** Throws if not yet initialized — use after a successful getSupabase() call. */
export function supabaseOrThrow(): SupabaseClient {
  if (!cached) throw new Error("Supabase client not initialized. Call getSupabase() first.");
  return cached;
}
