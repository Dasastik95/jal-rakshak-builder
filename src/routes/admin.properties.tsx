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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search, Download, CheckCircle2, XCircle, Star, ShieldCheck, Trash2, MoreHorizontal, Building2, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/audit";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties — Purulia Admin" }] }),
  component: PropertiesPage,
});

interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  property_type: string | null;
  listing_type: string | null;
  category: string | null;
  price: number | null;
  city: string | null;
  state: string | null;
  locality: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  status: string | null;
  is_featured: boolean | null;
  is_verified: boolean | null;
  views: number | null;
  images: string[] | null;
  contact_phone: string | null;
  created_at: string;
}

function PropertiesPage() {
  const { client } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [listing, setListing] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [selected, setSelected] = useState<Property | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Property | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "properties", { search, listing, type, status, verified, featured }],
    enabled: !!client,
    queryFn: async () => {
      let q = client!.from("properties").select("*").order("created_at", { ascending: false }).limit(300);
      if (search) q = q.or(`title.ilike.%${search}%,city.ilike.%${search}%,locality.ilike.%${search}%`);
      if (listing !== "all") q = q.eq("listing_type", listing);
      if (type !== "all") q = q.eq("property_type", type);
      if (status !== "all") q = q.eq("status", status);
      if (verified !== "all") q = q.eq("is_verified", verified === "yes");
      if (featured !== "all") q = q.eq("is_featured", featured === "yes");
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Property[];
    },
  });

  async function update(p: Property, patch: Partial<Property>, action: string) {
    if (!client) return;
    const { error } = await client.from("properties").update(patch).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    await logAdminAction({ action, entity_type: "property", entity_id: p.id, metadata: patch });
    qc.invalidateQueries({ queryKey: ["admin", "properties"] });
    if (selected?.id === p.id) setSelected({ ...selected, ...patch });
  }

  async function remove(p: Property) {
    if (!client) return;
    const { error } = await client.from("properties").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Property deleted");
    await logAdminAction({ action: "property_delete", entity_type: "property", entity_id: p.id });
    qc.invalidateQueries({ queryKey: ["admin", "properties"] });
    setConfirmDelete(null);
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        title="Property Management"
        description="Approve, verify, feature, edit, or remove listings."
        actions={
          <Button variant="outline" size="sm" disabled={!data?.length} onClick={() => downloadCSV("purulia-properties.csv", (data ?? []) as unknown as Record<string, unknown>[])}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title, city, locality…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={listing} onValueChange={setListing}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Listing" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listings</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="shop">Shop</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="office">Office</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verified} onValueChange={setVerified}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Verified" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Verified</SelectItem>
              <SelectItem value="no">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={featured} onValueChange={setFeatured}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Featured</SelectItem>
              <SelectItem value="no">Normal</SelectItem>
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
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.locality ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm capitalize">{p.property_type ?? "—"}</div>
                      <div className="text-xs uppercase text-muted-foreground">{p.listing_type ?? ""}</div>
                    </TableCell>
                    <TableCell className="text-sm">₹{p.price?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-sm">{p.city ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={p.status === "active" ? "default" : "outline"} className={p.status === "active" ? "bg-success/15 text-success hover:bg-success/15" : ""}>
                          {p.status ?? "—"}
                        </Badge>
                        {p.is_featured && <Badge className="bg-accent/30 text-accent-foreground hover:bg-accent/30"><Star className="mr-1 h-3 w-3" />Featured</Badge>}
                        {p.is_verified && <Badge className="bg-primary/15 text-primary hover:bg-primary/15"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => update(p, { status: "active" }, "property_approve")}><CheckCircle2 className="mr-2 h-4 w-4" /> Approve</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => update(p, { status: "rejected" }, "property_reject")}><XCircle className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => update(p, { is_featured: !p.is_featured }, "property_toggle_featured")}>
                            <Star className="mr-2 h-4 w-4" /> {p.is_featured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => update(p, { is_verified: !p.is_verified }, "property_toggle_verified")}>
                            <ShieldCheck className="mr-2 h-4 w-4" /> {p.is_verified ? "Unverify" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => update(p, { status: "sold" }, "property_mark_sold")}>Mark Sold</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => update(p, { status: "rented" }, "property_mark_rented")}>Mark Rented</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onSelect={() => setConfirmDelete(p)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No properties found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> {selected.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.locality}, {selected.city}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                {selected.images?.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selected.images.slice(0, 6).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-20 w-full rounded object-cover" loading="lazy" />
                    ))}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <Info label="Price" value={`₹${selected.price?.toLocaleString() ?? "—"}`} />
                  <Info label="Type" value={selected.property_type} />
                  <Info label="Listing" value={selected.listing_type} />
                  <Info label="Category" value={selected.category} />
                  <Info label="Bedrooms" value={selected.bedrooms} />
                  <Info label="Bathrooms" value={selected.bathrooms} />
                  <Info label="Area (sqft)" value={selected.area_sqft} />
                  <Info label="Views" value={selected.views} />
                </div>
                <Info label="Description" value={selected.description} />
                <Info label="Contact" value={selected.contact_phone} />
                <Info label="Listed" value={new Date(selected.created_at).toLocaleString()} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => confirmDelete && remove(confirmDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
