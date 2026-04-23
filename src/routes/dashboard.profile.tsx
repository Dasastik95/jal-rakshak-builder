import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: `Profile — ${BUSINESS.name}` }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <Card className="mt-8 p-8">
        <p className="text-sm text-muted-foreground">Profile editing is coming soon.</p>
      </Card>
    </div>
  );
}
