import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/post-property")({
  head: () => ({
    meta: [
      { title: `Post a Property — ${BUSINESS.name}` },
      { name: "description", content: "List your property for sale or rent on Purulia Properties." },
    ],
  }),
  component: PostPropertyPage,
});

function PostPropertyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold md:text-4xl">Post Your Property</h1>
        <p className="mt-3 text-muted-foreground">
          Our multi-step listing form is coming soon. In the meantime, contact us directly and we'll help you list.
        </p>
        <Card className="mt-8 p-8 text-left">
          <h2 className="font-display text-xl font-semibold">What we'll need from you</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Property type (residential / commercial)</li>
            <li>• Listing type (sale / rent)</li>
            <li>• Location, area, BHK, bathrooms</li>
            <li>• Photos and a short description</li>
            <li>• Your contact number</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/contact">Contact Us</Link></Button>
            <Button asChild variant="outline"><Link to="/properties">Browse Listings</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
