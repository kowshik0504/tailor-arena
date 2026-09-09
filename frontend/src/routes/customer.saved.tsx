import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, MessageCircle, CalendarDays, Trash2, Clock } from "lucide-react";

export const Route = createFileRoute("/customer/saved")({ component: SavedTailors });

const initial = [
  { id: "t1", name: "Maison Aarav", shop: "Aarav Couture House", city: "Bandra, Mumbai", rating: 4.9, distance: "2.4 km", lastViewed: "2 hours ago", price: "₹6,500", img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80" },
  { id: "t2", name: "Studio Kavya", shop: "Kavya Designer Studio", city: "Hauz Khas, Delhi", rating: 4.8, distance: "5.1 km", lastViewed: "Yesterday", price: "₹4,200", img: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=600&q=80" },
  { id: "t3", name: "Atelier Dev", shop: "Dev Tailoring Co.", city: "Indiranagar, Bengaluru", rating: 4.9, distance: "3.8 km", lastViewed: "3 days ago", price: "₹3,800", img: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=600&q=80" },
];

function SavedTailors() {
  const [list, setList] = useState(initial);

  return (
    <PageShell title="Saved Tailors" subtitle="Your favourite ateliers, ready to book anytime.">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-mocha/70">My favourites</p>
          <h3 className="font-display text-2xl text-navy">{list.length} saved tailors</h3>
        </div>
        <Link to="/customer/discover">
          <Button variant="outline" className="rounded-full border-navy/20 text-navy">Discover more</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <Card className="p-12 text-center border-gold/60 shadow-luxe bg-gradient-cream">
          <Heart className="h-10 w-10 text-terracotta mx-auto" />
          <h3 className="font-display text-2xl text-navy mt-3">No saved tailors yet</h3>
          <p className="text-sm text-muted-foreground mt-2">Tap the heart on any tailor to save them here.</p>
          <Link to="/customer/discover">
            <Button className="mt-5 bg-gradient-navy text-cream rounded-xl">Browse tailors</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((t) => (
            <Card key={t.id} className="overflow-hidden border-gold/60 shadow-luxe hover:border-gold/40 transition">
              <div className="grid grid-cols-[140px_1fr]">
                <div className="relative h-full">
                  <img src={t.img} alt={t.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cream/10" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg text-navy">{t.name}</p>
                      <p className="text-[11px] text-mocha/70">{t.shop}</p>
                    </div>
                    <Badge className="rounded-full bg-champagne text-navy text-[10px] gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" /> {t.rating}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-3 text-[11px] text-mocha">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.distance}</span>
                    <span className="text-right text-navy">{t.price}+</span>
                    <span className="col-span-2 flex items-center gap-1 text-mocha/70"><Clock className="h-3 w-3" /> Viewed {t.lastViewed}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs border-navy/20 text-navy flex-1">
                      View
                    </Button>
                    <Link to={`/customer/chat`} search={{ tailorId: t.id, name: t.name }} className="flex-1">
                      <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs border-navy/20 text-navy gap-1 w-full">
                        <MessageCircle className="h-3 w-3" /> Chat
                      </Button>
                    </Link>
                    <Button size="sm" className="rounded-lg h-8 text-xs bg-gradient-navy text-cream gap-1 flex-1">
                      <CalendarDays className="h-3 w-3" /> Book
                    </Button>
                    <button
                      onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}
                      title="Remove from favourites"
                      className="h-8 w-8 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}






