import { createServerFn } from "@tanstack/react-start";

/**
 * Exposes the public Supabase URL + anon key to the browser.
 * Anon key is safe to ship — RLS is the actual security boundary.
 */
export const getSupabaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  // External Purulia Properties Supabase project (main website's database).
  // The admin panel reads/writes here so changes reflect on the live site.
  // Anon key is safe to expose — RLS + admin role checks enforce security.
  const url =
    process.env.PURULIA_SUPABASE_URL ?? "https://sowjdkokhtrsboxjpvfz.supabase.co";
  const anonKey =
    process.env.PURULIA_SUPABASE_ANON_KEY ??
    "sb_publishable_fwHe7I0nTYebSmRtkktJKA_E08A3jQA";

  if (!url || !anonKey) {
    return {
      configured: false as const,
      url: "",
      anonKey: "",
      error: "Supabase credentials are not configured.",
    };
  }

  return { configured: true as const, url, anonKey, error: null };
});
