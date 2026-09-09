import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Heart, Star, MapPin, Compass, Ruler, ShoppingBag,
  CalendarDays, ArrowUpRight, Crown, TrendingUp, Clock,
} from "lucide-react";

export const Route = createFileRoute("/customer/")({ component: CustomerDashboard });

const tailors = [
  { name: "Maison Aarav", city: "Mumbai · Bandra", rating: 4.9, orders: 312, tag: "Bridal · Sherwani", price: "from ₹6,500", img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80" },
  { name: "Studio Kavya", city: "Delhi · Hauz Khas", rating: 4.8, orders: 240, tag: "Lehenga · Saree", price: "from ₹8,200", img: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=800&q=80" },
  { name: "Atelier Dev", city: "Bangalore · Indiranagar", rating: 4.9, orders: 198, tag: "Suits · Tuxedo", price: "from ₹5,800", img: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=800&q=80" },
];

const trending = [
  { name: "Ivory Bridal Lehenga", price: "₹14,500", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" },
  { name: "Midnight Bandhgala", price: "₹9,800", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80" },
  { name: "Pastel Anarkali", price: "₹6,400", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80" },
  { name: "Champagne Sherwani", price: "₹11,200", img: "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=600&q=80" },
];

const recentOrders = [
  { id: "TA-2061", item: "Bridal Lehenga", tailor: "Maison Aarav", status: "In Stitching", delivery: "Apr 04", tint: "bg-navy/10 text-navy" },
  { id: "TA-2058", item: "Silk Saree Blouse", tailor: "Studio Kavya", status: "Ready for Trial", delivery: "Mar 22", tint: "bg-gradient-gold text-navy-deep" },
  { id: "TA-2050", item: "Linen Shirt", tailor: "Atelier Dev", status: "Delivered", delivery: "Mar 10", tint: "bg-emerald-100 text-emerald-800" },
];

function CustomerDashboard() {
  const { user } = useAuth();
  return (
    <PageShell title={`Welcome back, ${user?.name?.split(" ")[0] || "Riya"}`} subtitle="Your perfect stitch starts here.">
      {/* Hero */}
      <Card className="relative overflow-hidden p-8 lg:p-10 border-0 shadow-navy bg-gradient-navy text-cream">
        <div className="absolute -top-24 -right-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-rose/20 blur-2xl" />
        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-[10px] uppercase tracking-[0.28em]">
              <Crown className="h-3 w-3" /> Atelier Member
            </div>
            <h2 className="font-display text-4xl lg:text-5xl mt-4 leading-[1.05] text-balance">
              Your Perfect Stitch Starts Here.
            </h2>
            <p className="text-cream/75 text-sm mt-3 max-w-md">
              Discover India's most refined ateliers, save your measurements once, and watch every fitting come alive.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link to="/customer/discover">
                <Button className="bg-gradient-gold text-navy-deep hover:opacity-95 rounded-xl h-11 px-5 shadow-glow gap-2">
                  <Compass className="h-4 w-4" /> Discover Tailors
                </Button>
              </Link>
              <Link to="/customer/catalog">
                <Button variant="outline" className="rounded-xl h-11 px-5 bg-background border-cream/30 text-navy hover:bg-white/10">
                  Browse designs
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative h-64 rounded-3xl overflow-hidden gold-border shadow-glow">
              <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-cream">
                <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Featured Atelier</p>
                <p className="font-display text-xl mt-1">House of Couture · Spring '26</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Active orders" value="3" hint="2 in stitching" tint="bg-gradient-cream text-navy" />
        <StatCard icon={<Ruler className="h-5 w-5" />} label="Measurements" value="Saved" hint="Updated Mar 12" tint="bg-gradient-champagne text-navy" />
        <StatCard icon={<Heart className="h-5 w-5" />} label="Saved tailors" value="8" hint="2 new this week" tint="bg-gradient-rose text-navy" />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Next fitting" value="Mar 22" hint="Studio Kavya · 4 PM" tint="bg-gradient-navy text-cream" />
      </div>

      {/* Recommended tailors */}
      <Card className="p-6 glass-dark border-border shadow-luxe">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl text-navy">Recommended for you</h3>
            <p className="text-xs text-navy/60">Hand-picked ateliers based on your style</p>
          </div>
          <Link to="/customer/discover">
            <Button variant="ghost" size="sm" className="rounded-full text-gold hover:bg-gold/10">
              See all <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tailors.map((t) => (
            <div key={t.name} className="group rounded-2xl overflow-hidden border border-border bg-cream hover:shadow-glow hover:border-gold/40 transition">
              <div className="relative h-44 overflow-hidden">
                <img src={t.img} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent" />
                <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition">
                  <Heart className="h-4 w-4 text-rose-400" />
                </button>
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-[11px] font-medium text-navy">
                  <Star className="h-3 w-3 fill-gold text-gold" /> {t.rating}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base text-navy">{t.name}</p>
                    <p className="text-[11px] text-navy/50 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {t.city}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-gold/20 text-gold border-gold/30 text-[10px]">{t.orders}+ orders</Badge>
                </div>
                <p className="text-xs text-navy/40 mt-2">{t.tag}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-display text-gold">{t.price}</p>
                  <Button size="sm" className="rounded-full h-8 bg-gradient-gold text-navy-deep hover:opacity-95 font-bold">Book</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Orders + Trending */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-navy" />
              <h3 className="font-display text-xl text-navy">Recent orders</h3>
            </div>
            <Link to="/customer/orders">
              <Button variant="ghost" size="sm" className="rounded-full text-navy hover:bg-champagne/50">
                All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-soft border border-gold/60 hover:border-gold/40 transition">
                <div className="h-12 w-12 rounded-xl bg-gradient-navy text-cream flex items-center justify-center font-display text-sm">
                  {o.id.slice(-3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{o.item}</p>
                  <p className="text-[11px] text-muted-foreground">by {o.tailor}</p>
                </div>
                <div className="text-right">
                  <Badge className={`rounded-full text-[10px] ${o.tint}`}>{o.status}</Badge>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3" /> {o.delivery}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-navy" />
              <h3 className="font-display text-xl text-navy">Trending designs</h3>
            </div>
            <Link to="/customer/catalog">
              <Button variant="ghost" size="sm" className="rounded-full text-navy hover:bg-champagne/50">
                Catalog <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trending.map((d) => (
              <div key={d.name} className="group relative rounded-2xl overflow-hidden h-36 cursor-pointer">
                <img src={d.img} alt={d.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/30 to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <p className="text-[11px] font-medium text-navy truncate">{d.name}</p>
                  <p className="text-[10px] text-gold">{d.price}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Measurements + appointment */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-champagne">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-navy text-cream flex items-center justify-center">
              <Ruler className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-mocha">Measurement profile</p>
              <h3 className="font-display text-xl text-navy mt-1">All measurements saved ✨</h3>
              <p className="text-xs text-mocha/80 mt-1">Bust · Waist · Hip · Shoulder · Sleeve · Inseam — last updated Mar 12.</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="rounded-full bg-gradient-navy text-cream h-8">Update</Button>
                <Button size="sm" variant="outline" className="rounded-full h-8 border-navy/20 text-navy bg-white/60">Share with tailor</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">Upcoming appointments</h3>
          </div>
          <div className="space-y-3">
            <Appt date="Tomorrow · 4 PM" tailor="Studio Kavya" purpose="Bridal Lehenga · 1st trial" />
            <Appt date="Sat, Mar 22" tailor="Atelier Dev" purpose="Suit measurements" />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function StatCard({ icon, label, value, hint, tint }: any) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint} relative overflow-hidden`}>
      {icon}
      <p className="text-[10px] uppercase tracking-[0.22em] mt-3 opacity-70">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      <p className="text-[11px] mt-1 opacity-70">{hint}</p>
    </Card>
  );
}

function Appt({ date, tailor, purpose }: { date: string; tailor: string; purpose: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-soft border border-gold/60">
      <div className="h-12 w-12 rounded-xl bg-gradient-gold text-navy-deep flex flex-col items-center justify-center">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-navy">{purpose}</p>
        <p className="text-[11px] text-muted-foreground">{tailor} · {date}</p>
      </div>
      <Button size="sm" variant="outline" className="rounded-full h-8 border-navy/20 text-navy">Details</Button>
    </div>
  );
}






