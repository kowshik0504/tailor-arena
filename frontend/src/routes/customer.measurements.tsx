import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, Plus, Pencil, Trash2, Share2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/customer/measurements")({ component: Measurements });

const garmentGroups = [
  { group: "Women", items: ["Blouse", "Lehenga", "Chudidhar", "Saree Blouse", "Bridal Blouse", "Gown"] },
  { group: "Men", items: ["Shirt", "Pant", "Suit", "Kurta"] },
  { group: "Kids", items: ["Kids Shirt", "Kids Dress", "Kids Traditional Wear"] },
];

const fields = ["Chest", "Waist", "Hip", "Shoulder", "Sleeve", "Neck", "Length"] as const;

type Saved = { id: string; garment: string; updated: string; values: Record<string, string> };

const initial: Saved[] = [
  { id: "m1", garment: "Saree Blouse", updated: "Mar 12, 2026", values: { Chest: "34", Waist: "28", Hip: "36", Shoulder: "14", Sleeve: "10", Neck: "13", Length: "15" } },
  { id: "m2", garment: "Lehenga", updated: "Feb 28, 2026", values: { Chest: "34", Waist: "29", Hip: "37", Shoulder: "14", Sleeve: "0", Neck: "0", Length: "40" } },
  { id: "m3", garment: "Kurta", updated: "Jan 18, 2026", values: { Chest: "38", Waist: "34", Hip: "39", Shoulder: "16", Sleeve: "22", Neck: "15", Length: "42" } },
];

function Measurements() {
  const [list, setList] = useState<Saved[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [garment, setGarment] = useState("Blouse");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const startAdd = () => {
    setAdding(true); setEditing(null); setDraft({});
  };
  const save = () => {
    if (adding) {
      setList((l) => [...l, { id: `m${Date.now()}`, garment, updated: "Just now", values: { ...draft } }]);
      setAdding(false);
    } else if (editing) {
      setList((l) => l.map((m) => m.id === editing ? { ...m, values: { ...draft }, updated: "Just now" } : m));
      setEditing(null);
    }
    setDraft({});
  };

  return (
    <PageShell title="My Measurements" subtitle="Save once, share with every tailor on Tailor Arena.">
      {/* Privacy banner */}
      <Card className="p-5 border-gold/60 shadow-luxe bg-gradient-champagne flex items-start gap-4">
        <div className="h-11 w-11 rounded-2xl bg-gradient-navy text-navy flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-display text-navy text-lg">Your measurements, your control</p>
          <p className="text-xs text-mocha mt-1">Tailors only see them when you book or explicitly share. Skip re-taking measurements every time.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full border-navy/20 text-navy gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-mocha/70">Saved profiles</p>
          <h3 className="font-display text-2xl text-navy">{list.length} measurement sets</h3>
        </div>
        <Button onClick={startAdd} className="rounded-xl bg-gradient-navy text-navy gap-2">
          <Plus className="h-4 w-4" /> Add measurement
        </Button>
      </div>

      {/* Add / Edit form */}
      {(adding || editing) && (
        <Card className="p-6 border-gold/40 shadow-glow bg-cream">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg text-navy">
              {adding ? "New measurement set" : `Edit ${list.find((m) => m.id === editing)?.garment}`}
            </p>
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setEditing(null); setDraft({}); }} className="rounded-full text-mocha">Cancel</Button>
          </div>
          {adding && (
            <div className="mb-4">
              <label className="text-[11px] uppercase tracking-[0.18em] text-mocha/70">Garment</label>
              <select
                value={garment}
                onChange={(e) => setGarment(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl bg-white/60 border border-gold/60 px-3 text-sm text-navy"
              >
                {garmentGroups.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((it) => <option key={it} value={it}>{it}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fields.map((f) => (
              <div key={f}>
                <label className="text-[11px] uppercase tracking-[0.18em] text-mocha/70">{f} (in)</label>
                <Input
                  value={draft[f] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
                  placeholder="0"
                  className="mt-1 h-10 rounded-xl bg-white/60 border-gold/60"
                />
              </div>
            ))}
          </div>
          <Button onClick={save} className="mt-5 rounded-xl bg-gradient-gold text-navy-deep shadow-glow">Save measurements</Button>
        </Card>
      )}

      {/* List */}
      <div className="grid md:grid-cols-2 gap-5">
        {list.map((m) => (
          <Card key={m.id} className="p-5 border-gold/60 shadow-luxe">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-gold text-navy-deep flex items-center justify-center">
                  <Ruler className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-lg text-navy">{m.garment}</p>
                  <p className="text-[11px] text-mocha/70">Updated {m.updated}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditing(m.id); setAdding(false); setDraft({ ...m.values }); }}
                  title="Edit"
                  className="h-8 w-8 rounded-lg border border-gold/60 text-navy hover:bg-champagne/50 flex items-center justify-center"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setList((l) => l.filter((x) => x.id !== m.id))}
                  title="Delete"
                  className="h-8 w-8 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {fields.map((f) => (
                <div key={f} className="rounded-lg bg-gradient-soft border border-gold/40 p-2 text-center">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-mocha/60">{f}</p>
                  <p className="text-sm font-display text-navy mt-0.5">{m.values[f] || "—"}<span className="text-[9px] text-mocha/60 ml-0.5">in</span></p>
                </div>
              ))}
            </div>
            <Badge variant="outline" className="rounded-full text-[10px] mt-4 border-gold/40 text-navy bg-gold/10">
              Auto-shared on booking
            </Badge>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}






