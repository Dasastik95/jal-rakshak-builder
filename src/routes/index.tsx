import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Shield, BarChart3, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Purulia Properties — Admin Panel" },
      {
        name: "description",
        content:
          "Sign in to the Purulia Properties admin control center to manage users, listings, and platform activity.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent), radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in oklab, var(--color-accent) 15%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Building2 className="h-5 w-5" />
            Purulia Properties
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Admin Control Center
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Manage every user, listing, requirement and lead across the Purulia Properties
            platform — with real-time data, role-based access, and full audit trails.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              Sign in to admin
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-md border border-input bg-card px-6 py-3 text-base font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Go to dashboard
            </Link>
          </div>

          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Role-based access",
                desc: "Super Admin and Sub Admin roles with row-level security.",
              },
              {
                icon: BarChart3,
                title: "Real-time analytics",
                desc: "Live KPIs, growth charts, and revenue insights.",
              },
              {
                icon: Users,
                title: "User management",
                desc: "Verify, block, promote, and audit every account.",
              },
              {
                icon: Building2,
                title: "Listing control",
                desc: "Approve, feature, and moderate properties at scale.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
