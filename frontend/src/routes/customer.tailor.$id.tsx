import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagePlus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/customer/tailor/$id")({
  component: TailorProfile,
});

function TailorProfile() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<any>(null);
  const [openRequest, setOpenRequest] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const handleViewDesign = (d: any) => {
    setDetail(d);
    api.put(`/tailors/${id}/designs/${d._id || d.id}/view`).catch(e => console.error("Failed to track view", e));
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/tailors/${id}`);
        setProfile(res.data.profile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [id]);

  const paused = profile?.isPaused;

  return (
    <PageShell title="Atelier Profile" subtitle="View tailor details and portfolio.">
      <Card className="max-w-4xl mx-auto p-10 text-center border-gold/40 shadow-glow bg-cream relative">
        {paused && (
          <div className="absolute top-6 right-6">
            <Badge variant="outline" className="rounded-full bg-rose-100 text-rose-700 border-rose-200">
              Not accepting orders now
            </Badge>
          </div>
        )}
        <h2 className="font-display text-3xl text-navy mb-4">{profile?.shopName || 'Tailor Profile'}</h2>
        <p className="text-mocha mb-8">{profile?.houseDetails || 'View tailor details and portfolio.'}</p>
        
        {profile?.designs && profile.designs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left mt-8">
            {profile.designs.map((d: any, idx: number) => (
              <Card key={idx} className="overflow-hidden border-gold/60 shadow-luxe group flex flex-col">
                <button onClick={() => handleViewDesign(d)} className={`relative ${d.gradient || 'bg-gradient-gold'} h-64 text-left overflow-hidden`}>
                  {d.image && <img src={d.image} className="absolute inset-0 w-full h-full object-cover" alt={d.name} />}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    {d.featured && <Badge className="bg-gradient-gold text-navy border-0 text-[10px] gap-1"><Sparkles className="h-3 w-3" />Featured</Badge>}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-foreground/50 to-transparent text-background">
                    <Badge className="bg-background/30 backdrop-blur text-background border-0 text-[10px] uppercase tracking-wider rounded-full">{d.category}</Badge>
                    <p className="font-display text-base mt-1.5">{d.name}</p>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-40 mt-8 rounded-2xl bg-gradient-soft border border-gold/20 flex items-center justify-center text-mocha">
            No portfolio designs added yet
          </div>
        )}

        {/* COMPLETED WORKS */}
        <div className="flex justify-between items-center mt-12 mb-6">
          <h3 className="font-display text-2xl text-navy text-left">Completed Works</h3>
          <Button onClick={() => setOpenRequest(true)} className="rounded-full bg-gradient-navy text-cream shadow-sm hover:opacity-90 h-8 text-xs px-4">
            <Sparkles className="h-3 w-3 mr-1" /> Request Like This
          </Button>
        </div>
        {profile?.completedWorks && profile.completedWorks.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5 text-left">
            {profile.completedWorks.map((c: any, idx: number) => (
              <Card key={idx} className={`relative overflow-hidden border-gold/60 shadow-luxe break-inside-avoid ${c.g || 'bg-gradient-gold'} ${c.h || 'h-80'}`}>
                {c.image && <img src={c.image} className="absolute inset-0 w-full h-full object-cover" alt={c.title} />}
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-3 left-3"><Badge className="bg-white/90 text-navy border-0 text-[10px] shadow-sm">{c.tag || 'Work'}</Badge></div>
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <p className="font-display text-sm">{c.title}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-40 rounded-2xl bg-gradient-soft border border-gold/20 flex items-center justify-center text-mocha">
            No completed works to display yet
          </div>
        )}
      </Card>

      <RequestDesignDialog open={openRequest} onOpenChange={setOpenRequest} tailorId={profile?._id} designRef={detail} />
      <CustomerDetailDialog design={detail} profile={profile} onClose={() => setDetail(null)} onRequest={() => { setDetail(null); setOpenRequest(true); }} />
    </PageShell>
  );
}

function RequestDesignDialog({ open, onOpenChange, tailorId, designRef }: { open: boolean, onOpenChange: (o: boolean) => void, tailorId: string, designRef: any }) {
  const [note, setNote] = useState("");
  const [type, setType] = useState("Pinterest");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendRequest = async () => {
    if (!tailorId) return;
    setLoading(true);
    try {
      // Send booking request
      await api.post('/bookings', {
        tailorId,
        dressType: type || designRef?.name || "Custom Design",
        date: new Date().toISOString(), // Immediate
        timeSlot: "Flexible", // Dummy for bypass
        workType: "stitching", // Must be stitching or alteration
        amount: 0, // Required by model
        paymentMethod: "online", // Forces status to 'pending' instead of 'confirmed' so it shows up in requests
        notes: note,
        designImg: image || designRef?.image || ""
      });

      
      setNote(""); setType("Pinterest"); setImage("");
      onOpenChange(false);
      // Removed chat redirection so customer stays on profile or can go to dashboard
      // navigate({ to: '/customer' }); 
    } catch (err) {
      console.error(err);
      alert("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-cream/95 backdrop-blur-xl border-gold/40">
        <DialogHeader>
          <DialogTitle className="font-display text-navy text-xl">Request Custom Design</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.22em] text-mocha">Reference Photo</Label>
            <label className="relative h-40 rounded-xl border-2 border-dashed border-gold/60 flex flex-col items-center justify-center text-mocha cursor-pointer hover:border-gold transition overflow-hidden bg-white/40">
              {image || designRef?.image ? (
                <img src={image || designRef?.image} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
                  Upload Sketch or Screenshot
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
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.22em] text-mocha">Reference Type</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Pinterest, Instagram" className="bg-white/60 border-gold/40 text-navy" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.22em] text-mocha">What do you need?</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Saw this on Pinterest — can you stitch a similar peach lehenga?" className="bg-white/60 border-gold/40 text-navy min-h-[80px] resize-none" />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-mocha hover:text-navy hover:bg-white/50" disabled={loading}>Cancel</Button>
          <Button onClick={handleSendRequest} disabled={loading} className="rounded-full bg-gradient-navy text-cream shadow-luxe px-6">
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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

function CustomerDetailDialog({ design, profile, onClose, onRequest }: { design: any; profile: any; onClose: () => void; onRequest: () => void }) {
  if (!design) return null;
  return (
    <Dialog open={!!design} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-cream">
        <DialogHeader>
          <Badge className="w-fit bg-champagne text-navy text-[10px]">{design.category}</Badge>
          <DialogTitle className="font-display text-3xl text-navy">{design.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className={`${design.gradient || 'bg-gradient-gold'} rounded-xl shadow-luxe overflow-hidden`}>
              {design.image && <img src={design.image} className="w-full h-auto max-h-[70vh] object-contain" alt="Detail" />}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-mocha">{design.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Starting price" value={`₹${design.price?.toLocaleString() || 0}`} />
              <Info label="Delivery" value={`${design.delivery || 7} days`} />
              <Info label="Orders" value={`${design.orders || 0} completed`} />
              <Info label="Difficulty" value={design.difficulty || 'Medium'} />
            </div>
            {design.fabric && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-mocha">Fabric suggestions</p>
                <p className="text-sm text-navy mt-1">{design.fabric}</p>
              </div>
            )}
            <Card className="p-3 bg-white/70 border-gold/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center font-display text-navy-deep">
                  {profile?.user?.name ? profile.user.name.substring(0, 2).toUpperCase() : "TL"}
                </div>
                <div>
                  <p className="font-display text-navy text-sm">
                    {profile?.user?.name || "Tailor Name"} {profile?.shopName ? `· ${profile.shopName}` : ""}
                  </p>
                  <p className="text-[11px] text-mocha">
                    ⭐ {profile?.rating || 0} · {profile?.reviewCount || 0} reviews
                  </p>
                </div>
              </div>
            </Card>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={onRequest} className="rounded-full bg-gradient-navy text-cream shadow-luxe px-8 h-10 w-full font-semibold gap-2">
                <Sparkles className="h-4 w-4" /> Request Customization
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
