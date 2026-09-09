import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Scissors, Activity, TrendingUp, MapPin, Star, ShoppingBag } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/reports").then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <PageShell title="Reports & Insights" subtitle="Loading analytics..."><div /></PageShell>;
  }

  const { kpis, bookings, services, regions, topTailors } = data;

  return (
    <PageShell title="Reports & Insights" subtitle="Platform analytics across users, services, and regions.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Users />} label="Total Customers" value={kpis.totalCustomers.toLocaleString()} trend="Live" />
        <Kpi icon={<Scissors />} label="Total Tailors" value={kpis.totalTailors.toLocaleString()} trend="Live" />
        <Kpi icon={<Activity />} label="Active Users (30d)" value={kpis.activeUsers.toLocaleString()} trend="Active" />
        <Kpi icon={<TrendingUp />} label="Booking Growth" value={kpis.bookingGrowth} trend="vs last month" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-xl text-navy mb-1">Booking growth</h3>
          <p className="text-xs text-muted-foreground mb-4">Orders placed · last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookings} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.27 0.09 265)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.27 0.09 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.27 0.09 265)" strokeWidth={2.5} fill="url(#bk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-xl text-navy mb-1">Most popular services</h3>
          <p className="text-xs text-muted-foreground mb-4">Share of total orders</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={services} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.76 0.13 80)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-gold" />
            <h3 className="font-display text-xl text-navy">Top performing tailors</h3>
          </div>
          <div className="space-y-2">
            {topTailors.length === 0 && <p className="text-sm text-mocha">No data available.</p>}
            {topTailors.map((t: any, i: number) => (
              <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl border border-gold/40 bg-white/40">
                <span className="h-8 w-8 rounded-lg bg-gradient-gold text-navy-deep flex items-center justify-center font-display text-sm">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-navy font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.city}</p>
                </div>
                <span className="text-xs text-mocha flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> {t.orders}</span>
                <Badge className="rounded-full bg-gold/15 text-navy-deep border border-gold/40">★ {t.rating}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">Regional analytics</h3>
          </div>
          <div className="space-y-3">
            {regions.map((r: any) => {
              const total = r.customers + r.tailors;
              const pct = total === 0 ? 0 : (r.customers / total) * 100;
              return (
                <div key={r.r}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy font-medium">{r.r}</span>
                    <span className="text-mocha">{r.customers.toLocaleString()} customers · {r.tailors} tailors</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream mt-1.5 overflow-hidden flex">
                    <div className="bg-gradient-navy" style={{ width: `${pct}%` }} />
                    <div className="bg-gradient-gold flex-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Kpi({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <Card className="p-5 border-gold/60 shadow-luxe bg-cream">
      <div className="h-9 w-9 rounded-xl bg-gradient-navy text-cream flex items-center justify-center">{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-mocha/70 mt-3">{label}</p>
      <p className="font-display text-2xl text-navy mt-1">{value}</p>
      <p className="text-[11px] text-emerald-700 mt-1">{trend}</p>
    </Card>
  );
}

