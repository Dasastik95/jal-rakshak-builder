import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, StatCard } from "@/components/admin/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Star,
  Heart,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Purulia Admin" }] }),
  component: DashboardPage,
});

interface DashboardData {
  totals: {
    users: number;
    properties: number;
    active: number;
    pending: number;
    soldRented: number;
    featured: number;
    saved: number;
  };
  userGrowth: { date: string; count: number }[];
  listingTrend: { date: string; count: number }[];
  statusBreakdown: { name: string; value: number }[];
  typeBreakdown: { name: string; value: number }[];
}

function lastNDays(n: number) {
  const arr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function DashboardPage() {
  const { client } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    enabled: !!client,
    queryFn: async (): Promise<DashboardData> => {
      const sb = client!;
      const [usersCnt, propsCnt, activeCnt, pendingCnt, soldCnt, featuredCnt, savedCnt, profilesAll, propsAll] =
        await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }),
          sb.from("properties").select("id", { count: "exact", head: true }),
          sb.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
          sb.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
          sb
            .from("properties")
            .select("id", { count: "exact", head: true })
            .in("status", ["sold", "rented"]),
          sb.from("properties").select("id", { count: "exact", head: true }).eq("is_featured", true),
          sb.from("saved_properties").select("user_id", { count: "exact", head: true }),
          sb.from("profiles").select("created_at").order("created_at", { ascending: true }).limit(2000),
          sb.from("properties").select("created_at, status, property_type").order("created_at", { ascending: true }).limit(2000),
        ]);

      const days = lastNDays(30);
      const buildSeries = (rows: { created_at: string }[] | null) => {
        const map = new Map(days.map((d) => [d, 0]));
        (rows ?? []).forEach((r) => {
          const day = (r.created_at ?? "").slice(0, 10);
          if (map.has(day)) map.set(day, (map.get(day) ?? 0) + 1);
        });
        return days.map((d) => ({ date: d.slice(5), count: map.get(d) ?? 0 }));
      };

      const statusGroups: Record<string, number> = {};
      const typeGroups: Record<string, number> = {};
      (propsAll.data ?? []).forEach((p: { status?: string; property_type?: string }) => {
        const s = p.status ?? "unknown";
        statusGroups[s] = (statusGroups[s] ?? 0) + 1;
        const t = p.property_type ?? "other";
        typeGroups[t] = (typeGroups[t] ?? 0) + 1;
      });

      return {
        totals: {
          users: usersCnt.count ?? 0,
          properties: propsCnt.count ?? 0,
          active: activeCnt.count ?? 0,
          pending: pendingCnt.count ?? 0,
          soldRented: soldCnt.count ?? 0,
          featured: featuredCnt.count ?? 0,
          saved: savedCnt.count ?? 0,
        },
        userGrowth: buildSeries(profilesAll.data as { created_at: string }[] | null),
        listingTrend: buildSeries(propsAll.data as { created_at: string }[] | null),
        statusBreakdown: Object.entries(statusGroups).map(([name, value]) => ({ name, value })),
        typeBreakdown: Object.entries(typeGroups)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
      };
    },
  });

  const COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time overview of activity across the Purulia Properties platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={data?.totals.users ?? 0} icon={Users} loading={isLoading} />
        <StatCard label="Total Properties" value={data?.totals.properties ?? 0} icon={Building2} loading={isLoading} accent="primary" />
        <StatCard label="Active Listings" value={data?.totals.active ?? 0} icon={CheckCircle2} loading={isLoading} accent="success" />
        <StatCard label="Pending Approval" value={data?.totals.pending ?? 0} icon={Clock} loading={isLoading} accent="accent" />
        <StatCard label="Sold / Rented" value={data?.totals.soldRented ?? 0} icon={TrendingUp} loading={isLoading} />
        <StatCard label="Featured" value={data?.totals.featured ?? 0} icon={Star} loading={isLoading} accent="accent" />
        <StatCard label="Saved Properties" value={data?.totals.saved ?? 0} icon={Heart} loading={isLoading} />
        <StatCard label="Revenue (this month)" value="—" hint="Configure payments table" loading={isLoading} accent="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User growth (30d)</CardTitle>
            <CardDescription>New signups per day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.userGrowth ?? []}>
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-chart-1)" fill="url(#ug)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings trend (30d)</CardTitle>
            <CardDescription>New properties listed per day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.listingTrend ?? []}>
                <defs>
                  <linearGradient id="lt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-chart-2)" fill="url(#lt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>Current property statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.statusBreakdown ?? []} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                  {(data?.statusBreakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property types</CardTitle>
            <CardDescription>Top categories listed</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.typeBreakdown ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
