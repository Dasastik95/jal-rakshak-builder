import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, TableSkeleton } from "@/components/admin/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Purulia Admin" }] }),
  component: AuditLogsPage,
});

interface Log {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function AuditLogsPage() {
  const { client } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs"],
    enabled: !!client,
    queryFn: async () => {
      const { data, error } = await client!.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Log[];
    },
  });

  return (
    <div>
      <PageHeader title="Audit Logs" description="Every admin action recorded." />
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-4"><TableSkeleton cols={4} /></div> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>When</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{l.admin_id?.slice(0, 8) ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                    <TableCell className="text-xs">{l.entity_type}{l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ""}</TableCell>
                  </TableRow>
                ))}
                {!data?.length && <TableRow><TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No audit logs yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
