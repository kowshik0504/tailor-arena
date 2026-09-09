import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Pause, CalendarDays, Clock, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/availability")({ component: AvailabilityPage });

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AvailabilityPage() {
  const [accepting, setAccepting] = useState(true);
  const [paused, setPaused] = useState(false);

  const [days, setDays] = useState<Record<string, boolean>>({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false,
  });
  const [maxOrders, setMaxOrders] = useState(14);
  const [orders, setOrders] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/tailors/profile');
        if (res.data) {
          setPaused(res.data.isPaused || false);
          setAccepting(!res.data.isPaused);
          if (res.data.maxWeeklyOrders) setMaxOrders(res.data.maxWeeklyOrders);
          if (res.data.workingDays) setDays(res.data.workingDays);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await api.get('/bookings/tailor');
        if (res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchOrders();
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

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      await api.put('/tailors/profile', {
        workingDays: days,
        maxWeeklyOrders: maxOrders
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute live statistics based on actual orders
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  let slotsFilled = 0;
  let pendingApproval = 0;
  let inStitching = 0;
  let readyForDelivery = 0;

  orders.forEach(o => {
    if (o.rawDate) {
      const d = new Date(o.rawDate);
      if (d >= startOfWeek) {
        slotsFilled++;
      }
    }
    
    if (o.status === "Pending" || o.status === "pending") pendingApproval++;
    else if (o.status === "In Progress" || o.status === "in-progress") inStitching++;
    else if (o.status === "Ready" || o.status === "ready") readyForDelivery++;
  });

  return (
    <PageShell title="Availability" subtitle="Control when and how many new orders you accept.">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">Booking controls</h3>
          </div>
          <p className="text-xs text-muted-foreground">Toggle whether customers can place new orders right now.</p>

          <div className="mt-5 space-y-3">
            <Toggle icon={<Zap className="h-4 w-4" />} label="Accepting bookings" hint="New orders flow into your queue" checked={accepting} onChange={handleAcceptingChange} />
            <Toggle icon={<Pause className="h-4 w-4" />} label="Pause new orders" hint="Existing orders continue, no new ones" checked={paused} onChange={handlePausedChange} />
          </div>

          <div className="mt-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-mocha/70 mb-3">Working days</p>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays((p) => ({ ...p, [d]: !p[d] }))}
                  className={`h-11 w-14 rounded-xl border text-sm font-medium transition ${
                    days[d] ? "bg-gradient-navy text-cream border-navy shadow-navy" : "bg-white/60 text-mocha border-gold/60"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.22em] text-mocha/70">Weekly order limit</p>
              <Badge className="rounded-full bg-gradient-gold text-navy-deep">{maxOrders} orders</Badge>
            </div>
            <input
              type="range"
              min={4} max={30} value={maxOrders}
              onChange={(e) => setMaxOrders(parseInt(e.target.value))}
              className="w-full mt-3 accent-navy"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Customers can't book once you hit this limit.</p>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-cream">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">This week</h3>
          </div>
          <p className="text-xs text-muted-foreground">Workload snapshot</p>

          <div className="mt-5 rounded-2xl bg-white/60 p-4 border border-gold/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Slots filled</p>
              <span className="text-[11px] text-navy font-medium">{slotsFilled} / {maxOrders}</span>
            </div>
            <div className="h-2 w-full bg-cream rounded-full overflow-hidden">
              <div className="h-full bg-gradient-gold transition-all duration-500" style={{ width: `${Math.min((slotsFilled / maxOrders) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Stat label="Pending approval" value={pendingApproval.toString()} />
            <Stat label="In stitching" value={inStitching.toString()} />
            <Stat label="Ready for delivery" value={readyForDelivery.toString()} />
          </div>

          <Button onClick={saveSchedule} disabled={isSaving} className="w-full mt-5 rounded-xl bg-gradient-navy text-cream h-11 gap-2">
            <Clock className="h-4 w-4" /> {isSaving ? "Saving..." : "Save schedule"}
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}

function Toggle({ icon, label, hint, checked, onChange }: any) {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-gold/40">
      <span className="text-xs text-mocha">{label}</span>
      <span className="font-display text-navy">{value}</span>
    </div>
  );
}






