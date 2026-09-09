import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, ShoppingBag, MapPin, Pencil, Mail, Phone, Crown } from "lucide-react";

export const Route = createFileRoute("/customer/profile")({ component: Profile });

function Profile() {
  return (
    <PageShell title="My Profile" subtitle="Personal details and account overview.">
      {/* Hero */}
      <Card className="relative overflow-hidden p-8 border-0 shadow-navy bg-gradient-navy text-cream">
        <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-gradient-gold text-navy-deep flex items-center justify-center font-display text-3xl shadow-glow gold-border">
            RM
          </div>
          <div className="flex-1 min-w-[220px]">
            <Badge variant="outline" className="rounded-full bg-gold/10 border-gold/40 text-gold text-[10px] uppercase tracking-[0.22em] gap-1">
              <Crown className="h-3 w-3" /> Atelier Member
            </Badge>
            <h2 className="font-display text-3xl mt-2">Riya Malhotra</h2>
            <div className="flex items-center gap-4 text-cream/75 text-xs mt-2 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> riya.m@gmail.com</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Bandra, Mumbai</span>
            </div>
          </div>
          <Button className="rounded-xl bg-gradient-gold text-navy-deep shadow-glow gap-2">
            <Pencil className="h-4 w-4" /> Edit profile
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat icon={<Ruler className="h-5 w-5" />} label="Saved measurements" value="3" tint="bg-gradient-cream text-navy" />
        <Stat icon={<ShoppingBag className="h-5 w-5" />} label="Total bookings" value="14" tint="bg-gradient-champagne text-navy" />
        <Stat icon={<Crown className="h-5 w-5" />} label="Loyalty tier" value="Atelier" tint="bg-gradient-gold text-navy-deep" />
      </div>

      {/* Editable form */}
      <Card className="p-6 border-gold/60 shadow-luxe">
        <h3 className="font-display text-xl text-navy">Personal details</h3>
        <p className="text-xs text-muted-foreground">Keep your details current so tailors can reach you.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <Field label="Full name" defaultValue="Riya Malhotra" />
          <Field label="Email" defaultValue="riya.m@gmail.com" type="email" />
          <Field label="Phone" defaultValue="+91 98765 43210" />
          <Field label="City" defaultValue="Mumbai" />
          <Field label="Address line 1" defaultValue="42, Pali Naka" />
          <Field label="Address line 2" defaultValue="Bandra West" />
          <Field label="Pincode" defaultValue="400050" />
          <Field label="Preferred language" defaultValue="English" />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" className="rounded-xl border-navy/20 text-navy">Cancel</Button>
          <Button className="rounded-xl bg-gradient-navy text-cream">Save changes</Button>
        </div>
      </Card>
    </PageShell>
  );
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint}`}>
      {icon}
      <p className="text-[10px] uppercase tracking-[0.22em] mt-3 opacity-70">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </Card>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-mocha/70">{label}</label>
      <Input {...props} className="mt-1 h-10 rounded-xl bg-white/60 border-gold/60" />
    </div>
  );
}






