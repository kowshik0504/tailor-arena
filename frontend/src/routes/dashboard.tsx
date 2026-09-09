import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  TrendingUp, Scissors, Clock, ArrowUpRight, IndianRupee, Package, Bell,
  Check, X, Zap, MoreVertical, Sparkles, CalendarDays, Pause, AlertCircle,
  Ruler, ShieldCheck, Crown,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, CartesianGrid as CartesianGridRecharts
} from "recharts";
import api from "@/lib/api";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type OrderStatus =
  | "Pending" | "Accepted" | "Rejected" | "Request Changes" | "Started Early"
  | "In Stitching" | "Ready for Delivery" | "Completed" | "New";

const statusTint: Record<OrderStatus, string> = {
  "Pending": "bg-gold/20 text-navy-deep border-gold/40",
  "Accepted": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Rejected": "bg-rose-100 text-rose-800 border-rose-200",
  "Request Changes": "bg-amber-100 text-amber-800 border-amber-200",
  "Started Early": "bg-gradient-gold text-navy-deep border-gold",
  "In Stitching": "bg-navy/10 text-navy border-navy/20",
  "Ready for Delivery": "bg-champagne text-navy-deep border-gold/40",
  "Completed": "bg-secondary text-secondary-foreground border-border",
  "New": "bg-gradient-cream text-navy border-gold/20",
};

type Order = {
  id: string;
  customer: string;
  dress?: string;
  garment?: string;
  fabric?: string;
  delivery?: string;
  due?: string;
  priority: "Normal" | "High" | "VIP";
  bookedAt?: string;
  rawDate?: string;
  rawCreatedAt?: string;
  measurements?: any;
  status: OrderStatus;
  price?: number;
};



// Static data removed in favor of dynamic calculation

function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [earningsHistoryOpen, setEarningsHistoryOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/bookings/tailor');
        const mapped: Order[] = data.map((b: any) => {
          let status: OrderStatus = "Pending";
          if (b.status === "confirmed" || b.status === "acknowledged") status = "Accepted";
          else if (b.status === "cancelled") status = "Rejected";
          else if (b.status === "hold") status = "Request Changes";
          else if (b.status === "in-progress") status = "In Stitching";
          else if (b.status === "completed") status = "Completed";

          return {
            id: b._id,
            customer: b.customer?.name || "Unknown",
            dress: b.dressType,
            garment: b.dressType,
            delivery: new Date(b.date).toLocaleDateString(),
            due: new Date(b.date).toLocaleDateString(),
            priority: b.priority || "Normal",
            bookedAt: new Date(b.createdAt).toLocaleDateString(),
            rawDate: b.date,
            rawCreatedAt: b.createdAt,
            status,
            price: b.amount || 0,
          };
        });
        setOrders(mapped);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const [accepting, setAccepting] = useState(true);
  const [paused, setPaused] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/tailors/profile');
        if (res.data) {
          setPaused(res.data.isPaused || false);
          setAccepting(!res.data.isPaused);
          setProfileStatus(res.data.status);
          setAdminFeedback(res.data.adminFeedback || "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleAcceptingChange = async (v: boolean) => {
    setAccepting(v);
    if (v) setPaused(false);
    try {
      await api.put('/tailors/profile', { isPaused: !v });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePausedChange = async (v: boolean) => {
    setPaused(v);
    if (v) setAccepting(false);
    try {
      await api.put('/tailors/profile', { isPaused: v });
    } catch (err) {
      console.error(err);
    }
  };

  const setStatus = (id: string, s: OrderStatus) =>
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: s } : o)));

  const priorityWeight: Record<string, number> = { VIP: 3, High: 2, Normal: 1 };

  const pending = orders
    .filter((o) => o.status === "Pending" || o.status === "New")
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  // Dynamically calculate upcoming deliveries from orders
  const upcomingList = [...orders]
    .filter(o => ["Accepted", "In Stitching", "Ready for Delivery", "Started Early"].includes(o.status))
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    .slice(0, 3)
    .map(o => ({
      d: o.due || o.delivery || "Upcoming",
      n: o.customer,
      g: o.garment || o.dress || "Custom Order",
      price: "—", // Price not available in local orders currently
      p: o.priority
    }));

  // Dynamically calculate reminders from orders
  const remindersList = [...orders]
    .filter(o => ["Pending", "New", "Ready for Delivery", "Request Changes", "Changes Requested"].includes(o.status))
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    .slice(0, 4)
    .map(o => {
      if (o.status === "Pending" || o.status === "New") {
        return { t: "New order approval", s: `${o.customer} · ${o.garment || "Order"}`, tint: "bg-gold" };
      }
      if (o.status === "Ready for Delivery") {
        return { t: "Delivery due soon", s: `${o.customer} · ${o.garment || "Order"}`, tint: "bg-terracotta" };
      }
      if (o.status === "Request Changes") {
        return { t: "Changes requested", s: `${o.customer} · ${o.id}`, tint: "bg-rose-500" };
      }
      return { t: "Action needed", s: `${o.customer} · ${o.id}`, tint: "bg-navy" };
    });

  // Calculate dynamic charts
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueData = Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    return { d: daysOfWeek[d.getDay()], v: 0, dateObj: d };
  });

  const capacityData = Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() + i);
    return { d: daysOfWeek[d.getDay()], v: 0, dateObj: d };
  });

  orders.forEach(o => {
    if (o.status === "Completed" && o.rawCreatedAt) {
      const orderDate = new Date(o.rawCreatedAt);
      const dayData = revenueData.find(d => 
        d.dateObj.getDate() === orderDate.getDate() && 
        d.dateObj.getMonth() === orderDate.getMonth()
      );
      if (dayData) dayData.v += (o.price || 0);
    }

    if (o.rawDate) {
      const orderDue = new Date(o.rawDate);
      const dayData = capacityData.find(d => 
        d.dateObj.getDate() === orderDue.getDate() && 
        d.dateObj.getMonth() === orderDue.getMonth()
      );
      if (dayData) dayData.v += 1;
    }
  });
  // Calculate dynamic stats
  const totalEarnings = orders.filter(o => o.status === "Completed").reduce((acc, o) => acc + (o.price || 0), 0);
  const stats = [
    { label: "Total Orders", value: orders.length.toString(), trend: "All time", icon: Scissors, tint: "bg-gradient-cream", fg: "text-navy" },
    { label: "Pending Approval", value: pending.length.toString(), trend: pending.length > 0 ? "Action needed" : "All clear", icon: AlertCircle, tint: "bg-gradient-gold", fg: "text-navy-deep" },
    { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString()}`, trend: "Completed orders", icon: IndianRupee, tint: "bg-gradient-navy", fg: "text-cream" },
    { label: "Upcoming Deliveries", value: upcomingList.length.toString(), trend: "Soon", icon: Package, tint: "bg-gradient-champagne", fg: "text-navy" },
  ];

  // Calculate workload this week
  const thisWeekOrders = orders.filter(o => {
    if (!o.rawDate) return false;
    const orderDue = new Date(o.rawDate);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return orderDue >= now && orderDue <= nextWeek && ["Accepted", "In Stitching", "Pending"].includes(o.status);
  }).length;
  
  const MAX_WEEKLY_SLOTS = 14;
  const workloadPercent = Math.min(100, Math.round((thisWeekOrders / MAX_WEEKLY_SLOTS) * 100));
  const remainingSlots = Math.max(0, MAX_WEEKLY_SLOTS - thisWeekOrders);

  // Calculate full history data for the modal
  const historyData = useMemo(() => {
    if (!orders.length) return [];
    
    let minDate = new Date();
    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    orders.forEach(o => {
      if (o.rawDate) {
        const d = new Date(o.rawDate);
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });

    const dates: { dateObj: Date; label: string; v: number }[] = [];
    let curr = new Date(minDate);
    curr.setHours(0,0,0,0);
    const end = new Date(maxDate);
    end.setHours(0,0,0,0);
    
    if ((end.getTime() - curr.getTime()) / (1000 * 3600 * 24) > 90) {
      curr = new Date(end.getTime() - 90 * 24 * 3600 * 1000);
    }

    while (curr <= end) {
      dates.push({
        dateObj: new Date(curr),
        label: curr.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        v: 0
      });
      curr.setDate(curr.getDate() + 1);
    }

    orders.forEach(o => {
      if (o.rawDate) {
        const d = new Date(o.rawDate);
        const match = dates.find(x => x.dateObj.getDate() === d.getDate() && x.dateObj.getMonth() === d.getMonth() && x.dateObj.getFullYear() === d.getFullYear());
        if (match) match.v += 1;
      }
    });

    return dates;
  }, [orders]);

  // Calculate full earnings history for the modal
  const earningsHistoryData = useMemo(() => {
    if (!orders.length) return [];
    
    let minDate = new Date();
    const maxDate = new Date();
    
    orders.forEach(o => {
      if (o.status === "Completed" && o.rawCreatedAt) {
        const d = new Date(o.rawCreatedAt);
        if (d < minDate) minDate = d;
      }
    });

    const dates: { dateObj: Date; label: string; v: number }[] = [];
    let curr = new Date(minDate);
    curr.setHours(0,0,0,0);
    const end = new Date(maxDate);
    end.setHours(0,0,0,0);
    
    if ((end.getTime() - curr.getTime()) / (1000 * 3600 * 24) > 90) {
      curr = new Date(end.getTime() - 90 * 24 * 3600 * 1000);
    }

    while (curr <= end) {
      dates.push({
        dateObj: new Date(curr),
        label: curr.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        v: 0
      });
      curr.setDate(curr.getDate() + 1);
    }

    orders.forEach(o => {
      if (o.status === "Completed" && o.rawCreatedAt) {
        const d = new Date(o.rawCreatedAt);
        const match = dates.find(x => x.dateObj.getDate() === d.getDate() && x.dateObj.getMonth() === d.getMonth() && x.dateObj.getFullYear() === d.getFullYear());
        if (match) match.v += (o.price || 0);
      }
    });

    return dates;
  }, [orders, profileStatus]);

  if (profileStatus === "pending") {
    return (
      <PageShell title="Dashboard" subtitle="Overview of your business">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
            <ShieldCheck className="h-10 w-10 text-gold" />
          </div>
          <h2 className="font-display text-3xl text-navy-deep mb-4">Account Under Verification</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your Atelier profile has been submitted and is currently being reviewed by our team. You will be notified via email once approved.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-champagne text-navy font-medium text-sm">
            <Clock className="h-4 w-4" /> Usually takes 24 hours
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Good morning, ${user?.name?.split(" ")[0] || "Aarav"}`}
      subtitle="Welcome back to Tailor Arena — here's how your atelier is doing."
    >
      {/* Welcome banner */}
      <Card className="relative overflow-hidden p-6 lg:p-8 border-0 shadow-navy bg-gradient-navy text-cream">
        <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-[11px] uppercase tracking-[0.2em]">
              <Crown className="h-3 w-3" /> Freemium · Verified Tailor
            </div>
            <h2 className="font-display text-3xl lg:text-4xl mt-3 text-balance">
              {pending.length} new orders await your approval
            </h2>
            <p className="text-cream/70 text-sm mt-2">
              Review bookings, manage availability, and keep your atelier flowing.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <Link to="/orders">
              <Button className="bg-gradient-gold text-navy-deep hover:opacity-95 rounded-xl h-11 px-5 shadow-glow gap-2">
                <Sparkles className="h-4 w-4" /> Review pending orders
              </Button>
            </Link>
            <span className="text-[11px] text-cream/50">{orders.filter(o => o.status !== "Rejected" && o.status !== "Completed").length} active orders in pipeline</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          let val = s.value;
          if (idx === 0) val = orders.length.toString();
          if (idx === 1) val = pending.length.toString();
          if (idx === 2) {
            const earnings = orders.filter(o => o.status === "Completed").reduce((acc, curr) => acc + (curr.price || 0), 0);
            val = `₹${earnings.toLocaleString()}`;
          }
          if (idx === 3) val = upcomingList.length.toString();
          
          return (
            <Card key={s.label} className={`p-5 border-0 shadow-luxe ${s.tint} ${s.fg} relative overflow-hidden`}>
              <s.icon className="h-5 w-5 opacity-80" />
              <p className="text-[11px] uppercase tracking-[0.18em] mt-3 opacity-75">{s.label}</p>
              <p className="font-display text-3xl mt-1">{val}</p>
              <p className="text-[11px] mt-1 opacity-70">{s.trend}</p>
            </Card>
          );
        })}
      </div>

      {/* ORDER APPROVAL QUEUE */}
      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <h3 className="font-display text-xl text-navy">Order approval queue</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              New customer bookings — accept, reject, or start early.
            </p>
          </div>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="rounded-full text-navy hover:bg-champagne/50">
              View all orders <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            All caught up ✨ no orders pending approval.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <Link key={o.id} to={`/order/${o.id}` as any} className="block">
                <OrderRow order={o} />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Earnings + Availability */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl text-navy">Total Earnings</h3>
              <p className="text-xs text-muted-foreground">₹{orders.filter(o => o.status === "Completed").reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()} collected</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs px-3 rounded-full border-gold/40 text-navy hover:bg-gold/10"
                onClick={() => setEarningsHistoryOpen(true)}
              >
                View History
              </Button>
              <Badge variant="outline" className="rounded-full border-gold/40 text-navy bg-gold/10">
                <TrendingUp className="h-3 w-3 mr-1" />+12%
              </Badge>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.5 0.04 260)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.27 0.09 265)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-cream">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">Availability</h3>
          </div>
          <p className="text-xs text-muted-foreground">Control your booking flow.</p>

          <div className="mt-4 space-y-3">
            <ToggleRow
              icon={<Zap className="h-4 w-4" />}
              label="Accepting bookings"
              hint="New orders can be placed"
              checked={accepting}
              onChange={handleAcceptingChange}
            />
            <ToggleRow
              icon={<Pause className="h-4 w-4" />}
              label="Pause new orders"
              hint="Temporarily stop incoming"
              checked={paused}
              onChange={handlePausedChange}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-white/60 p-4 border border-gold/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Workload this week</p>
              <span className="text-[11px] text-navy font-medium">{thisWeekOrders} / {MAX_WEEKLY_SLOTS} slots</span>
            </div>
            <div className="h-2 w-full bg-cream rounded-full overflow-hidden">
              <div className="h-full bg-gradient-gold transition-all duration-500" style={{ width: `${workloadPercent}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {remainingSlots > 0 ? `Healthy capacity — you can take ${remainingSlots} more orders.` : "You are fully booked for this week."}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-xs font-medium text-navy">Upcoming Schedule</h4>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-[10px] px-3 rounded-full border-gold/40 text-navy hover:bg-gold/10"
              onClick={() => setHistoryOpen(true)}
            >
              View History
            </Button>
          </div>

          <div className="mt-3 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData}>
                <XAxis dataKey="d" stroke="oklch(0.5 0.04 260)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" fill="oklch(0.27 0.09 265)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Reminders + Upcoming */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">Upcoming deliveries</h3>
          </div>
          <div className="space-y-2">
            {upcomingList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground bg-cream0 rounded-xl">
                No upcoming deliveries.
              </div>
            ) : upcomingList.map((u, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-champagne/40 transition">
                <div className="h-10 w-10 rounded-xl bg-gradient-champagne flex items-center justify-center">
                  <Scissors className="h-4 w-4 text-navy" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy">{u.g}</p>
                  <p className="text-[11px] text-muted-foreground">{u.n} · {u.d}</p>
                </div>
                <p className="text-sm font-display tabular-nums text-navy">{u.price}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-navy" />
              <h3 className="font-display text-xl text-navy">Reminders</h3>
            </div>
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="rounded-full text-navy hover:bg-champagne/50">
                All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {remindersList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground bg-cream0 rounded-xl">
                All caught up. No reminders!
              </div>
            ) : remindersList.map((r, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-cream0">
                <span className={`mt-1.5 h-2 w-2 rounded-full ${r.tint}`} />
                <div>
                  <p className="text-sm font-medium text-navy">{r.t}</p>
                  <p className="text-[11px] text-muted-foreground">{r.s}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-navy">Workload History</DialogTitle>
            <DialogDescription>
              A complete timeline of your capacity and order volume from the past up to your upcoming week.
            </DialogDescription>
          </DialogHeader>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.5 0.04 260)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} 
                  formatter={(value: number) => [`${value} orders`, 'Workload']}
                />
                <Bar dataKey="v" fill="oklch(0.27 0.09 265)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
      {/* Earnings History Modal */}
      <Dialog open={earningsHistoryOpen} onOpenChange={setEarningsHistoryOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-navy">Earnings History</DialogTitle>
            <DialogDescription>
              A complete timeline of your total earnings and revenue.
            </DialogDescription>
          </DialogHeader>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsHistoryData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.5 0.04 260)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} 
                  formatter={(value: number) => [`₹${value}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="v" stroke="oklch(0.27 0.09 265)" strokeWidth={2} fillOpacity={1} fill="url(#revHist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function ToggleRow({ icon, label, hint, checked, onChange }: { icon: React.ReactNode; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 border border-gold/60">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-navy text-cream flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-sm font-medium text-navy leading-tight">{label}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const priorityTint: Record<string, string> = {
    Normal: "bg-secondary text-secondary-foreground",
    High: "bg-terracotta/15 text-terracotta",
    VIP: "bg-gradient-gold text-navy-deep",
  };

  const showActions = order.status === "Pending" || order.status === "New";

  return (
    <div className="group flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-gold/60 bg-gradient-soft hover:shadow-luxe hover:border-gold/40 transition-all">
      <div className="flex items-center gap-3 lg:w-64">
        <div className="h-11 w-11 rounded-xl bg-gradient-navy text-cream flex items-center justify-center font-display">
          {order.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy truncate">{order.customer}</p>
          <p className="text-[11px] text-muted-foreground">{order.id} · {order.bookedAt || "Just now"}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <Cell label="Dress" value={order.dress || order.garment || "Custom"} />
        <Cell label="Fabric" value={order.fabric || "Unknown"} />
        <Cell label="Delivery" value={order.delivery || order.due || "TBD"} />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Measurement</p>
          <p className={`text-sm font-medium ${order.measurements === "Saved" ? "text-emerald-700" : "text-terracotta"}`}>
            <Ruler className="inline h-3 w-3 mr-1" />{order.measurements === "Saved" ? "Saved" : "Pending"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`rounded-full text-[10px] uppercase tracking-wider ${priorityTint[order.priority]}`}>{order.priority}</Badge>
        <Badge className={`rounded-full border ${statusTint[order.status]}`}>{order.status}</Badge>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-navy truncate">{value}</p>
    </div>
  );
}






