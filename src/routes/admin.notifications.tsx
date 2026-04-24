import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Notifications" description="Send in-app notifications, email alerts, and SMS messages." />
      <SchemaMissing
        module="Notifications"
        tables={["notifications"]}
        schemaHint={`-- notifications(id, user_id, kind, title, body, data jsonb, read_at, created_at)
-- Email/SMS providers (Resend, Twilio) require additional API keys.`}
      />
    </div>
  ),
});
