import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, IndianRupee, CircleCheck, Clock } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/reports")({ component: Reports });

const monthly = [
  { m: "Jan", r: 28000 }, { m: "Feb", r: 34000 }, { m: "Mar", r: 41000 },
  { m: "Apr", r: 38000 }, { m: "May", r: 48000 }, { m: "Jun", r: 52000 },
];

const popular = [
  { n: "Saree Blouse", o: 28, color: "bg-gradient-rose" },
  { n: "Kurta Set", o: 22, color: "bg-gradient-cream" },
  { n: "Bridal Blouse", o: 14, color: "bg-gradient-gold" },
  { n: "Suit", o: 11, color: "bg-gradient-luxe text-primary-foreground" },
  { n: "Anarkali", o: 8, color: "bg-gradient-soft" },
];

const kpis = [
  { l: "Earnings this month", v: "₹48,200", I: IndianRupee, t: "bg-gradient-gold" },
  { l: "Completed orders", v: "31", I: CircleCheck, t: "bg-gradient-luxe text-primary-foreground" },
  { l: "Pending orders", v: "11", I: Clock, t: "bg-gradient-rose" },
  { l: "Top category", v: "Saree Blouse", I: TrendingUp, t: "bg-gradient-cream" },
];

function Reports() {
  return (
    <PageShell title="Reports" subtitle="A simple snapshot of your tailoring business.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.l} className={`p-5 border-0 shadow-luxe ${k.t}`}>
            <k.I className="h-5 w-5 opacity-80" />
            <p className="text-[10px] uppercase tracking-wider mt-4 opacity-75">{k.l}</p>
            <p className="font-display text-2xl mt-1">{k.v}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display text-xl">Earnings summary</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="outline" className="rounded-full border-gold/70 gap-1">
              <TrendingUp className="h-3 w-3" />+22%
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.10 80)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.10 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 65)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.5 0.025 50)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.025 50)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.015 65)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="r" stroke="oklch(0.68 0.10 60)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-xl mb-1">Popular designs</h3>
          <p className="text-xs text-muted-foreground mb-4">Orders this season</p>
          <div className="space-y-3">
            {popular.map((p) => {
              const max = Math.max(...popular.map((x) => x.o));
              return (
                <div key={p.n} className="flex items-center gap-3">
                  <span className="text-xs w-24 truncate">{p.n}</span>
                  <div className="flex-1 h-7 rounded-full bg-secondary/60 relative overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.o / max) * 100}%` }} />
                  </div>
                  <span className="text-sm font-display w-8 text-right">{p.o}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}






