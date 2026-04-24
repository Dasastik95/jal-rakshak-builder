import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, TableSkeleton, downloadCSV } from "@/components/admin/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle2,
  Trash2,
  UserCog,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/audit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Purulia Admin" }] }),
  component: UsersPage,
});

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  role: string | null;
  owner_type: string | null;
  onboarded: boolean | null;
  is_blocked: boolean | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

function UsersPage() {
  const { client, isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", { search, roleFilter, ownerFilter }],
    enabled: !!client,
    queryFn: async () => {
      let q = client!
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (search) {
        q = q.or(
          `display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%`,
        );
      }
      if (roleFilter !== "all") q = q.eq("role", roleFilter);
      if (ownerFilter !== "all") q = q.eq("owner_type", ownerFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  async function updateField(p: Profile, patch: Partial<Profile>, action: string) {
    if (!client) return;
    const { error } = await client.from("profiles").update(patch).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
    await logAdminAction({ action, entity_type: "profile", entity_id: p.id, metadata: patch });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
    if (selected?.id === p.id) setSelected({ ...selected, ...patch });
  }

  async function deleteProfile(p: Profile) {
    if (!client) return;
    const { error } = await client.from("profiles").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User profile deleted");
    await logAdminAction({ action: "user_delete", entity_type: "profile", entity_id: p.id });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
    setConfirmDelete(null);
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View, verify, block, or remove platform users."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV("purulia-users.csv", (data ?? []) as unknown as Record<string, unknown>[])}
            disabled={!data?.length}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="landlord">Landlord</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Owner type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owner types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="builder">Builder</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4"><TableSkeleton cols={6} /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                    <TableCell>
                      <div className="font-medium">{p.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.email ?? p.phone ?? "—"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.role ?? "—"}</Badge></TableCell>
                    <TableCell className="text-sm">{p.city ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.onboarded ? (
                          <Badge className="bg-success/15 text-success hover:bg-success/15">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                        {p.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => updateField(p, { onboarded: !p.onboarded }, p.onboarded ? "user_unverify" : "user_verify")}>
                            {p.onboarded ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            {p.onboarded ? "Unverify" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => updateField(p, { is_blocked: !p.is_blocked }, p.is_blocked ? "user_unblock" : "user_block")}>
                            {p.is_blocked ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                            {p.is_blocked ? "Unblock" : "Block"}
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => setConfirmDelete(p)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete profile
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> {selected.display_name ?? "User"}</SheetTitle>
                <SheetDescription>{selected.email ?? selected.phone}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <Field label="ID" value={selected.id} mono />
                <Field label="Role" value={selected.role} />
                <Field label="Owner type" value={selected.owner_type} />
                <Field label="Phone" value={selected.phone} />
                <Field label="WhatsApp" value={selected.whatsapp} />
                <Field label="City" value={selected.city} />
                <Field label="Bio" value={selected.bio} />
                <Field label="Joined" value={new Date(selected.created_at).toLocaleString()} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the profile row. The auth user must be removed separately from the Supabase auth dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteProfile(confirmDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-xs break-all" : "text-sm"}>{value || "—"}</div>
    </div>
  );
}
