import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: `Dashboard — ${BUSINESS.name}` }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your listings and saved properties.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">My Listings</h2>
          <p className="mt-2 text-sm text-muted-foreground">You haven't posted any properties yet.</p>
          <Button asChild className="mt-4" size="sm"><Link to="/post-property">Post a property</Link></Button>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Saved Properties</h2>
          <p className="mt-2 text-sm text-muted-foreground">View properties you've saved.</p>
          <Button asChild className="mt-4" size="sm" variant="outline"><Link to="/dashboard/saved">View saved</Link></Button>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">Update your account details.</p>
          <Button asChild className="mt-4" size="sm" variant="outline"><Link to="/dashboard/profile">Edit profile</Link></Button>
        </Card>
      </div>
    </div>
  );
}
