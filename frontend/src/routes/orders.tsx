import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus, Clock, MoreHorizontal, Send, Image as ImageIcon, User, Ruler, Sparkles,
} from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/orders")({ component: Orders });

type Status = "Pending" | "Changes Requested" | "Accepted" | "Rejected" | "In Stitching" | "Completed";

type ChatMsg = {
  from: "tailor" | "customer";
  text?: string;
  image?: string;
  time: string;
};

type Order = {
  id: string;
  customer: string;
  phone: string;
  garment: string;
  design: string;
  designImg: string;
  due: string;
  priority: "Normal" | "High" | "VIP";
  status: Status;
  measurements: { label: string; v: string }[];
  chat: ChatMsg[];
};


const columnsDef: { id: Status; title: string; color: string }[] = [
  { id: "Pending", title: "Pending", color: "bg-gradient-cream" },
  { id: "Changes Requested", title: "Changes Req", color: "bg-amber-100 text-amber-900" },
  { id: "Accepted", title: "Accepted", color: "bg-sky-100 text-sky-900" },
  { id: "In Stitching", title: "In Stitching", color: "bg-gradient-gold" },
  { id: "Completed", title: "Completed", color: "bg-emerald-100 text-emerald-900" },
];

const priorityTint: Record<string, string> = {
  Normal: "bg-secondary text-secondary-foreground",
  High: "bg-terracotta/15 text-terracotta",
  VIP: "bg-gradient-gold text-primary",
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"All" | "VIP" | "Bridal" | "Menswear">("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/tailor');
      const mapped: Order[] = data.map((b: any) => {
        let status: Status = "Pending";
        if (b.status === "confirmed" || b.status === "acknowledged") status = "Accepted";
        else if (b.status === "cancelled") status = "Rejected";
        else if (b.status === "hold") status = "Changes Requested";
        else if (b.status === "in-progress") status = "In Stitching";
        else if (b.status === "completed") status = "Completed";

        return {
          id: b._id,
          customer: b.customer?.name || "Unknown",
          phone: b.customer?.phone || "Not provided",
          garment: b.dressType || "Garment",
          design: b.notes || "",
          designImg: b.designImg || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
          due: new Date(b.date).toLocaleDateString(),
          priority: b.priority || "Normal",
          status,
          measurements: b.measurements || [],
          chat: b.chat || []
        };
      });
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (id: string, s: Status) => {
    // We would normally fire an api call here. For now update state.
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: s } : o)));
  };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ customer: "", garment: "", due: "", design: "" });
  const [dragId, setDragId] = useState<string | null>(null);

  const active = orders.find((o) => o.id === activeId) || null;

  const moveTo = async (id: string, status: Status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      let endpoint = '';
      if (status === 'Accepted') endpoint = `/bookings/${id}/accept`;
      else if (status === 'Rejected') endpoint = `/bookings/${id}/reject`;
      else if (status === 'Changes Requested') endpoint = `/bookings/${id}/hold`;
      else if (status === 'In Stitching') endpoint = `/bookings/${id}/start-work`;
      else if (status === 'Completed') endpoint = `/bookings/${id}/complete`;
      
      if (endpoint && !id.startsWith('TA-')) {
        await api.put(endpoint);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      fetchOrders(); // Revert on failure
    }
  };

  const createOrder = () => {
    if (!draft.customer || !draft.garment) return;
    const n = orders.length + 2050;
    const id = `TA-${n}`;
    const newOrder: Order = {
      id,
      customer: draft.customer,
      phone: "—",
      garment: draft.garment,
      design: draft.design || "—",
      designImg: "linear-gradient(135deg, oklch(0.88 0.06 35), oklch(0.78 0.10 50))",
      due: draft.due || "TBD",
      priority: "Normal",
      status: "Pending",
      measurements: [],
      chat: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    setDraft({ customer: "", garment: "", due: "", design: "" });
    setCreateOpen(false);
  };

  const sendMessage = (id: string, msg: ChatMsg) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, chat: [...o.chat, msg] } : o)));

  return (
    <PageShell title="Orders" subtitle="A simple flow from request to delivery.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {["All", "VIP", "Bridal", "Menswear"].map((t, i) => (
            <Badge key={t} variant={i === 0 ? "default" : "outline"} className="rounded-full px-4 py-1.5 cursor-pointer">
              {t}
            </Badge>
          ))}
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2">
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {columnsDef.map((col) => {
          const priorityWeight: Record<string, number> = { VIP: 3, High: 2, Normal: 1 };
          const items = orders
            .filter((o) => o.status === col.id)
            .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
          return (
            <div
              key={col.id}
              className="space-y-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveTo(dragId, col.id);
                setDragId(null);
              }}
            >
              <div className={`rounded-2xl p-4 ${col.color} shadow-luxe`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{col.title}</h3>
                  <span className="text-xs opacity-80 bg-background/40 rounded-full px-2 py-0.5">{items.length}</span>
                </div>
              </div>
              {items.map((item) => (
                <Card
                  key={item.id}
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onClick={() => navigate({ to: `/order/${item.id}` })}
                  className="p-4 border-gold/60 shadow-luxe hover:shadow-glow hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between">
                    <Badge className={`rounded-full text-[10px] uppercase tracking-wider ${priorityTint[item.priority]}`}>
                      {item.priority}
                    </Badge>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-display text-base mt-3">{item.garment}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.customer} · {item.id}</p>
                  <div className="mt-4 pt-3 border-t border-gold/50 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-mocha"><Clock className="h-3 w-3" />{item.due}</span>
                    {item.chat.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{item.chat.length} msg</span>
                    )}
                  </div>
                </Card>
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-gold/50 py-8 text-center text-xs text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Tip — drag a card across columns to update its status. Tap a card to open chat with the customer.
      </p>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Customer name" value={draft.customer}
              onChange={(e) => setDraft({ ...draft, customer: e.target.value })} />
            <Input placeholder="Garment (e.g. Bridal Blouse)" value={draft.garment}
              onChange={(e) => setDraft({ ...draft, garment: e.target.value })} />
            <Input placeholder="Design notes (optional)" value={draft.design}
              onChange={(e) => setDraft({ ...draft, design: e.target.value })} />
            <Input placeholder="Due date (e.g. Mar 22)" value={draft.due}
              onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90" onClick={createOrder}>
              Add to New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail sheet */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActiveId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-hidden">
          {active && (
            <OrderDetail
              order={active}
              onSend={(m) => sendMessage(active.id, m)}
              onStatus={(s) => moveTo(active.id, s)}
            />
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

function OrderDetail({
  order, onSend, onStatus,
}: {
  order: Order;
  onSend: (m: ChatMsg) => void;
  onStatus: (s: Status) => void;
}) {
  const [tab, setTab] = useState<"details" | "chat">("details");
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") scrollRef.current?.scrollTo({ top: 9999 });
  }, [tab, order.chat.length]);

  const send = () => {
    if (!text.trim()) return;
    onSend({ from: "tailor", text: text.trim(), time: "Now" });
    setText("");
  };

  const sendImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onSend({ from: "tailor", image: reader.result as string, time: "Now" });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b border-gold/60 bg-gradient-cream">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle className="font-display text-2xl">{order.garment}</SheetTitle>
            <p className="text-xs text-muted-foreground mt-1">{order.id} · {order.customer}</p>
          </div>
          <Badge className={`rounded-full ${priorityTint[order.priority]}`}>{order.priority}</Badge>
        </div>
        <div className="flex gap-1 mt-3 bg-background/70 rounded-full p-1 w-fit">
          <button onClick={() => setTab("details")}
            className={`px-4 py-1.5 text-xs rounded-full transition ${tab === "details" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
            Details
          </button>
          <button onClick={() => setTab("chat")}
            className={`px-4 py-1.5 text-xs rounded-full transition flex items-center gap-1.5 ${tab === "chat" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
            Chat {order.chat.length > 0 && <span className="text-[10px] opacity-70">· {order.chat.length}</span>}
          </button>
        </div>
      </SheetHeader>

      {tab === "details" ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {(["Pending", "Changes Requested", "Accepted", "Rejected", "In Stitching", "Completed"] as Status[]).map((s) => (
              <button key={s} onClick={() => onStatus(s)}
                className={`text-xs py-2 rounded-xl border transition ${
                  order.status === s
                    ? "bg-foreground text-background border-foreground"
                    : "border-gold/60 hover:bg-secondary/60"
                }`}>
                {s}
              </button>
            ))}
          </div>

          <Card className="p-4 border-gold/60 shadow-luxe">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-mocha" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer</p>
            </div>
            <p className="font-medium">{order.customer}</p>
            <p className="text-xs text-muted-foreground">{order.phone}</p>
          </Card>

          <Card className="p-4 border-gold/60 shadow-luxe">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-mocha" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Design reference</p>
            </div>
            <div className="rounded-xl h-32 shadow-luxe" style={{ background: order.designImg }} />
            <p className="text-sm mt-3">{order.design}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Due {order.due}</p>
          </Card>

          <Card className="p-4 border-gold/60 shadow-luxe">
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="h-4 w-4 text-mocha" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Measurements</p>
            </div>
            {order.measurements.length ? (
              <div className="grid grid-cols-2 gap-2">
                {order.measurements.map((m) => (
                  <div key={m.label} className="flex justify-between bg-secondary/50 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className="text-sm font-display">{m.v}″</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No measurements saved yet.</p>
            )}
          </Card>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-soft">
            {order.chat.length === 0 && (
              <div className="text-center text-xs text-muted-foreground mt-10">
                No messages yet. Say hello to your customer ✨
              </div>
            )}
            {order.chat.map((m, i) => {
              const mine = m.from === "tailor";
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-luxe ${
                    mine
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-background border border-gold/60 rounded-bl-sm"
                  }`}>
                    {m.image && (
                      <img src={m.image} alt="" className="rounded-lg mb-1 max-h-48 object-cover" />
                    )}
                    {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                    <p className={`text-[10px] mt-0.5 ${mine ? "opacity-60" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gold/60 p-3 bg-background">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="h-10 w-10 rounded-full bg-secondary/70 flex items-center justify-center hover:bg-accent transition"
                aria-label="Attach image"
              >
                <ImageIcon className="h-4 w-4 text-mocha" />
              </button>
              <input
                ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) sendImage(f);
                  e.target.value = "";
                }}
              />
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                className="rounded-full bg-secondary/40 border-gold/60"
              />
              <Button onClick={send} size="icon" className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}






