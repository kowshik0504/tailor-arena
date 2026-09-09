import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users, Scissors, ShoppingBag, IndianRupee, FileCheck,
  ArrowUpRight, Crown, TrendingUp, Check, X, Clock, AlertTriangle, Bell,
  Activity
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 12 }
  }
};

const hover3D = {
  rest: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: {
    scale: 1.02,
    rotateX: -2,
    rotateY: 2,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  }
};

function AdminDashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState({
    cpuLoad: "0%",
    dbLatency: 0,
    uptime: "0m 0s",
    memoryUsage: "0 MB",
    status: "Optimal"
  });
  const [verifications, setVerifications] = useState<any[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [healthRes, pendingRes, alertsRes, statsRes] = await Promise.all([
        api.get('/admin/system-health'),
        api.get('/admin/pending-tailors'),
        api.get('/admin/alerts'),
        api.get('/admin/stats')
      ]);
      setHealth(healthRes.data);
      setVerifications(pendingRes.data.slice(0, 3)); // Only show top 3 on dashboard
      setLiveAlerts(alertsRes.data.slice(0, 5)); // Show top 5 alerts
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.put(`/admin/alerts/${id}/resolve`, { resolutionNotes: resolutionNote });
      setResolutionNote("");
      setSelectedAlert(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve alert");
    }
  };

  return (
    <PageShell title={`Admin Command Center: ${user?.name?.split(" ")[0] || "Super Admin"}`} subtitle="Manage. Monitor. Grow.">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 perspective-1000">
        
        {/* 3D Hero */}
        <motion.div variants={itemVariants} whileHover="hover" initial="rest" animate="rest">
          <Card className="relative overflow-hidden p-8 lg:p-10 border-0 shadow-2xl bg-gradient-navy-deep text-cream transform-style-3d group">
            <div className="absolute -top-24 -right-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-10 left-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl group-hover:scale-110 transition-transform duration-700 delay-100" />

            <div className="relative z-10 grid lg:grid-cols-[1fr_300px] gap-8 items-center transform-z-20">
              <div>
                <h2 className="font-display text-4xl lg:text-5xl text-cream drop-shadow-sm">
                  Manage. Monitor. Grow.
                </h2>
                <p className="text-cream/80 text-sm mt-3 max-w-md font-sans tracking-wide leading-relaxed">
                  Real-time control over every atelier, customer, and rupee that flows through Tailor Arena. The engine room of the platform.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link to="/admin/verifications">
                    <Button className="bg-gradient-gold text-navy-deep hover:scale-105 transition-transform rounded-xl h-12 px-6 shadow-[0_0_20px_rgba(212,175,55,0.4)] gap-2 font-bold group-hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                      <FileCheck className="h-4 w-4" /> Review verifications
                    </Button>
                  </Link>
                  <Link to="/admin/reports">
                    <Button variant="outline" className="rounded-xl h-12 px-6 bg-white/5 border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                      <Activity className="h-4 w-4 mr-2" /> Live monitoring
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* 3D Floating Glass Panel */}
              <motion.div 
                className="glass-dark rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold font-bold">System Health</p>
                  <Badge className={`rounded-full border ${health.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border-rose-400/40'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse mr-1.5 ${health.status === 'Optimal' ? 'bg-emerald-400' : 'bg-rose-400'}`} /> {health.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Health label="CPU Load" value={health.cpuLoad || "0%"} />
                  <Health label="Database" value={`${health.dbLatency} ms`} />
                  <Health label="Uptime" value={health.uptime} />
                  <Health label="Memory" value={health.memoryUsage || "0 MB"} />
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* 3D Hoverable KPI cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <ExecStat icon={<Scissors />} label="Total Tailors" value={stats?.kpis?.totalTailors || "0"} trend="+5.1%" />
          <ExecStat icon={<Users />} label="Total Customers" value={stats?.kpis?.totalCustomers || "0"} trend="+8.4%" />
          <ExecStat icon={<FileCheck />} label="Pending Review" value={stats?.kpis?.pendingReview || "0"} trend="Live" />
          <ExecStat icon={<ShoppingBag />} label="Active Bookings" value={stats?.kpis?.activeBookings || "0"} trend="+12%" />
          <ExecStat icon={<IndianRupee />} label="Monthly Rev" value={stats?.kpis?.monthlyRev || "₹0"} trend="+18%" gold />
          <ExecStat icon={<AlertTriangle />} label="Expired Trials" value={stats?.kpis?.expiredTrials || "0"} trend="To convert" />
        </motion.div>

        {/* Animated Charts */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
          <motion.div whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }} transition={{ duration: 0.3 }}>
            <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-navy-deep text-navy h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-cream">Revenue Analytics</h3>
                  <p className="text-xs text-cream/60 mt-1">Platform earnings · last 8 months</p>
                </div>
                <Badge className="rounded-full bg-gold/15 text-gold border border-gold/40 shadow-sm">
                  <TrendingUp className="h-3 w-3 mr-1" /> +24% YoY
                </Badge>
              </div>
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenue || []} margin={{ left: -10, right: 10, top: 10 }}>
                    <defs>
                      <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.86 0.10 85)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="oklch(0.86 0.10 85)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" vertical={false} />
                    <XAxis dataKey="d" stroke="oklch(0.85 0.02 80)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.85 0.02 80)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "rgba(10,25,47,0.9)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 12, color: "white", backdropFilter: "blur(8px)" }} />
                    <Area type="monotone" dataKey="v" stroke="#D4AF37" strokeWidth={3} fill="url(#adminRev)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }} transition={{ duration: 0.3 }}>
            <Card className="p-6 border-gold/60 shadow-luxe h-full bg-white/50 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-display text-xl text-navy relative z-10">Revenue Breakdown</h3>
              <p className="text-xs text-muted-foreground relative z-10">By source · current month</p>
              <div className="h-48 mt-4 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={(stats?.breakdown || [])} dataKey="v" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                      {(stats?.breakdown || []).map((b: any) => <Cell key={b.name} fill={b.c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2.5 relative z-10 mt-2">
                {(stats?.breakdown || []).map((b: any) => (
                  <div key={b.name} className="flex items-center gap-3 text-xs bg-white/40 p-2 rounded-lg border border-white/60">
                    <span className="h-3 w-3 rounded-full shadow-sm" style={{ background: b.c }} />
                    <span className="text-navy font-medium">{b.name}</span>
                    <span className="ml-auto text-mocha font-bold">{b.v}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Verifications + Alerts */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-[1.4fr_1fr] gap-6 pb-10">
          <Card className="p-6 border-gold/60 shadow-luxe bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-navy/5 rounded-lg">
                  <FileCheck className="h-4 w-4 text-navy" />
                </div>
                <h3 className="font-display text-xl text-navy">Priority Action Queue</h3>
                <Badge className="rounded-full bg-gold/15 text-navy-deep border border-gold/40 ml-2 shadow-sm">{verifications.length}</Badge>
              </div>
              <Link to="/admin/verifications">
                <Button variant="ghost" size="sm" className="rounded-full text-navy hover:bg-gold/20 transition-colors group">
                  Open queue <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {verifications.length === 0 ? (
                  <div className="text-center py-6 text-mocha/60 text-sm">No pending verifications.</div>
                ) : verifications.map((v, i) => (
                    <motion.div 
                      key={v._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center p-3.5 rounded-xl border border-gold/20 shadow-sm bg-white/60 hover:bg-white transition-colors"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-navy flex items-center justify-center text-cream font-bold text-sm shadow-inner">
                        {(v.shopName || v.user?.name || 'TR').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="font-medium text-navy text-sm truncate">{v.shopName || v.user?.name}</p>
                          <Badge className="rounded-md bg-gold/20 text-navy-deep px-1.5 py-0">Urgent</Badge>
                        </div>
                        <p className="text-xs text-mocha truncate">
                          {v.address?.city || 'Tailor'} • {v.isAadharVerified ? 'Aadhaar Verified' : 'Aadhaar Pending'}
                        </p>
                      </div>
                      <Link to="/admin/verifications" className="flex gap-1.5 shrink-0 ml-2">
                        <Button size="sm" variant="outline" className="h-8 border-gold/40 text-gold hover:bg-gold/10 px-3">Review</Button>
                      </Link>
                    </motion.div>
                ))}
            </div>
          </Card>

          <Card className="p-6 border-gold/60 shadow-luxe bg-white/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Bell className="h-4 w-4 text-rose-600" />
              </div>
              <h3 className="font-display text-xl text-navy">Live System Alerts</h3>
            </div>
            <div className="space-y-3 relative z-10">
                {liveAlerts.length === 0 ? (
                  <div className="text-center py-6 text-mocha/60 text-sm">No live alerts at this time.</div>
                ) : liveAlerts.map((a, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + (0.1 * i) }}
                    key={a._id} 
                    onClick={() => setSelectedAlert(a)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-white shadow-sm bg-white hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shadow-sm flex-shrink-0 ${
                      a.severity === "high" ? "bg-rose-500 shadow-rose-500/40" : 
                      a.severity === "medium" ? "bg-gold shadow-gold/40" : 
                      "bg-navy shadow-navy/40"
                    }`} />
                    <p className="text-sm text-navy flex-1 font-medium leading-snug line-clamp-2">{a.title}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono bg-secondary/50 px-1.5 py-0.5 rounded shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </div>
              <Link to="/admin/notifications">
                <Button variant="outline" className="w-full mt-6 rounded-xl border-gold/40 text-navy hover:bg-gold/10 relative z-10 transition-colors">
                  View alert center
                </Button>
              </Link>
            </Card>
          </motion.div>
        </motion.div>

        {/* Selected Alert Modal Overlay */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-cream w-full max-w-lg rounded-3xl shadow-luxe overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-white/50">
                <div>
                  <h2 className="font-display text-2xl text-navy flex items-center gap-2">
                    {selectedAlert.severity === 'high' ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <Bell className="h-5 w-5 text-gold" />}
                    Alert Details
                  </h2>
                  <p className="text-sm text-mocha mt-1">Reviewing system flagged activity</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAlert(null)} className="rounded-full hover:bg-rose-50 text-mocha hover:text-rose-600">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white/30">
                <div>
                  <h3 className="font-semibold text-navy text-lg">{selectedAlert.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`rounded-full text-[10px] uppercase tracking-wider ${selectedAlert.severity === 'high' ? 'bg-rose-100 text-rose-700 border-rose-200' : selectedAlert.severity === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      {selectedAlert.severity} severity
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider border-gold/40 text-navy">
                      {selectedAlert.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gold/20 shadow-sm">
                  <p className="text-sm font-semibold text-navy mb-2">Issue Description & Reason</p>
                  <p className="text-sm text-mocha leading-relaxed">{selectedAlert.description}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gold/20 shadow-sm">
                  <label className="text-sm font-semibold text-navy block mb-2">Resolution Notes (Required)</label>
                  <textarea 
                    className="w-full text-sm border-gold/30 rounded-lg p-3 bg-cream/30 focus:bg-white focus:ring-1 focus:ring-gold min-h-[100px] transition-all resize-none outline-none"
                    placeholder="E.g., Sent email to customer, verified transaction, extended freemium..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gold/20 bg-white/50 flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedAlert(null)} className="border-gold/30 text-navy hover:bg-gold/10">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleResolveAlert(selectedAlert._id)} 
                  className="bg-gradient-navy text-cream shadow-md hover:shadow-lg"
                  disabled={!resolutionNote.trim()}
                >
                  <Check className="h-4 w-4 mr-2" /> Mark Resolved
                </Button>
              </div>
            </div>
          </div>
        )}
    </PageShell>
  );
}

function Health({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 shadow-inner hover:bg-white/10 transition-colors cursor-default">
      <p className="text-[10px] uppercase tracking-[0.22em] text-cream/70 font-semibold">{label}</p>
      <p className="font-display text-lg text-cream mt-1 drop-shadow-sm">{value}</p>
    </div>
  );
}

function ExecStat({ icon, label, value, trend, gold }: { icon: React.ReactNode; label: string; value: string; trend: string; gold?: boolean }) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}>
      <Card className={`p-5 border-0 shadow-luxe h-full relative overflow-hidden ${gold ? "bg-gradient-gold text-navy-deep" : "bg-white"}`}>
        {gold && <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />}
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${gold ? "bg-navy-deep/10 text-navy-deep" : "bg-gradient-navy text-cream"}`}>
          {icon}
        </div>
        <p className={`text-[10px] uppercase tracking-[0.22em] mt-4 font-bold ${gold ? "text-navy-deep/80" : "text-mocha/80"}`}>{label}</p>
        <p className={`font-display text-3xl mt-1 tracking-tight ${gold ? "text-navy-deep" : "text-navy"}`}>{value}</p>
        <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${gold ? "bg-navy-deep/10 text-navy-deep" : "bg-emerald-500/10 text-emerald-700"}`}>
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      </Card>
    </motion.div>
  );
}



