import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SchemaMissing } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/chats")({
  head: () => ({ meta: [{ title: "Chats & Leads — Purulia Admin" }] }),
  component: () => (
    <div>
      <PageHeader title="Chats & Leads" description="Monitor buyer/seller conversations and track property leads." />
      <SchemaMissing
        module="Chats & Leads"
        tables={["conversations", "messages", "leads"]}
        schemaHint={`-- conversations(id, property_id, buyer_id, seller_id, last_message_at, created_at)
-- messages(id, conversation_id, sender_id, content, created_at)
-- leads(id, property_id, contact_user_id, owner_user_id, source, status, created_at)`}
      />
    </div>
  ),
});
