import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Locations & Categories — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Locations & Categories" description="Manage cities, areas, property types, and amenities." />
      <SchemaMissing
        module="Locations & Categories"
        tables={["cities", "amenities"]}
        schemaHint={`-- cities(id, name, state, is_active)
-- amenities(id, name, icon, category)`}
      />
    </div>
  ),
});
