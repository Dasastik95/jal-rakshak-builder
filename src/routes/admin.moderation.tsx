import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/moderation")({
  head: () => ({ meta: [{ title: "Moderation — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Content Moderation" description="Reported listings and flagged content." />
      <SchemaMissing
        module="Reports & Moderation"
        tables={["reports"]}
        schemaHint={`-- reports(id, reporter_id, entity_type, entity_id, reason, status, created_at)`}
      />
    </div>
  ),
});
