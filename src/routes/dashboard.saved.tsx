import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({ meta: [{ title: `Saved Properties — ${BUSINESS.name}` }] }),
  component: SavedPage,
});

function SavedPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl font-bold">Saved Properties</h1>
      <Card className="mt-8 p-10 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">You haven't saved any properties yet.</p>
        <Button asChild className="mt-4"><Link to="/properties">Browse listings</Link></Button>
      </Card>
    </div>
  );
}
