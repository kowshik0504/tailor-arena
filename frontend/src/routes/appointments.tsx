import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon,
  Ruler, Scissors, PackageCheck, Sparkles, Coffee, Clock,
} from "lucide-react";

export const Route = createFileRoute("/appointments")({ component: Appointments });

type Appt = {
  time: string;
  customer: string;
  service: string;
  garment: string;
  status: "Confirmed" | "Pending" | "Completed";
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
};

const today: Appt[] = [];
const tomorrow: Appt[] = [];

const workQueue = [
  { label: "Pending Measurements", count: 0, icon: Ruler, tint: "bg-gradient-rose" },
  { label: "Under Stitching", count: 0, icon: Scissors, tint: "bg-gradient-gold" },
  { label: "Upcoming Deliveries", count: 0, icon: PackageCheck, tint: "bg-gradient-cream" },
  { label: "Consultations", count: 0, icon: Sparkles, tint: "bg-gradient-luxe text-primary-foreground" },
];

const month = Array.from({ length: 35 }, (_, i) => i - 3);
const busyDays: number[] = [];
const trialDays: number[] = [];
const deliveryDays: number[] = [];
const leaveDays: number[] = [];

function Appointments() {
  return (
    <PageShell title="Schedule" subtitle="Your atelier diary — appointments, fittings, and daily work queue.">
      {/* Daily Work Queue */}
      <div className="grid md:grid-cols-4 gap-4">
        {workQueue.map((c) => (
          <Card key={c.label} className={`p-5 border-0 shadow-luxe ${c.tint}`}>
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 opacity-80" />
              <Badge variant="outline" className="rounded-full text-[9px] bg-background/40 border-0">Today</Badge>
            </div>
            <p className="font-display text-3xl mt-3">{c.count}</p>
            <p className="text-xs mt-1 opacity-80">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Calendar — schedule overview */}
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <CalIcon className="h-5 w-5 text-mocha" />
              <h3 className="font-display text-xl text-navy">May 2026</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="rounded-full"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {month.map((d, i) => {
              const isToday = d === 25;
              const inMonth = d > 0 && d <= 31;
              const busy = busyDays.includes(d);
              const trial = trialDays.includes(d);
              const delivery = deliveryDays.includes(d);
              const leave = leaveDays.includes(d);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition
                    ${isToday ? "bg-gradient-luxe text-primary-foreground shadow-luxe" :
                      leave ? "bg-terracotta/15 text-terracotta" :
                      busy ? "bg-champagne/70 text-navy" :
                      inMonth ? "hover:bg-secondary/60 text-navy" : "text-muted-foreground/40"}`}
                >
                  {inMonth ? d : ""}
                  <div className="flex gap-0.5 mt-0.5">
                    {trial && <span className="h-1 w-1 rounded-full bg-gold" />}
                    {delivery && <span className="h-1 w-1 rounded-full bg-terracotta" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-5 text-[10px] uppercase tracking-wider text-mocha/70">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-champagne" />Busy</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" />Trial fitting</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-terracotta" />Delivery</span>
            <span className="flex items-center gap-1.5"><Coffee className="h-3 w-3 text-terracotta" />Leave day</span>
          </div>
        </Card>

        {/* Today's appointments */}
        <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-navy">Today's appointments</h3>
              <p className="text-xs text-muted-foreground">Monday, 25 May · Studio A</p>
            </div>
            <Badge className="rounded-full bg-gradient-gold text-navy-deep">{today.length}</Badge>
          </div>
          <div className="mt-5 space-y-2 max-h-[420px] overflow-auto pr-2">
            {today.length === 0 ? (
              <div className="h-32 rounded-2xl bg-white/50 border border-gold/20 flex flex-col items-center justify-center text-mocha/60">
                <Coffee className="h-6 w-6 mb-2 opacity-50" />
                <p className="text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              today.map((a) => (
                <div key={a.time} className="flex items-stretch gap-3">
                  <div className="w-14 flex flex-col items-center justify-center text-xs">
                    <span className="font-display text-base text-navy">{a.time}</span>
                  </div>
                  <div className={`flex-1 rounded-xl p-3 shadow-luxe ${a.tint}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{a.customer}</p>
                        <p className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5">
                          <a.icon className="h-3 w-3" /> {a.service}
                        </p>
                        <p className="text-[11px] opacity-70 mt-0.5">{a.garment}</p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[9px] bg-background/40 border-0 shrink-0">{a.status}</Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Tomorrow's appointments */}
      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">Tomorrow's appointments</h3>
          </div>
          <Badge variant="outline" className="rounded-full border-gold/60 text-[10px]">{tomorrow.length} scheduled</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Service</th>
                <th className="text-left px-4 py-3 font-medium">Garment</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tomorrow.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-mocha/60">
                    No appointments scheduled for tomorrow
                  </td>
                </tr>
              ) : (
                tomorrow.map((a) => (
                  <tr key={a.time} className="border-t border-gold/40 hover:bg-secondary/40 transition">
                    <td className="px-4 py-3 font-display text-navy">{a.time}</td>
                    <td className="px-4 py-3 font-medium">{a.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                      <a.icon className="h-3.5 w-3.5" /> {a.service}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.garment}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="rounded-full text-[10px] border-gold/70">{a.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}






