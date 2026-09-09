import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Ruler,
  Search,
  Download,
  Printer,
  StickyNote,
  ChevronRight,
  ArrowLeft,
  User,
  History,
  Check,
} from "lucide-react";

import api from "@/lib/api";

export const Route = createFileRoute("/measurements")({ component: MeasurementsDirectory });

type Alteration = { date: string; note: string };
type GarmentSet = {
  garment: string;
  updated: string;
  values: Record<string, string>;
  notes?: string;
  alterations?: Alteration[];
};
type CustomerRec = {
  id: string;
  name: string;
  initials: string;
  tint: string;
  orders: number;
  lastOrder: string;
  preferred: string;
  status: "VIP" | "Returning" | "New";
  sets: GarmentSet[];
};

const fields = ["Chest", "Waist", "Hip", "Shoulder", "Sleeve", "Neck", "Length"] as const;

const statusTint: Record<CustomerRec["status"], string> = {
  VIP: "bg-gradient-gold text-navy-deep",
  Returning: "bg-champagne text-navy",
  New: "bg-rose/30 text-terracotta",
};

function MeasurementsDirectory() {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load orders dynamically
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved measurement notes dynamically
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/bookings/tailor');
        const data = res.data || [];
        setOrders(data);
        
        // Extract savedNotes from notes field across orders
        const notesMap: Record<string, string> = {};
        data.forEach((o: any) => {
          if (o.notes) {
            const custName = o.customer?.name || "Customer";
            notesMap[`${custName}_${o.garment || o.dressType}`] = o.notes;
          }
        });
        setSavedNotes(notesMap);
      } catch (err) {
        console.error("Failed to fetch measurements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const saveNote = async (customerId: string, garment: string, text: string) => {
    const newNotes = { ...savedNotes, [`${customerId}_${garment}`]: text };
    setSavedNotes(newNotes);
    // In a real implementation, we would send this to the specific booking endpoint
    // await api.put(`/bookings/${bookingId}/notes`, { notes: text });
  };

  const customers = useMemo(() => {
    const customerMap = new Map<string, any>();
    
    // We process orders from oldest to newest so that the latest measurements overwrite the older ones
    // Orders in our localStorage are typically newest first, so we reverse them for processing
    const sortedOrders = [...orders].reverse();

    sortedOrders.forEach((o) => {
      const custName = o.customer?.name || "Customer";
      
      if (!customerMap.has(custName)) {
        const words = custName.trim().split(" ");
        const initials =
          words.length > 1
            ? (words[0][0] + words[1][0]).toUpperCase()
            : custName.slice(0, 2).toUpperCase();

        customerMap.set(custName, {
          id: custName,
          name: custName,
          initials,
          orders: 0,
          garmentCounts: new Map<string, number>(),
          lastOrderDate: o.due || o.delivery || "Recently",
          garmentsMap: new Map<string, GarmentSet>(),
        });
      }

      const c = customerMap.get(custName);
      c.orders += 1;
      c.lastOrderDate = o.due || o.delivery || c.lastOrderDate;

      const garmentName = o.garment || o.dress || "Custom Order";
      c.garmentCounts.set(garmentName, (c.garmentCounts.get(garmentName) || 0) + 1);

      if (o.measurements && Array.isArray(o.measurements) && o.measurements.length > 0) {
        const values: Record<string, string> = {};
        o.measurements.forEach((m: any) => {
          if (m.label && m.v) {
            values[m.label] = m.v;
          }
        });

        // Get saved notes for this customer and garment
        const noteKey = `${o.customer}_${garmentName}`;
        const savedNote = savedNotes[noteKey] || o.design || "";

        c.garmentsMap.set(garmentName, {
          garment: garmentName,
          updated: o.due || "Recently",
          values,
          notes: savedNote,
          alterations: [],
        });
      }
    });

    return Array.from(customerMap.values()).map((c) => {
      let preferred = "Custom Order";
      let maxCount = 0;
      c.garmentCounts.forEach((count: number, garment: string) => {
        if (count > maxCount) {
          maxCount = count;
          preferred = garment;
        }
      });

      let status: "VIP" | "Returning" | "New" = "New";
      let tint = "bg-gradient-cream text-navy";
      if (c.orders > 5) {
        status = "VIP";
        tint = "bg-gradient-gold text-navy-deep";
      } else if (c.orders > 1) {
        status = "Returning";
        tint = "bg-champagne text-navy";
      } else {
        tint = "bg-gradient-rose text-navy";
      }

      const sets = Array.from(c.garmentsMap.values());
      if (sets.length === 0) {
        // Fallback set if no measurements are recorded yet
        sets.push({
          garment: preferred,
          updated: "No measurements yet",
          values: {},
          notes: savedNotes[`${c.id}_${preferred}`] || "No notes yet.",
          alterations: [],
        });
      } else {
        // Apply saved notes to all sets just in case
        sets.forEach((set: any) => {
          set.notes = savedNotes[`${c.id}_${set.garment}`] || set.notes;
        });
      }

      return {
        id: c.id,
        name: c.name,
        initials: c.initials,
        tint,
        orders: c.orders,
        lastOrder: c.lastOrderDate,
        preferred,
        status,
        sets,
      } as CustomerRec;
    });
  }, [orders, savedNotes]);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.preferred.toLowerCase().includes(q.toLowerCase()),
      ),
    [customers, q],
  );

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  if (selected) return <Detail customer={selected} onBack={() => setSelectedId(null)} onSaveNote={saveNote} />;

  return (
    <PageShell title="Customer Measurements" subtitle="Every customer's saved measurements, ready when you stitch.">
      <Card className="p-4 border-gold/60 shadow-luxe">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customer or garment…"
            className="pl-9 h-10 rounded-full bg-background/60 border-gold/60"
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-cream0 rounded-xl">
            {q ? `No customers match "${q}".` : "No measurement profiles yet. Start taking orders to see them here."}
          </div>
        )}
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="text-left"
          >
            <Card className="p-5 border-gold/60 shadow-luxe hover:shadow-glow hover:border-gold/40 transition group">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl ${c.tint} flex items-center justify-center font-display text-base shadow-luxe`}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg text-navy truncate">{c.name}</p>
                    <Badge className={`rounded-full text-[10px] ${statusTint[c.status]}`}>{c.status}</Badge>
                  </div>
                  <p className="text-[11px] text-mocha mt-0.5">
                    {c.sets.length} measurement {c.sets.length === 1 ? "set" : "sets"} · Last update {c.sets[0].updated}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Prefers <span className="text-navy">{c.preferred}</span> · {c.orders} orders
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-mocha opacity-60 group-hover:opacity-100 group-hover:text-navy transition" />
              </div>
            </Card>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function Detail({ customer, onBack, onSaveNote }: { customer: CustomerRec; onBack: () => void; onSaveNote: (cId: string, g: string, text: string) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const set = customer.sets[activeIdx] || customer.sets[0];
  
  const [notes, setNotes] = useState(set?.notes ?? "");
  const [isSaved, setIsSaved] = useState(false);

  // Sync notes when garment set changes
  useEffect(() => {
    setNotes(set?.notes ?? "");
    setIsSaved(false);
  }, [set]);

  const handleSave = () => {
    onSaveNote(customer.id, set.garment, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <PageShell title={customer.name} subtitle={`Measurement profile · ${customer.orders} lifetime orders`}>
      <div>
        <Button variant="ghost" onClick={onBack} className="rounded-full gap-2 text-mocha hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Button>
      </div>

      <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-soft">
        <div className="flex flex-wrap items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl ${customer.tint} flex items-center justify-center font-display text-lg shadow-luxe`}>
            {customer.initials}
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl text-navy">{customer.name}</h3>
              <Badge className={`rounded-full ${statusTint[customer.status]}`}>{customer.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last order {customer.lastOrder} · Prefers {customer.preferred}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full border-gold/70 gap-2">
              <Download className="h-4 w-4" /> Download sheet
            </Button>
            <Button variant="outline" className="rounded-full border-gold/70 gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Garment selector */}
      <div className="flex gap-2 flex-wrap">
        {customer.sets.map((s, i) => (
          <button
            key={s.garment + i}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
              i === activeIdx
                ? "bg-gradient-navy text-cream border-transparent shadow-navy"
                : "bg-cream text-navy border-gold/60 hover:border-gold/40"
            }`}
          >
            {s.garment}
          </button>
        ))}
      </div>

      {/* Measurements */}
      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">{set.garment}</h3>
          </div>
          <p className="text-[11px] text-mocha">Updated {set.updated}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {fields.map((f) => (
            <div key={f} className="rounded-xl bg-gradient-soft border border-gold/40 p-3 text-center">
              <p className="text-[9px] uppercase tracking-[0.18em] text-mocha/70">{f}</p>
              <p className="text-xl font-display text-navy mt-1">
                {set.values[f] || "—"}
                <span className="text-[9px] text-mocha/60 ml-0.5">in</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tailor notes */}
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">Tailor notes</h3>
          </div>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Add preferences, fabric choices, fitting feedback…"
            className="w-full min-h-[140px] rounded-xl bg-white/60 border border-gold/60 p-3 text-sm text-navy resize-none focus:outline-none focus:border-gold/50"
          />
          <Button onClick={handleSave} className="mt-3 rounded-full bg-gradient-navy text-cream gap-2 min-w-[120px] transition-all">
            {isSaved ? <><Check className="h-4 w-4 text-emerald-400" /> Saved</> : "Save notes"}
          </Button>
        </Card>

        {/* Alteration history */}
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-navy" />
            <h3 className="font-display text-lg text-navy">Alteration history</h3>
          </div>
          <div className="space-y-3">
            {(set.alterations ?? []).map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-soft border border-gold/40">
                <div className="h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <Ruler className="h-4 w-4 text-navy-deep" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-navy">{a.note}</p>
                  <p className="text-[11px] text-mocha/70">{a.date}</p>
                </div>
              </div>
            ))}
            {(set.alterations ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">No alterations recorded for this garment.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5 border-gold/60 shadow-luxe bg-gradient-champagne flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-navy text-cream flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-display text-navy">Auto-synced with bookings</p>
          <p className="text-xs text-mocha">When {customer.name.split(" ")[0]} books a new order, their latest measurements and preferences appear here instantly.</p>
        </div>
      </Card>
    </PageShell>
  );
}
