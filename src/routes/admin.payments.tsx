import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Monetization — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Monetization" description="Featured listing pricing, broker subscriptions, transaction history." />
      <SchemaMissing
        module="Payments & Subscriptions"
        tables={["payments", "subscriptions", "pricing_plans"]}
        schemaHint={`-- pricing_plans(id, name, kind, price, duration_days, features jsonb)
-- subscriptions(id, user_id, plan_id, status, started_at, expires_at)
-- payments(id, user_id, amount, currency, status, provider, ref, created_at)`}
      />
    </div>
  ),
});
