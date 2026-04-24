import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/admin/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Purulia Admin" }] }),
  component: SettingsPage,
});

interface SiteSettings {
  brand_name?: string;
  contact_email?: string;
  contact_phone?: string;
  meta_title?: string;
  meta_description?: string;
}

function SettingsPage() {
  const { client } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    (async () => {
      const { data } = await client.from("site_settings").select("data").eq("id", 1).maybeSingle();
      setSettings((data?.data as SiteSettings) ?? {});
      setLoading(false);
    })();
  }, [client]);

  async function save() {
    if (!client) return;
    setSaving(true);
    const { error } = await client.from("site_settings").update({ data: settings, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
  }

  return (
    <div>
      <PageHeader title="Settings" description="Site branding, contact details, and SEO defaults." />
      <Card>
        <CardHeader>
          <CardTitle>Website settings</CardTitle>
          <CardDescription>Stored in the site_settings table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              {[
                { key: "brand_name", label: "Brand name", placeholder: "Purulia Properties" },
                { key: "contact_email", label: "Contact email" },
                { key: "contact_phone", label: "Contact phone" },
                { key: "meta_title", label: "Default meta title" },
              ].map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    value={(settings[f.key as keyof SiteSettings] as string) ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="meta_description">Default meta description</Label>
                <Textarea
                  id="meta_description"
                  rows={3}
                  value={settings.meta_description ?? ""}
                  onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                />
              </div>
              <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
