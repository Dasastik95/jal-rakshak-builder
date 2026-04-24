import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/requirements")({
  head: () => ({ meta: [{ title: "Requirements — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Requirements (Tenant Posts)" description="Posts from buyers/tenants describing what they're looking for." />
      <SchemaMissing
        module="Requirements"
        tables={["requirements"]}
        schemaHint={`create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  listing_type text, property_type text,
  city text, locality text,
  budget_min numeric, budget_max numeric,
  bedrooms int, description text,
  status text default 'pending',
  created_at timestamptz default now()
);`}
      />
    </div>
  ),
});
