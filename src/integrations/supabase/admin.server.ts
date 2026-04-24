import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY admin client using the service role key. Bypasses RLS.
 * Never import this from client code.
 */
function getAdminClient() {
  const url = process.env.PURULIA_SUPABASE_URL;
  const serviceKey = process.env.PURULIA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client not configured. Set PURULIA_SUPABASE_URL and PURULIA_SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof getAdminClient>, {
  get(_t, prop) {
    const client = getAdminClient();
    // @ts-expect-error proxy passthrough
    return client[prop];
  },
});
