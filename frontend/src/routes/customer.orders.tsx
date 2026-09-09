import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scissors, CircleCheck, Clock, CircleX, Ruler, Sparkles, Truck, MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/customer/orders")({ component: MyBookings });

type Status =
  | "Pending" | "Pending Approval" | "Accepted" | "Rejected" | "Changes Requested" | "Measurements Collected" | "Stitching Started"
  | "Trial Fitting" | "Ready for Pickup" | "Completed" | "Cancelled";

const stages: Status[] = [
  "Pending Approval", "Accepted", "Measurements Collected",
  "Stitching Started", "Trial Fitting", "Ready for Pickup", "Completed",
];

type Booking = {
  id: string; tailor: string; service: string; garment: string;
  bookedOn: string; delivery: string; status: Status;
};



const tabs = ["Upcoming", "Current", "Completed", "Cancelled"] as const;
type Tab = typeof tabs[number];

const filterFor: Record<Tab, (s: Status) => boolean> = {
  Upcoming: (s) => s === "Pending Approval" || s === "Pending" || s === "Changes Requested" || s === "Accepted",
  Current: (s) => ["Measurements Collected", "Stitching Started", "Trial Fitting", "Ready for Pickup"].includes(s),
  Completed: (s) => s === "Completed",
  Cancelled: (s) => s === "Cancelled" || s === "Rejected",
};

const statusTint: Record<Status, string> = {
  "Pending Approval": "bg-amber-100 text-amber-800",
  "Pending": "bg-amber-100 text-amber-800",
  "Changes Requested": "bg-amber-100 text-amber-800",
  "Accepted": "bg-sky-100 text-sky-800",
  "Rejected": "bg-rose-100 text-rose-800",
  "Measurements Collected": "bg-violet-100 text-violet-800",
  "Stitching Started": "bg-navy/10 text-navy",
  "Trial Fitting": "bg-gradient-gold text-navy-deep",
  "Ready for Pickup": "bg-emerald-100 text-emerald-800",
  "Completed": "bg-emerald-600/15 text-emerald-800",
  "Cancelled": "bg-rose-100 text-rose-700",
};

function MyBookings() {
  const [tab, setTab] = useState<Tab>("Upcoming");
  
  // Load new bookings from local storage
  const [allBookings, setAllBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem("new_bookings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("new_bookings");
        if (saved) {
          setAllBookings(JSON.parse(saved));
        }
      } catch (e) {}
    };
    handleStorage(); // Run on mount
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filtered = allBookings.filter((b) => filterFor[tab](b.status));

  return (
    <PageShell title="My Bookings" subtitle="Every stitch, from order to doorstep.">
      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Clock className="h-4 w-4" />} label="Upcoming" value={allBookings.filter((b) => filterFor.Upcoming(b.status)).length} tint="bg-gradient-cream text-navy" />
        <Stat icon={<Scissors className="h-4 w-4" />} label="In progress" value={allBookings.filter((b) => filterFor.Current(b.status)).length} tint="bg-gradient-champagne text-navy" />
        <Stat icon={<CircleCheck className="h-4 w-4" />} label="Completed" value={allBookings.filter((b) => b.status === "Completed").length} tint="bg-gradient-rose text-navy" />
        <Stat icon={<CircleX className="h-4 w-4" />} label="Cancelled" value={allBookings.filter((b) => b.status === "Cancelled").length} tint="bg-gradient-navy text-cream" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${
              tab === t
                ? "bg-gradient-navy text-cream border-navy shadow-navy"
                : "bg-cream text-navy border-gold/60 hover:border-gold/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center border-gold/60 shadow-luxe">
          <p className="text-sm text-muted-foreground">No bookings in this list yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <Link key={b.id} to={`/customer/order/${b.id}` as any} className="block">
              <Card className="p-5 border-gold/60 shadow-luxe hover:shadow-glow hover:-translate-y-0.5 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-navy text-cream flex items-center justify-center font-display text-xs">
                    {b.id.slice(-3)}
                  </div>
                  <div>
                    <p className="font-display text-lg text-navy">{b.garment}</p>
                    <p className="text-xs text-mocha/70">{b.tailor} · {b.service}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Booked {b.bookedOn} · Delivery {b.delivery}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`rounded-full text-[10px] ${statusTint[b.status]}`}>{b.status}</Badge>
                  <Button size="sm" variant="outline" className="rounded-full h-8 border-navy/20 text-navy gap-1 text-xs">
                    <MessageCircle className="h-3 w-3" /> Chat tailor
                  </Button>
                </div>
              </div>

              {b.status !== "Cancelled" && (
                <ProgressTracker status={b.status} />
              )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function ProgressTracker({ status }: { status: Status }) {
  const currentIdx = stages.indexOf(status);
  const icons = [Clock, CircleCheck, Ruler, Scissors, Sparkles, Truck, CircleCheck];

  return (
    <div className="mt-5 pt-5 border-t border-gold/40">
      <div className="grid grid-cols-7 gap-1">
        {stages.map((s, i) => {
          const done = i <= currentIdx;
          const Icon = icons[i];
          return (
            <div key={s} className="flex flex-col items-center text-center">
              <div className="w-full flex items-center">
                <div className={`flex-1 h-0.5 ${i === 0 ? "invisible" : done ? "bg-gold" : "bg-border"}`} />
                <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition ${
                  done ? "bg-gradient-gold text-navy-deep shadow-glow" : "bg-cream border border-border text-mocha/50"
                }`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className={`flex-1 h-0.5 ${i === stages.length - 1 ? "invisible" : i < currentIdx ? "bg-gold" : "bg-border"}`} />
              </div>
              <p className={`text-[9px] mt-1.5 leading-tight ${done ? "text-navy font-medium" : "text-muted-foreground"}`}>
                {s}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: string }) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint}`}>
      {icon}
      <p className="text-[10px] uppercase tracking-[0.22em] mt-3 opacity-70">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </Card>
  );
}






