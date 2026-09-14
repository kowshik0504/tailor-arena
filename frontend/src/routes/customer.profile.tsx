import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, ShoppingBag, MapPin, Pencil, Mail, Phone, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/customer/profile")({ component: Profile });

function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    area: "",
    pincode: "",
    language: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.location?.city || "",
        street: user.location?.street || "",
        area: user.location?.area || "",
        pincode: user.location?.pincode || "",
        language: (user as any).language || "",
      });
    }
  }, [user]);

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "RM";
  const displayCity = user?.location?.city || "Not set";

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.location?.city || "",
        street: user.location?.street || "",
        area: user.location?.area || "",
        pincode: user.location?.pincode || "",
        language: (user as any).language || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        language: formData.language,
        location: {
          city: formData.city,
          street: formData.street,
          area: formData.area,
          pincode: formData.pincode,
        }
      };
      
      const { data } = await api.put("/auth/profile", payload);
      setUser(data);
      sessionStorage.setItem('tailorarena_user', JSON.stringify(data));
      
      alert("Your details have been saved.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="My Profile" subtitle="Personal details and account overview.">
      {/* Hero */}
      <Card className="relative overflow-hidden p-8 border-0 shadow-navy bg-gradient-navy text-cream">
        <div className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-gradient-gold text-navy-deep flex items-center justify-center font-display text-3xl shadow-glow gold-border">
            {initials}
          </div>
          <div className="flex-1 min-w-[220px]">
            <Badge variant="outline" className="rounded-full bg-gold/10 border-gold/40 text-gold text-[10px] uppercase tracking-[0.22em] gap-1">
              <Crown className="h-3 w-3" /> Atelier Member
            </Badge>
            <h2 className="font-display text-3xl mt-2">{user?.name || "Loading..."}</h2>
            <div className="flex items-center gap-4 text-cream/75 text-xs mt-2 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {user?.phone || "Phone not set"}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {displayCity}</span>
            </div>
          </div>
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
          <Field label="Full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          <Field label="Email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} type="email" />
          <Field label="Phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          <Field label="City" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
          <Field label="Address line 1 (Street)" value={formData.street} onChange={(e) => handleChange("street", e.target.value)} />
          <Field label="Address line 2 (Area)" value={formData.area} onChange={(e) => handleChange("area", e.target.value)} />
          <Field label="Pincode" value={formData.pincode} onChange={(e) => handleChange("pincode", e.target.value)} />
          <Field label="Preferred language" value={formData.language} onChange={(e) => handleChange("language", e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" className="rounded-xl border-navy/20 text-navy" onClick={handleCancel}>Cancel</Button>
          <Button className="rounded-xl bg-gradient-navy text-cream" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save changes
          </Button>
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







