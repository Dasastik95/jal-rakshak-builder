import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { logAdminAction } from "@/lib/audit";

export const Route = createFileRoute("/login/verify-mfa")({
  head: () => ({ meta: [{ title: "Verify 2FA — Purulia Properties Admin" }] }),
  component: VerifyMfaPage,
});

function VerifyMfaPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.loading && !auth.session) {
      navigate({ to: "/login", replace: true });
    }
  }, [auth.loading, auth.session, navigate]);

  async function verify() {
    if (!auth.client || code.length !== 6) return;
    setSubmitting(true);
    try {
      const { data: factors } = await auth.client.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        toast.error("No 2FA factor found.");
        return;
      }
      const { data: challenge, error: challengeErr } = await auth.client.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (challengeErr) throw challengeErr;
      const { error: verifyErr } = await auth.client.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code,
      });
      if (verifyErr) throw verifyErr;
      await auth.refresh();
      await logAdminAction({ action: "admin_mfa_verified" });
      toast.success("2FA verified");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-5 w-5 text-primary" /> Two-factor authentication
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              disabled={submitting || code.length !== 6}
              onClick={verify}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify and continue
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () => {
                await auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              Cancel and sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
