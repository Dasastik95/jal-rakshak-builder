import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/admin/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { logAdminAction } from "@/lib/audit";

export const Route = createFileRoute("/admin/security")({
  head: () => ({ meta: [{ title: "Security & 2FA — Purulia Admin" }] }),
  component: SecurityPage,
});

interface Factor {
  id: string;
  friendly_name: string | null;
  factor_type: string;
  status: string;
}

function SecurityPage() {
  const { client } = useAuth();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");

  async function refresh() {
    if (!client) return;
    const { data } = await client.auth.mfa.listFactors();
    setFactors([...(data?.totp ?? [])] as Factor[]);
    setLoading(false);
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [client]);

  async function startEnroll() {
    if (!client) return;
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
    if (error) { toast.error(error.message); return; }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verifyEnroll() {
    if (!client || !enrolling) return;
    const { data: ch, error: cerr } = await client.auth.mfa.challenge({ factorId: enrolling.id });
    if (cerr) { toast.error(cerr.message); return; }
    const { error } = await client.auth.mfa.verify({ factorId: enrolling.id, challengeId: ch.id, code });
    if (error) { toast.error(error.message); return; }
    toast.success("2FA enabled");
    await logAdminAction({ action: "admin_mfa_enabled" });
    setEnrolling(null);
    setCode("");
    refresh();
  }

  async function unenroll(factorId: string) {
    if (!client) return;
    const { error } = await client.auth.mfa.unenroll({ factorId });
    if (error) { toast.error(error.message); return; }
    toast.success("2FA disabled");
    await logAdminAction({ action: "admin_mfa_disabled" });
    refresh();
  }

  return (
    <div>
      <PageHeader title="Security & 2FA" description="Manage two-factor authentication for your admin account." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Authenticator app</CardTitle>
          <CardDescription>Use Google Authenticator, 1Password, Authy, or any TOTP app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              {factors.length === 0 && !enrolling && (
                <Button onClick={startEnroll} className="bg-primary hover:bg-primary/90">Enable 2FA</Button>
              )}
              {factors.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">{f.friendly_name ?? "Authenticator"}</div>
                    <div className="text-xs text-muted-foreground">{f.factor_type} · {f.status}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => unenroll(f.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              {enrolling && (
                <div className="space-y-3 rounded-md border border-border p-4">
                  <p className="text-sm">Scan this QR code in your authenticator app:</p>
                  <div className="flex justify-center rounded bg-card p-4">
                    <img src={enrolling.qr} alt="2FA QR code" className="h-44 w-44" />
                  </div>
                  <p className="text-center font-mono text-xs text-muted-foreground">{enrolling.secret}</p>
                  <div className="space-y-2">
                    <Label htmlFor="code">Enter 6-digit code to confirm</Label>
                    <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={verifyEnroll} disabled={code.length !== 6} className="bg-primary hover:bg-primary/90">Confirm</Button>
                    <Button variant="ghost" onClick={() => { setEnrolling(null); setCode(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
