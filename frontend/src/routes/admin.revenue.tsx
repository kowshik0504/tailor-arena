import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Scissors, Users, TrendingUp, Wallet } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/revenue")({ component: RevenueAnalytics });

const growth = [
  { d: "Jan", tailor: 18, customer: 12 },
  { d: "Feb", tailor: 22, customer: 16 },
  { d: "Mar", tailor: 28, customer: 19 },
  { d: "Apr", tailor: 31, customer: 22 },
  { d: "May", tailor: 35, customer: 27 },
  { d: "Jun", tailor: 42, customer: 32 },
  { d: "Jul", tailor: 48, customer: 36 },
  { d: "Aug", tailor: 54, customer: 41 },
];

const breakdown = [
  { name: "Tailor activation", v: 18, c: "oklch(0.76 0.13 80)" },
  { name: "Tailor subscriptions", v: 28, c: "oklch(0.27 0.09 265)" },
  { name: "Premium tailor features", v: 9, c: "oklch(0.55 0.10 260)" },
  { name: "Customer subscriptions", v: 22, c: "oklch(0.65 0.13 40)" },
  { name: "Premium booking", v: 12, c: "oklch(0.55 0.05 50)" },
  { name: "Service charges", v: 11, c: "oklch(0.86 0.10 85)" },
];

function RevenueAnalytics() {
  return (
    <PageShell title="Revenue Analytics" subtitle="Total platform earnings, broken down by source.">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Big icon={<IndianRupee />} label="Total Platform Revenue" value="₹84.2 L" trend="+24% YoY" gold />
        <Kpi icon={<Scissors />} label="Tailor Revenue" value="₹52.8 L" trend="+18%" />
        <Kpi icon={<Users />} label="Customer Revenue" value="₹31.4 L" trend="+22%" />
        <Kpi icon={<TrendingUp />} label="Monthly Revenue" value="₹11.6 L" trend="+9.4% MoM" />
        <Kpi icon={<Wallet />} label="Yearly Run-rate" value="₹1.4 Cr" trend="Projected" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl text-navy">Revenue growth</h3>
              <p className="text-xs text-muted-foreground">Tailor vs customer earnings · last 8 months (₹ lakh)</p>
            </div>
            <Badge className="rounded-full bg-gold/15 text-navy-deep border border-gold/40">
              <TrendingUp className="h-3 w-3 mr-1" /> +24% YoY
            </Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.27 0.09 265)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.27 0.09 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area name="Tailor" type="monotone" dataKey="tailor" stroke="oklch(0.76 0.13 80)" strokeWidth={2.5} fill="url(#rt)" />
                <Area name="Customer" type="monotone" dataKey="customer" stroke="oklch(0.27 0.09 265)" strokeWidth={2.5} fill="url(#rc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-xl text-navy">Revenue breakdown</h3>
          <p className="text-xs text-muted-foreground">By source · this month</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="v" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {breakdown.map((b) => <Cell key={b.name} fill={b.c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {breakdown.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.c }} />
                <span className="text-navy flex-1">{b.name}</span>
                <span className="text-mocha tabular-nums">{b.v}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Big({ icon, label, value, trend, gold }: any) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${gold ? "bg-gradient-gold text-navy-deep" : "bg-gradient-navy text-cream"}`}>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${gold ? "bg-navy-deep/10 text-navy-deep" : "bg-white/10 text-cream"}`}>{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.22em] mt-3 opacity-75">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      <p className="text-[11px] mt-1 opacity-80">{trend}</p>
    </Card>
  );
}
function Kpi({ icon, label, value, trend }: any) {
  return (
    <Card className="p-5 border-gold/60 shadow-luxe bg-cream">
      <div className="h-9 w-9 rounded-xl bg-gradient-navy text-cream flex items-center justify-center">{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-mocha/70 mt-3">{label}</p>
      <p className="font-display text-2xl text-navy mt-1">{value}</p>
      <p className="text-[11px] text-emerald-700 mt-1">{trend}</p>
    </Card>
  );
}






