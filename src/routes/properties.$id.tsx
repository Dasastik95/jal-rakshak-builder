import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({ meta: [{ title: `Property — ${BUSINESS.name}` }] }),
  component: PropertyDetailsPage,
});

function PropertyDetailsPage() {
  const { id } = Route.useParams();
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <Button asChild variant="ghost" size="sm"><Link to="/properties"><ArrowLeft className="h-4 w-4" /> Back to listings</Link></Button>
      <Card className="mt-6 p-8">
        <h1 className="font-display text-3xl font-bold">Property Details</h1>
        <p className="mt-2 text-sm text-muted-foreground">Listing ID: {id}</p>
        <p className="mt-6 text-muted-foreground">A rich property details view is coming soon. Contact us to learn more about this listing.</p>
        <Button asChild className="mt-6"><Link to="/contact">Contact us</Link></Button>
      </Card>
    </div>
  );
}
