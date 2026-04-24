import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  MessageSquare,
  CreditCard,
  MapPin,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  History,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — Purulia Properties" }],
  }),
  component: AdminLayout,
});

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Manage",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/properties", label: "Properties", icon: Building2 },
      { to: "/admin/requirements", label: "Requirements", icon: ClipboardList },
      { to: "/admin/chats", label: "Chats & Leads", icon: MessageSquare },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/payments", label: "Monetization", icon: CreditCard },
      { to: "/admin/locations", label: "Locations & Categories", icon: MapPin },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
      { to: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/audit-logs", label: "Audit Logs", icon: History },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function AppSidebar() {
  const location = useLocation();
  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-3 text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold">Purulia Properties</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">
              Admin Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, "end" in item ? item.end : false);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[10px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          v1.0 — Purulia Admin
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const initials =
    auth.user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden border-success/30 bg-success/10 text-success sm:inline-flex"
        >
          <ShieldCheck className="mr-1 h-3 w-3" />
          {auth.isSuperAdmin ? "Super Admin" : "Sub Admin"}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {auth.user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{auth.user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/admin/settings" })}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/admin/security" })}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Security & 2FA
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth.client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-foreground">Supabase not configured</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set the <code>PURULIA_SUPABASE_URL</code> and{" "}
            <code>PURULIA_SUPABASE_ANON_KEY</code> project secrets, then reload.
          </p>
        </div>
      </div>
    );
  }

  if (!auth.session) {
    navigate({
      to: "/login",
      search: { redirect: location.pathname },
      replace: true,
    });
    return null;
  }

  if (auth.mfaRequired) {
    navigate({ to: "/login/verify-mfa", replace: true });
    return null;
  }

  if (!auth.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have admin privileges. Ask a Super Admin to grant you the role.
          </p>
          <Button
            className="mt-6"
            onClick={async () => {
              await auth.signOut();
              navigate({ to: "/login" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
