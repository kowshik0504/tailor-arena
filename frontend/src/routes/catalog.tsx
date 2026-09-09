import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, Bookmark, Plus, MoreVertical, Edit, Trash2, Copy, EyeOff, Star, Flame,
  Search, ImagePlus, TrendingUp, Eye, BookmarkCheck, IndianRupee, Sparkles,
  Calendar, Award, MessageCircle, CircleCheck, CircleX, Send, Filter, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/catalog")({ component: Catalog });

const CATEGORIES = [
  "Bridal Blouse", "Saree Blouse", "Lehenga", "Chudidhar", "Gown", "Kurti",
  "Men's Shirt", "Men's Suit", "Sherwani", "Kids Wear", "Alterations", "Custom Designs",
];

type Design = {
  id: string;
  name: string;
  category: string;
  price: number;
  delivery: number;
  orders: number;
  rating: number;
  saves: number;
  views: number;
  description: string;
  fabric: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  notes: string;
  featured: boolean;
  trending: boolean;
  hidden: boolean;
  gradient: string;
  height: string;
  image?: string;
};

const GRADIENTS = ["bg-gradient-cream", "bg-gradient-rose", "bg-gradient-luxe", "bg-gradient-gold", "bg-gradient-soft", "bg-gradient-navy"];
const HEIGHTS = ["h-64", "h-72", "h-80", "h-96"];

const seed: Design[] = [];
const requests: any[] = [];
const initialCompleted: any[] = [];

import api from "@/lib/api";

function Catalog() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/tailors/profile');
        if (res.data?.designs) {
          setDesigns(res.data.designs);
        }
      } catch (err) {
        console.error("Failed to fetch designs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [completed, setCompleted] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('tailor_completed');
      if (cached) return JSON.parse(cached);
    }
    return initialCompleted;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tailor_completed', JSON.stringify(completed));
    }
  }, [completed]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [sort, setSort] = useState("popular");
  const [openUpload, setOpenUpload] = useState(false);
  const [openAddCompleted, setOpenAddCompleted] = useState(false);
  const [editing, setEditing] = useState<Design | null>(null);
  const [detail, setDetail] = useState<Design | null>(null);

  const filtered = useMemo(() => {
    let arr = designs.filter((d) => !d.hidden);
    if (search) arr = arr.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== "All") arr = arr.filter((d) => d.category === catFilter);
    if (sort === "popular") arr = [...arr].sort((a, b) => b.saves - a.saves);
    if (sort === "ordered") arr = [...arr].sort((a, b) => b.orders - a.orders);
    if (sort === "recent") arr = [...arr].reverse();
    if (sort === "trending") arr = arr.filter((d) => d.trending);
    if (sort === "rated") arr = [...arr].sort((a, b) => b.rating - a.rating);
    return arr;
  }, [designs, search, catFilter, sort]);

  const stats = useMemo(() => {
    const totalViews = designs.reduce((s, d) => s + d.views, 0);
    const totalSaves = designs.reduce((s, d) => s + d.saves, 0);
    const totalOrders = designs.reduce((s, d) => s + d.orders, 0);
    const mostViewed = [...designs].sort((a, b) => b.views - a.views)[0];
    const mostSaved = [...designs].sort((a, b) => b.saves - a.saves)[0];
    const mostOrdered = [...designs].sort((a, b) => b.orders - a.orders)[0];
    const trending = designs.find((d) => d.trending);
    const topRev = [...designs].sort((a, b) => b.price * b.orders - a.price * a.orders)[0];
    const conv = totalViews ? ((totalOrders / totalViews) * 100).toFixed(1) : "0";
    return { totalViews, totalSaves, totalOrders, mostViewed, mostSaved, mostOrdered, trending, topRev, conv };
  }, [designs]);

  const upsert = async (d: Design) => {
    let updated: Design[] = [];
    setDesigns((arr) => {
      const i = arr.findIndex((x) => x.id === d.id);
      if (i >= 0) { 
        const c = [...arr]; c[i] = d; 
        updated = c;
        return c; 
      }
      updated = [d, ...arr];
      return updated;
    });
    // Fire and forget update
    if (updated.length > 0) api.put('/tailors/profile', { designs: updated });
  };

  const remove = async (id: string) => {
    let updated: Design[] = [];
    setDesigns((a) => {
      updated = a.filter((d) => d.id !== id);
      return updated;
    });
    api.put('/tailors/profile', { designs: updated });
  };

  const duplicate = (d: Design) => upsert({ ...d, id: `d${Date.now()}`, name: `${d.name} (Copy)`, orders: 0, saves: 0, views: 0 });
  
  const toggle = async (id: string, key: keyof Design) => {
    let updated: Design[] = [];
    setDesigns((a) => {
      updated = a.map((d) => d.id === id ? { ...d, [key]: !d[key] } : d);
      return updated;
    });
    api.put('/tailors/profile', { designs: updated });
  };

  return (
    <PageShell title="Design Catalog" subtitle="Your portfolio · upload, manage, and convert designs into bookings.">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-navy/70 font-semibold">Atelier portfolio</p>
          <h3 className="font-display text-2xl text-navy">{designs.length} designs · {stats.totalOrders} orders</h3>
        </div>
        <Button onClick={() => { setEditing(null); setOpenUpload(true); }} className="rounded-full bg-gradient-navy text-cream gap-2 px-5 h-10 shadow-luxe">
          <Plus className="h-4 w-4" /> Upload New Design
        </Button>
      </div>

      <Tabs defaultValue="designs" className="space-y-5">
        <TabsList className="bg-white/30 backdrop-blur-md border border-white/50 shadow-sm rounded-full p-1 h-auto relative z-10">
          <TabsTrigger value="designs" className="group rounded-full data-[state=active]:bg-navy/90 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-md data-[state=active]:text-cream px-4 transition-all">Designs</TabsTrigger>
          <TabsTrigger value="requests" className="group rounded-full data-[state=active]:bg-navy/90 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-md data-[state=active]:text-cream px-4 transition-all">Requests <Badge className="ml-2 bg-navy/10 text-navy group-data-[state=active]:bg-white/20 group-data-[state=active]:text-cream h-4 px-1.5 text-[10px] backdrop-blur-sm border-0">{requests.length}</Badge></TabsTrigger>
          <TabsTrigger value="completed" className="group rounded-full data-[state=active]:bg-navy/90 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-md data-[state=active]:text-cream px-4 transition-all">Completed Works</TabsTrigger>
          <TabsTrigger value="analytics" className="group rounded-full data-[state=active]:bg-navy/90 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-md data-[state=active]:text-cream px-4 transition-all">Analytics</TabsTrigger>
        </TabsList>

        {/* DESIGNS */}
        <TabsContent value="designs" className="space-y-5">
          <Card className="p-4 border-gold/60 shadow-luxe space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search designs…" className="pl-9 rounded-full bg-white/60 border-gold/60" />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44 rounded-full bg-white/60 border-gold/60"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="ordered">Most Ordered</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="rated">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["All", ...CATEGORIES].map((c) => (
                <Badge
                  key={c}
                  onClick={() => setCatFilter(c)}
                  variant={catFilter === c ? "default" : "outline"}
                  className={`rounded-full px-4 py-1.5 text-[11px] cursor-pointer whitespace-nowrap ${catFilter === c ? "bg-foreground text-background" : "border-gold/70 hover:bg-secondary"}`}
                >
                  {c}
                </Badge>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((d) => (
              <Card key={d.id} className="overflow-hidden border-gold/60 shadow-luxe group flex flex-col">
                <button onClick={() => setDetail(d)} className={`relative ${d.gradient} h-80 text-left bg-cover bg-center`} style={d.image ? { backgroundImage: `url(${d.image})` } : {}}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    {d.featured && <Badge className="bg-gradient-gold text-navy border-0 text-[10px] gap-1"><Award className="h-3 w-3" />Featured</Badge>}
                    {d.trending && <Badge className="bg-terracotta text-cream border-0 text-[10px] gap-1"><Flame className="h-3 w-3" />Trending</Badge>}
                  </div>
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 rounded-full glass flex items-center justify-center"><MoreVertical className="h-3.5 w-3.5" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => { setEditing(d); setOpenUpload(true); }}><Edit className="h-3.5 w-3.5 mr-2" />Edit Design</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicate(d)}><Copy className="h-3.5 w-3.5 mr-2" />Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggle(d.id, "hidden")}><EyeOff className="h-3.5 w-3.5 mr-2" />Hide Design</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggle(d.id, "featured")}><Award className="h-3.5 w-3.5 mr-2" />{d.featured ? "Unfeature" : "Mark Featured"}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggle(d.id, "trending")}><Flame className="h-3.5 w-3.5 mr-2" />{d.trending ? "Untrend" : "Mark Trending"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => remove(d.id)} className="text-red-600"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-foreground/50 to-transparent text-background">
                    <Badge className="bg-background/30 backdrop-blur text-background border-0 text-[10px] uppercase tracking-wider rounded-full">{d.category}</Badge>
                    <p className="font-display text-base mt-1.5">{d.name}</p>
                  </div>
                </button>
                <div className="p-3 space-y-2 bg-white/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center font-display text-navy text-base"><IndianRupee className="h-3.5 w-3.5" />{d.price.toLocaleString()}</span>
                    <span className="text-mocha flex items-center gap-1"><Calendar className="h-3 w-3" />{d.delivery}d</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-mocha">
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-gold" />{d.orders} ord</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{d.rating}</span>
                    <span className="flex items-center gap-1 justify-end"><Heart className="h-3 w-3" />{d.saves}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card className="p-12 text-center border-gold/60">
              <ImagePlus className="h-10 w-10 text-mocha mx-auto" />
              <p className="font-display text-navy mt-3">No designs match your filters.</p>
            </Card>
          )}
        </TabsContent>

        {/* REQUESTS */}
        <TabsContent value="requests" className="space-y-4">
          <p className="text-sm text-mocha">Customers send fabric photos, Pinterest references, Instagram screenshots & hand-drawn sketches. Review & quote below.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {requests.map((r) => (
              <Card key={r.id} className="overflow-hidden border-gold/60 shadow-luxe">
                <div className={`${r.img} h-44 relative`}>
                  <Badge className="absolute top-3 left-3 bg-white/90 text-navy border-0 text-[10px]">{r.type} reference</Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-navy">{r.customer}</p>
                    <span className="text-[10px] text-mocha">{r.time} ago</span>
                  </div>
                  <p className="text-sm text-mocha">{r.note}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button size="sm" className="rounded-full bg-gradient-navy text-cream gap-1 h-8"><CircleCheck className="h-3.5 w-3.5" />Accept</Button>
                    <Button size="sm" variant="outline" className="rounded-full h-8 gap-1 border-navy/20 text-navy hover:bg-secondary"><IndianRupee className="h-3.5 w-3.5" />Send Quote</Button>
                    <Button size="sm" variant="outline" className="rounded-full h-8 gap-1 border-navy/20 text-navy hover:bg-secondary"><Sparkles className="h-3.5 w-3.5" />Suggest Similar</Button>
                    <Button size="sm" variant="ghost" className="rounded-full h-8 gap-1 text-red-600 hover:bg-red-50"><CircleX className="h-3.5 w-3.5" />Reject</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* COMPLETED WORKS */}
        <TabsContent value="completed" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-mocha">Customer-approved showcase — your public portfolio of finished work.</p>
            <Button onClick={() => setOpenAddCompleted(true)} className="rounded-full bg-navy text-cream shadow-sm hover:bg-navy-deep h-8 text-xs px-4">
              <Plus className="h-3 w-3 mr-1" /> Add Work
            </Button>
          </div>
          {completed.length === 0 ? (
             <Card className="p-12 text-center border-gold/60 bg-white/40">
                <p className="text-mocha">No completed works yet. Add your finished masterpieces here.</p>
             </Card>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
              {completed.map((c) => (
                <Card key={c.id} className={`relative overflow-hidden border-gold/60 shadow-luxe break-inside-avoid ${c.g || 'bg-gradient-gold'} ${c.h || 'h-80'}`}>
                  {c.image && <img src={c.image} className="absolute inset-0 w-full h-full object-cover" alt={c.title} />}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 left-3"><Badge className="bg-white/90 text-navy border-0 text-[10px] shadow-sm">{c.tag}</Badge></div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <p className="font-display text-sm">{c.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Eye className="h-4 w-4" />} label="Total views" value={stats.totalViews.toLocaleString()} />
            <StatCard icon={<BookmarkCheck className="h-4 w-4" />} label="Total saves" value={stats.totalSaves.toLocaleString()} />
            <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Conversion" value={`${stats.conv}%`} />
            <StatCard icon={<Sparkles className="h-4 w-4" />} label="Bookings from designs" value={stats.totalOrders.toLocaleString()} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HighlightCard title="Most Viewed" design={stats.mostViewed} metric={`${stats.mostViewed?.views?.toLocaleString() ?? 0} views`} icon={<Eye className="h-4 w-4" />} />
            <HighlightCard title="Most Saved" design={stats.mostSaved} metric={`${stats.mostSaved?.saves ?? 0} saves`} icon={<Heart className="h-4 w-4" />} />
            <HighlightCard title="Most Ordered" design={stats.mostOrdered} metric={`${stats.mostOrdered?.orders ?? 0} orders`} icon={<Sparkles className="h-4 w-4" />} />
            <HighlightCard title="Trending Now" design={stats.trending ?? designs[0]} metric="Trending up" icon={<TrendingUp className="h-4 w-4" />} />
            <HighlightCard title="Highest Revenue" design={stats.topRev} metric={`₹${((stats.topRev?.price ?? 0) * (stats.topRev?.orders ?? 0)).toLocaleString()}`} icon={<IndianRupee className="h-4 w-4" />} />
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOGS */}
      <AddCompletedDialog 
        open={openAddCompleted} 
        onOpenChange={setOpenAddCompleted} 
        onSave={(newWork) => setCompleted([newWork, ...completed])} 
      />
      <UploadDialog open={openUpload} onOpenChange={setOpenUpload} initial={editing} onSave={upsert} />
      <DetailDialog design={detail} onClose={() => setDetail(null)} onEdit={(d) => { setDetail(null); setEditing(d); setOpenUpload(true); }} />
    </PageShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5 border-gold/60 shadow-luxe bg-white/70">
      <div className="flex items-center gap-2 text-mocha"><span className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-navy-deep">{icon}</span><span className="text-[11px] uppercase tracking-[0.22em]">{label}</span></div>
      <p className="font-display text-3xl text-navy mt-3">{value}</p>
    </Card>
  );
}

function HighlightCard({ title, design, metric, icon }: { title: string; design: Design; metric: string; icon: React.ReactNode }) {
  if (!design) return null;
  return (
    <Card className="overflow-hidden border-gold/60 shadow-luxe">
      <div className={`${design.gradient} h-32 relative`}>
        <div className="absolute top-2 left-2"><Badge className="bg-white/90 text-navy border-0 text-[10px] gap-1">{icon}{title}</Badge></div>
      </div>
      <div className="p-4 bg-white/60">
        <p className="font-display text-navy">{design.name}</p>
        <p className="text-[11px] text-mocha mt-0.5">{design.category}</p>
        <p className="text-sm text-gold-deep mt-2 font-medium">{metric}</p>
      </div>
    </Card>
  );
}

function UploadDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: Design | null; onSave: (d: Design) => void }) {
  const blank: Design = { id: `d${Date.now()}`, name: "", category: CATEGORIES[0], price: 0, delivery: 7, orders: 0, rating: 0, saves: 0, views: 0, description: "", fabric: "", difficulty: "Medium", notes: "", featured: false, trending: false, hidden: false, gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)], height: HEIGHTS[Math.floor(Math.random() * HEIGHTS.length)] };
  const [f, setF] = useState<Design>(initial ?? blank);
  // Sync when initial changes
  useMemo(() => { setF(initial ?? blank); /* eslint-disable-next-line */ }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">{initial ? "Edit Design" : "Upload New Design"}</DialogTitle>
          <DialogDescription>Add details so customers can browse, save & book directly.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {["Front", "Back", "Side", "Close-up", "Fabric"].map((view, i) => (
              <label key={view} className={`relative aspect-square rounded-xl border-2 border-dashed border-gold/60 ${f.image && view === "Front" ? '' : GRADIENTS[i % GRADIENTS.length]} flex flex-col items-center justify-center text-[10px] text-cream/80 cursor-pointer hover:border-gold transition overflow-hidden`}>
                {f.image && view === "Front" ? (
                  <img src={f.image} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 mb-1" />
                    {view}
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && view === "Front") {
                    const reader = new FileReader();
                    reader.onload = (e) => setF({ ...f, image: e.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Design Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ivory Banarasi Blouse" /></Field>
            <Field label="Category">
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Stitching Price (₹)"><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></Field>
            <Field label="Delivery (days)"><Input type="number" value={f.delivery} onChange={(e) => setF({ ...f, delivery: Number(e.target.value) })} /></Field>
            <Field label="Difficulty">
              <Select value={f.difficulty} onValueChange={(v) => setF({ ...f, difficulty: v as Design["difficulty"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Easy", "Medium", "Hard", "Expert"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Fabric Recommendations"><Input value={f.fabric} onChange={(e) => setF({ ...f, fabric: e.target.value })} placeholder="Banarasi silk, raw silk lining" /></Field>
          </div>
          <Field label="Description"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} /></Field>
          <Field label="Custom Notes"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} placeholder="Care instructions, fitting tips…" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button onClick={() => { onSave(f); onOpenChange(false); }} className="rounded-full bg-gradient-navy text-cream gap-2"><Plus className="h-4 w-4" />{initial ? "Save changes" : "Publish design"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({ design, onClose, onEdit }: { design: Design | null; onClose: () => void; onEdit: (d: Design) => void }) {
  if (!design) return null;
  return (
    <Dialog open={!!design} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Badge className="w-fit bg-champagne text-navy text-[10px]">{design.category}</Badge>
          <DialogTitle className="font-display text-3xl text-navy">{design.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className={`${design.gradient} h-72 rounded-xl shadow-luxe bg-cover bg-center`} style={design.image ? { backgroundImage: `url(${design.image})` } : {}} />
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.slice(0, 4).map((g, i) => <div key={i} className={`${g} h-16 rounded-lg`} />)}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-mocha">{design.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Starting price" value={`₹${design.price.toLocaleString()}`} />
              <Info label="Delivery" value={`${design.delivery} days`} />
              <Info label="Orders" value={`${design.orders} completed`} />
              <Info label="Rating" value={`⭐ ${design.rating}`} />
              <Info label="Saves" value={`${design.saves}`} />
              <Info label="Difficulty" value={design.difficulty} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-mocha">Fabric suggestions</p>
              <p className="text-sm text-navy mt-1">{design.fabric}</p>
            </div>
            {design.notes && (
              <div className="bg-champagne/40 p-3 rounded-lg">
                <p className="text-[10px] uppercase tracking-[0.22em] text-mocha">Tailor notes</p>
                <p className="text-sm text-navy mt-1">{design.notes}</p>
              </div>
            )}
            <Card className="p-3 bg-white/70 border-gold/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center font-display text-navy-deep">AK</div>
                <div>
                  <p className="font-display text-navy text-sm">Aarav Kapoor · Maison Aarav</p>
                  <p className="text-[11px] text-mocha">⭐ 4.9 · 12 yrs experience · 340 orders completed</p>
                </div>
              </div>
            </Card>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => onEdit(design)} className="rounded-full bg-gradient-navy text-cream gap-2"><Edit className="h-4 w-4" />Edit Design</Button>
              <Button variant="outline" className="rounded-full border-navy/20 text-navy gap-2 hover:bg-secondary"><BarChart3 className="h-4 w-4" />View Analytics</Button>
              <Button variant="outline" className="rounded-full border-navy/20 text-navy gap-2 hover:bg-secondary"><MessageCircle className="h-4 w-4" />Customer Chat</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.22em] text-mocha">{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-lg p-2.5 border border-gold/60">
      <p className="text-[10px] uppercase tracking-[0.22em] text-mocha">{label}</p>
      <p className="font-display text-navy text-sm mt-0.5">{value}</p>
    </div>
  );
}

export function AddCompletedDialog({ open, onOpenChange, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, onSave: (w: any) => void }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState("");

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-cream/95 backdrop-blur-xl border-gold/40">
          <DialogHeader>
            <DialogTitle className="font-display text-navy text-xl">Add Completed Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field label="Title / Customer Name">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Anaya's Wedding Lehenga" className="bg-white/60 border-gold/40 h-10 text-navy" />
            </Field>
            <Field label="Category Tag">
              <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Bridal" className="bg-white/60 border-gold/40 h-10 text-navy" />
            </Field>
            <Field label="Photo">
              <label className="relative h-40 rounded-xl border-2 border-dashed border-gold/60 flex flex-col items-center justify-center text-mocha cursor-pointer hover:border-gold transition overflow-hidden">
                {image ? (
                  <img src={image} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
                    Upload Photo
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => setImage(e.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-mocha hover:text-navy hover:bg-white/50">Cancel</Button>
            <Button onClick={() => {
               if (title && tag) {
                 onSave({ id: "cw" + Date.now(), title, tag, image, g: "bg-gradient-gold", h: "h-80" });
                 setTitle(""); setTag(""); setImage("");
                 onOpenChange(false);
               }
            }} className="rounded-full bg-gradient-navy text-cream shadow-luxe px-6">Save Work</Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}


