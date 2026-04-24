import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, downloadCSV } from "@/components/admin/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Purulia Admin" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { client } = useAuth();

  const { data } = useQuery({
    queryKey: ["admin", "reports"],
    enabled: !!client,
    queryFn: async () => {
      const sb = client!;
      const [topViewed, topOwners, dups, suspicious] = await Promise.all([
        sb.from("properties").select("id,title,city,views").order("views", { ascending: false }).limit(10),
        sb.from("properties").select("owner_id").limit(2000),
        sb.from("properties").select("id,title,city,owner_id,created_at").limit(2000),
        sb.from("properties").select("owner_id,created_at").limit(2000),
      ]);

      const ownerCounts: Record<string, number> = {};
      (topOwners.data ?? []).forEach((p: { owner_id: string }) => {
        ownerCounts[p.owner_id] = (ownerCounts[p.owner_id] ?? 0) + 1;
      });
      const topOwnersList = Object.entries(ownerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

      // Duplicate detection: same owner + same title (case-insensitive)
      const dupMap: Record<string, { title: string; city: string | null; ids: string[] }> = {};
      (dups.data ?? []).forEach((p: { id: string; title: string; city: string | null; owner_id: string }) => {
        const key = `${p.owner_id}|${(p.title ?? "").trim().toLowerCase()}`;
        if (!dupMap[key]) dupMap[key] = { title: p.title, city: p.city, ids: [] };
        dupMap[key].ids.push(p.id);
      });
      const duplicates = Object.values(dupMap).filter((g) => g.ids.length > 1);

      // Suspicious: owners with >5 listings in last 24h
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      const recentByOwner: Record<string, number> = {};
      (suspicious.data ?? []).forEach((p: { owner_id: string; created_at: string }) => {
        if (new Date(p.created_at).getTime() > dayAgo) {
          recentByOwner[p.owner_id] = (recentByOwner[p.owner_id] ?? 0) + 1;
        }
      });
      const flaggedOwners = Object.entries(recentByOwner).filter(([, c]) => c > 5);

      return { topViewed: topViewed.data ?? [], topOwnersList, duplicates, flaggedOwners };
    },
  });

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Engagement insights and fraud signals." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Most viewed properties</CardTitle>
              <CardDescription>Top 10 by view count</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadCSV("top-viewed.csv", (data?.topViewed ?? []) as Record<string, unknown>[])}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>City</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
              <TableBody>
                {(data?.topViewed ?? []).map((p) => (
                  <TableRow key={p.id}><TableCell>{p.title}</TableCell><TableCell>{p.city ?? "—"}</TableCell><TableCell className="text-right">{p.views ?? 0}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top owners / brokers</CardTitle>
            <CardDescription>By listing count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Owner ID</TableHead><TableHead className="text-right">Listings</TableHead></TableRow></TableHeader>
              <TableBody>
                {(data?.topOwnersList ?? []).map(([id, count]) => (
                  <TableRow key={id}><TableCell className="font-mono text-xs">{id}</TableCell><TableCell className="text-right">{count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Fraud detection</CardTitle>
            <CardDescription>Duplicate listings and suspicious activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Duplicate listings ({data?.duplicates.length ?? 0})</h4>
              {data?.duplicates.length ? (
                <ul className="space-y-1 text-sm">
                  {data.duplicates.slice(0, 10).map((d, i) => (
                    <li key={i}>· <span className="font-medium">{d.title}</span> in {d.city ?? "—"} — {d.ids.length} copies</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No duplicates detected.</p>}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Suspicious owners (&gt;5 listings in last 24h)</h4>
              {data?.flaggedOwners.length ? (
                <ul className="space-y-1 font-mono text-xs">
                  {data.flaggedOwners.map(([id, c]) => <li key={id}>· {id} — {c} listings</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No suspicious activity.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
