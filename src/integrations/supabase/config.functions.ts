import { createServerFn } from "@tanstack/react-start";

/**
 * Exposes the public Supabase URL + anon key to the browser.
 * Anon key is safe to ship — RLS is the actual security boundary.
 */
export const getSupabaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env.PURULIA_SUPABASE_URL;
  const anonKey = process.env.PURULIA_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      configured: false as const,
      url: "",
      anonKey: "",
      error:
        "Supabase credentials are not configured. Set PURULIA_SUPABASE_URL and PURULIA_SUPABASE_ANON_KEY.",
    };
  }

  return { configured: true as const, url, anonKey, error: null };
});
