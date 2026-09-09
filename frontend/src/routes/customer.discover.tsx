import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import {
  Search, MapPin, Star, Heart, MessageCircle, CalendarDays, Compass, SlidersHorizontal, Clock
} from "lucide-react";

export const Route = createFileRoute("/customer/discover")({ component: DiscoverPage });

const categories = [
  "All", "Men", "Women", "Kids", "Bridal", "Alteration", "Designer Wear",
];

function DiscoverPage() {
  const [active, setActive] = useState("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [tailors, setTailors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const res = await api.get('/tailors/all');
        setTailors(res.data);
      } catch (err) {
        console.error("Failed to fetch tailors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTailors();
  }, []);

  const toggleSave = (id: string) => {
    setSaved((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const tailorsList = Array.isArray(tailors) ? tailors : [];

  const filtered = tailorsList
    .filter((t) => {
      if (!t) return false;
      return active === "All" || (t.workType?.toLowerCase() === active.toLowerCase()) || (t.category?.toLowerCase() === active.toLowerCase());
    })
    .filter(t => (t.shopName || t.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
      <PageShell title="Discover Ateliers" subtitle="Find India's finest tailors near you.">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* 🔍 SEARCH & FILTERS */}
          <Card className="bg-card border-gold/20 p-6 md:p-8 shadow-luxe relative z-10">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mocha/60" />
                <Input 
                  placeholder="Search ateliers, styles, or designers..." 
                  className="pl-12 h-14 bg-white border-border text-navy rounded-2xl focus:border-gold/50 transition-all text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mocha/60" />
                <Input 
                  placeholder="Your Location" 
                  defaultValue="Mumbai, MH"
                  className="pl-12 h-14 bg-white border-border text-navy rounded-2xl focus:border-gold/50 transition-all text-lg"
                />
              </div>
              <Button className="h-14 px-8 bg-gradient-gold text-navy-deep rounded-2xl font-bold shadow-glow text-lg">
                Search
              </Button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                    active === c
                      ? "bg-gradient-gold text-navy-deep border-gold shadow-glow"
                      : "bg-white text-navy border-border hover:border-gold/30"
                  }`}
                >
                  {c}
                </button>
              ))}
              <Button variant="ghost" className="ml-auto text-gold gap-2 hover:bg-gold/10 rounded-full">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </div>
          </Card>

          {/* ✅ TAILOR GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {loading ? (
              <div className="col-span-full py-20 text-center bg-card border-border shadow-sm rounded-3xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                <p className="text-mocha/60 mt-4">Loading Ateliers...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((t, index) => {
                const startPrice = Array.isArray(t.rates) && t.rates.length > 0 
                    ? Math.min(...t.rates.filter((r: any) => r && typeof r.stitchingCost === 'number').map((r: any) => r.stitchingCost)) 
                    : 1500;
                
                return (
                <Card 
                  key={t._id || t.id}
                  className="group overflow-hidden border-gold/60 shadow-luxe hover:border-gold/40 transition-all duration-500 cursor-pointer relative bg-card"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={t.documents?.shopPhoto || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"} 
                      alt={t.shopName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent opacity-80" />
                    
                    {!t.isVerified && (
                      <div className="absolute top-4 left-4 bg-rose-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-400/50 shadow-sm z-10">
                        Not Verified
                      </div>
                    )}
                    
                    {t.isPaused && (
                      <div className="absolute top-12 left-4 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-rose-200 shadow-sm z-10 mt-1">
                        Not accepting orders
                      </div>
                    )}

                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSave(t._id || t.id); }}
                      className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <Heart className={`h-5 w-5 ${saved.has(t._id || t.id) ? "fill-gold text-gold" : "text-white"}`} />
                    </button>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="bg-gold text-navy-deep px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {t.category || t.workType || "Tailor"}
                      </div>
                      <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-cream border border-white/10 gap-1 flex items-center">
                        <Star className="h-3 w-3 fill-gold text-gold" /> {t.rating || "4.8"}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div>
                      <p className="font-display text-lg text-navy">{t.shopName || t.user?.name}</p>
                      <p className="text-[11px] text-mocha/70">{t.user?.name || "Premium Atelier"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-[12px] text-mocha">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {(Math.random() * 5 + 1).toFixed(1)} km</span>
                      <span className="text-right text-navy font-medium">₹{startPrice}+</span>
                      <span className="col-span-2 flex items-center gap-1.5 text-mocha/70"><Clock className="h-3.5 w-3.5" /> Viewed {["today", "yesterday", "2 days ago"][index % 3]}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-6">
                      <Button size="sm" variant="outline" className="flex-1 rounded-xl h-10 text-xs border-navy/20 text-navy" onClick={() => navigate({ to: `/customer/tailor/${t._id}` })}>
                        Profile
                      </Button>
                      <Link to={`/customer/chat`} search={{ tailorId: t._id || t.id, name: t.shopName || t.user?.name || "Tailor Vishnu" }} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full rounded-xl h-10 text-xs border-navy/20 text-navy gap-1">
                          <MessageCircle className="h-3.5 w-3.5" /> Chat
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        disabled={t.isPaused}
                        className={`flex-[1.5] ${t.isPaused ? 'bg-gray-200 text-mocha cursor-not-allowed shadow-none border-none' : 'bg-gradient-gold text-navy-deep shadow-glow'} rounded-xl h-10 font-bold text-xs gap-1`} 
                        onClick={() => navigate({ to: `/customer/book/${t._id}` })}
                      >
                        <CalendarDays className="h-3.5 w-3.5" /> {t.isPaused ? "Unavailable" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </Card>
                )
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-card border-border shadow-sm rounded-3xl">
                  <div className="text-6xl mb-4 opacity-50">🧵</div>
                  <h3 className="text-2xl font-display text-navy">No Ateliers Found</h3>
                  <p className="text-mocha/70 mt-2">Try adjusting your filters or search query.</p>
                  <Button 
                    variant="link" 
                    className="mt-6 text-gold"
                    onClick={() => { setActive("All"); setSearchQuery(""); }}
                  >
                    Clear all filters
                  </Button>
              </div>
            )}
          </div>

        </div>
      </PageShell>
  );
}





