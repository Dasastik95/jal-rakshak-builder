import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Loader2, ShieldCheck } from "lucide-react";
import { logAdminAction } from "@/lib/audit";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login/")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    return { redirect: search.redirect };
  },
  head: () => ({
    meta: [{ title: "Sign in — Purulia Properties Admin" }],
  }),
  component: LoginPage,
});

const credSchema = z.object({
  email: z.string().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.loading || !auth.session) return;

    if (auth.mfaRequired) {
      navigate({ to: "/login/verify-mfa", replace: true });
      return;
    }

    if (auth.isAdmin) {
      navigate({ to: search.redirect ?? "/admin", replace: true });
    }
  }, [auth.loading, auth.session, auth.isAdmin, auth.mfaRequired, navigate, search.redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.client) {
      toast.error("Supabase is not configured. Check your project secrets.");
      return;
    }
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await auth.client.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;

      await auth.refresh();

      const { data: roleRows } = await auth.client
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user!.id);

      const isAdmin = (roleRows ?? []).length > 0;
      if (!isAdmin) {
        await auth.client.auth.signOut();
        toast.error("This account is not an admin. Access denied.");
        setSubmitting(false);
        return;
      }

      const { data: aal } = await auth.client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
        toast.info("Enter your 2FA code to continue.");
        navigate({ to: "/login/verify-mfa" });
        return;
      }

      await logAdminAction({ action: "admin_login" });
      toast.success("Welcome back!");
      navigate({ to: search.redirect ?? "/admin" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent)",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-6 flex items-center gap-2 text-primary">
          <Building2 className="h-6 w-6" />
          <span className="text-lg font-bold">Purulia Properties</span>
        </Link>
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-5 w-5 text-primary" /> Admin sign in
            </CardTitle>
            <CardDescription>Sign in with your admin account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@purulia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={submitting || auth.loading}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No admin account yet? Sign up below — then ask a Super Admin to grant you the
                role.
              </p>
              <Link
                to="/login/signup"
                className="block text-center text-sm font-medium text-primary hover:underline"
              >
                Create account
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}