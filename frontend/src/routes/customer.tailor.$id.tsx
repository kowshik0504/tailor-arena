import { createFileRoute } from "@tanstack/react-router";
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
        
        {profile?.services && profile.services.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 text-left mt-8">
            {profile.services.map((service: any, idx: number) => (
              <Card key={idx} className="overflow-hidden border-gold/60 shadow-luxe bg-white rounded-2xl flex flex-col relative">
                {service.image ? (
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}>
                    <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-cream flex items-center justify-center text-navy/40">
                    <span className="text-xs uppercase">No Image</span>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-display text-lg text-navy">{service.name}</h3>
                     {service.featured && (
                       <span className="text-[10px] uppercase tracking-wider bg-gold/20 text-navy-deep px-2 py-1 rounded-full">
                         Featured
                       </span>
                     )}
                  </div>
                  <p className="text-sm text-mocha flex-1">{service.description}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-40 mt-8 rounded-2xl bg-gradient-soft border border-gold/20 flex items-center justify-center text-mocha">
            No portfolio services added yet
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

      <RequestDesignDialog open={openRequest} onOpenChange={setOpenRequest} />
    </PageShell>
  );
}

function RequestDesignDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const [note, setNote] = useState("");
  const [type, setType] = useState("Pinterest");
  const [image, setImage] = useState("");

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
              {image ? (
                <img src={image} className="absolute inset-0 w-full h-full object-cover" />
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
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-mocha hover:text-navy hover:bg-white/50">Cancel</Button>
          <Button onClick={() => {
             alert("Request sent successfully to the tailor!");
             setNote(""); setType("Pinterest"); setImage("");
             onOpenChange(false);
          }} className="rounded-full bg-gradient-navy text-cream shadow-luxe px-6">Send Request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
