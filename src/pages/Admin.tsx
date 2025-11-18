import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, LogOut, Shield, RefreshCw, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  order_id: string;
  full_name: string;
  phone: string;
  address: string;
  quantity: number;
  pump_type: string;
  referrer: string | null;
  status: string;
  created_at: string;
  notes: string | null;
}

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchBookings();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchBookings();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Account created. You can now log in.",
        });
        setIsSignup(false);
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchBookings();
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ notes })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
      fetchBookings();
      setSelectedBooking(null);
    }
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Name", "Phone", "Address", "Quantity", "Pump Type", "Referrer", "Status", "Date"];
    const rows = bookings.map(b => [
      b.order_id,
      b.full_name,
      b.phone,
      b.address,
      b.quantity,
      b.pump_type,
      b.referrer || "Direct",
      b.status,
      new Date(b.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jal-rakshak-bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getPumpTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      normal: "Normal Pump",
      submersible: "Submersible Pump",
      air_compressor: "Air Compressor",
    };
    return labels[type] || type;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      scheduled: "secondary",
      installed: "outline",
      warranty: "secondary",
      closed: "outline",
      doa: "destructive",
    };
    return variants[status] || "default";
  };

  const filteredBookings = filterStatus === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isSignup ? "Create Admin Account" : "Admin Login"}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? "Create a new admin account to manage bookings" 
                : "Enter your credentials to access the admin panel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jalrakshak.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">
                {isSignup ? "Create Account" : "Login"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setEmail("");
                  setPassword("");
                }}
              >
                {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Jal Rakshak Admin</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold">Bookings</h2>
            <p className="text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} orders
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="warranty">Warranty</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="doa">DOA</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchBookings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {filterStatus === "all" ? "No bookings yet" : `No ${filterStatus} bookings`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Pump Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">{booking.order_id}</TableCell>
                    <TableCell className="font-medium">{booking.full_name}</TableCell>
                    <TableCell>
                      <a 
                        href={`https://wa.me/91${booking.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {booking.phone}
                      </a>
                    </TableCell>
                    <TableCell>{getPumpTypeLabel(booking.pump_type)}</TableCell>
                    <TableCell>{booking.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.referrer || "Direct"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setEditNotes(booking.notes || "");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              Order ID: {booking.order_id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Customer Name</Label>
                                <p>{booking.full_name}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Phone</Label>
                                <p>
                                  <a 
                                    href={`https://wa.me/91${booking.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {booking.phone}
                                  </a>
                                </p>
                              </div>
                              <div className="col-span-2">
                                <Label className="font-semibold">Address</Label>
                                <p className="text-sm">{booking.address}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Pump Type</Label>
                                <p>{getPumpTypeLabel(booking.pump_type)}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Quantity</Label>
                                <p>{booking.quantity}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Referrer</Label>
                                <p>{booking.referrer || "Direct"}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Date Ordered</Label>
                                <p>{new Date(booking.created_at).toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <Label className="font-semibold">Status</Label>
                                <Select
                                  value={booking.status}
                                  onValueChange={(value) => updateStatus(booking.id, value)}
                                >
                                  <SelectTrigger className="w-full mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="installed">Installed</SelectItem>
                                    <SelectItem value="warranty">Warranty</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="doa">DOA</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor="notes" className="font-semibold">
                                  Notes / Comments
                                </Label>
                                <Textarea
                                  id="notes"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Add installation notes, warranty info, etc."
                                  rows={4}
                                  className="mt-1"
                                />
                                <Button 
                                  className="mt-2" 
                                  onClick={() => updateNotes(booking.id, editNotes)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Save Notes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
