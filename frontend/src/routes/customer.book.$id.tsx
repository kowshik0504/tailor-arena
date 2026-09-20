import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Check, ChevronRight, Upload, MapPin, Search } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/customer/book/$id")({
  component: BookTailor,
});

type SavedMeasurement = { id: string; garment: string; updated: string; values: Record<string, string> };
const MOCK_SAVED_MEASUREMENTS: SavedMeasurement[] = [
  { id: "m1", garment: "Saree Blouse", updated: "Mar 12, 2026", values: { Chest: "34", Waist: "28", Hip: "36", Shoulder: "14", Sleeve: "10", Neck: "13", Length: "15" } },
  { id: "m2", garment: "Lehenga", updated: "Feb 28, 2026", values: { Chest: "34", Waist: "29", Hip: "37", Shoulder: "14", Sleeve: "0", Neck: "0", Length: "40" } },
  { id: "m3", garment: "Kurta", updated: "Jan 18, 2026", values: { Chest: "38", Waist: "34", Hip: "39", Shoulder: "16", Sleeve: "22", Neck: "15", Length: "42" } },
];

const categoryGarments: Record<string, string[]> = {
  Women: ["Saree Blouse", "Lehenga", "Salwar", "Kurti", "Dress", "Other"],
  Men: ["Shirt", "Pant", "Suit", "Kurta", "Blazer", "Sherwani", "Other"],
  Kids: ["Frock", "Shirt", "Pant", "Lehenga", "Kurta", "Other"]
};

const serviceMeta: Record<string, { desc: string, duration: string, price: number }> = {
  "Measurement & Fitting": { desc: "Professional body measurement and fitting", duration: "30-45 min", price: 299 },
  "Style Consultation": { desc: "Discuss styles, fits, and fabrics with the tailor", duration: "45-60 min", price: 499 },
  "Fabric Selection": { desc: "Expert advice on selecting the right fabric", duration: "30 min", price: 199 },
  "Alteration Drop-off": { desc: "Drop off clothes for quick alterations", duration: "15-30 min", price: 149 },
  "Other": { desc: "Custom tailoring request", duration: "TBD", price: 0 }
};
const getServiceMeta = (name: string) => serviceMeta[name] || { desc: "Premium tailoring service", duration: "45 min", price: 399 };

function BookTailor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [service, setService] = useState<string>("");
  const [customService, setCustomService] = useState<string>("");
  const [category, setCategory] = useState<string>("Women");
  const [garment, setGarment] = useState<string>("Saree Blouse");
  const [occasion, setOccasion] = useState<string>("Wedding");
  const [measurement, setMeasurement] = useState<string>("visit");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [fabric, setFabric] = useState<string>("own");
  const [fabricDetails, setFabricDetails] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [refImages, setRefImages] = useState<string[]>([]);
  const [paymentId, setPaymentId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [priority, setPriority] = useState<string>("normal");
  const [tailorName, setTailorName] = useState<string>("Premium Atelier");
  const [services, setServices] = useState<string[]>(["Measurement & Fitting", "Style Consultation", "Fabric Selection", "Alteration Drop-off", "Other"]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/tailors/${id}`);
        if (res.data && res.data.profile) {
          setTailorName(res.data.profile.shopName || res.data.profile.user?.name || "Premium Atelier");
          if (res.data.profile.services && res.data.profile.services.length > 0) {
            const fetchedServices = res.data.profile.services.map((s: any) => s.name);
            setServices([...fetchedServices, "Other"]);
            setService(fetchedServices[0]);
          } else {
            setService("Measurement & Fitting");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [id]);

  const priorities = [
    { id: "normal", name: "Normal", desc: "Standard processing speed", price: "Free" },
    { id: "high", name: "High", desc: "Moderate priority processing", price: "+₹500" },
    { id: "vip", name: "VIP", desc: "Fastest completion & VIP service", price: "+₹1500" }
  ];

  // Mock upcoming dates
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      full: d.toDateString()
    };
  });

  const slots = ["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && refImages.length < 3) {
      const reader = new FileReader();
      reader.onload = (event) => setRefImages(prev => [...prev, event.target?.result as string]);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProceedToReview = () => setStep(2);
  const handleProceedToPayment = () => setStep(3);
  const handleCancelPayment = () => setStep(2);

  const finalService = service === "Other" && customService.trim() !== "" ? customService : service;
  
  const priorityMeta = priorities.find(p => p.id === priority);
  const priorityPrice = priorityMeta?.price === 'Free' ? 0 : parseInt(priorityMeta?.price?.replace(/[^0-9]/g, '') || "0");
  const serviceBasePrice = getServiceMeta(service).price;
  const estimatedTotal = serviceBasePrice + priorityPrice;

  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    setTimeout(async () => {
        const payId = `PAY-${Math.floor(Math.random() * 100000)}`;
        setPaymentId(payId);
        
        try {
          const pMap: Record<string, string> = { "normal": "Normal", "high": "High", "vip": "VIP" };
          
          let measurementPayload: {label: string, v: string}[] = [];
          if (measurement === "saved" && selectedProfileId) {
             const prof = MOCK_SAVED_MEASUREMENTS.find(m => m.id === selectedProfileId);
             if (prof) {
                measurementPayload = Object.entries(prof.values).map(([k, v]) => ({ label: k, v }));
             }
          } else {
             measurementPayload = [{ label: "Measurement Type", v: measurement === "visit" ? "Shop Visit" : "Uploaded" }];
          }

          const bookingData = {
            tailorId: id,
            dressType: `${category}'s ${garment} - ${finalService}`,
            workType: category.toLowerCase() === "alteration" ? "alteration" : "stitching",
            date: dates[selectedDate].full,
            timeSlot: selectedSlot,
            amount: estimatedTotal > 0 ? estimatedTotal : 500, // Ensure base minimum if Free/Other
            paymentMethod: "online",
            notes: notes + (fabricDetails ? ` | Fabric Pref: ${fabricDetails}` : ''),
            designImg: refImages[0] || "",
            priority: pMap[priority] || "Normal",
            measurements: measurementPayload
          };
          
          const res = await api.post('/bookings', bookingData);
          setOrderId(res.data._id);
          
          setStep(4);
        } catch (e: any) {
          console.error("Booking error", e);
          const errMsg = e.response?.data?.message || e.message || "Unknown error";
          alert(`Failed to book appointment: ${errMsg}`);
          setStep(3); // Go back to payment
        } finally {
          setIsProcessing(false);
        }
    }, 1500); // Mock payment network delay
  };


  if (step === 2) {
    return (
      <PageShell title="Review Booking" subtitle="Please verify your details before payment.">
        
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium overflow-x-auto pb-2 no-scrollbar">
            {["Select Service", "Requirements", "Schedule", "Review", "Payment"].map((s, i) => (
              <React.Fragment key={s}>
                <span className={step > i + 1 ? "text-emerald-600" : step === i + 1 ? "text-navy font-bold" : "text-mocha"}>
                  {i + 1}. {s}
                </span>
                {i < 4 && <ChevronRight className="h-4 w-4 text-mocha/50 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto p-8 border-border shadow-luxe bg-card">
          <h2 className="font-display text-2xl text-navy mb-6">Review Your Booking</h2>
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <span className="text-mocha">Tailor:</span><span className="font-medium text-navy">{tailorName}</span>
              <span className="text-mocha">Service:</span><span className="font-medium text-navy">{finalService}</span>
              <span className="text-mocha">Garment:</span><span className="font-medium text-navy">{category}'s {garment}</span>
              <span className="text-mocha">Occasion:</span><span className="font-medium text-navy">{occasion}</span>
              <span className="text-mocha">Measurements:</span><span className="font-medium text-navy">{measurement === 'saved' ? 'Saved Profile' : measurement === 'visit' ? 'Shop Visit' : 'Uploaded'}</span>
              <span className="text-mocha">Fabric:</span><span className="font-medium text-navy">{fabric === 'own' ? 'Providing my own' : 'Need from tailor'}</span>
              <span className="text-mocha">Date & Time:</span><span className="font-medium text-navy">{dates[selectedDate].full} at {selectedSlot}</span>
              <span className="text-mocha">Priority:</span><span className="font-medium text-navy capitalize">{priority}</span>
              <span className="text-mocha">Ref Images:</span><span className="font-medium text-navy capitalize">{refImages.length} uploaded</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-border">
              <span className="font-medium text-navy">Estimated Total</span>
              <span className="font-display text-xl text-navy">₹{estimatedTotal}</span>
            </div>

            {notes && (
              <div className="text-sm">
                <span className="text-mocha block mb-1">Notes:</span>
                <span className="text-navy">{notes}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back & Edit</Button>
            <Button className="flex-1 bg-gradient-navy text-cream shadow-navy" onClick={handleProceedToPayment}>Confirm Booking</Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (step === 3) {
    return (
      <PageShell title="Payment" subtitle="Secure checkout">
        <Card className="max-w-md mx-auto p-8 border-border shadow-luxe bg-card text-center">
          <h2 className="font-display text-2xl text-navy mb-2">Checkout</h2>
          <p className="text-mocha mb-8">Total Amount: <span className="font-bold text-navy text-xl">₹{estimatedTotal}</span></p>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-gold text-navy-deep shadow-glow h-12 text-lg font-bold" 
              onClick={handlePaymentSuccess}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Online"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-rose-600 hover:bg-rose-50" 
              onClick={handleCancelPayment}
              disabled={isProcessing}
            >
              Cancel Payment
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (step === 4) {
    return (
      <PageShell title="Booking Confirmed" subtitle="Your appointment is set.">
        <Card className="max-w-2xl mx-auto p-10 text-center border-border shadow-luxe bg-card">
          <div className="h-20 w-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-navy-deep" />
          </div>
          <h2 className="font-display text-3xl text-navy mb-2">✅ Booking Confirmed!</h2>
          <p className="text-mocha mb-8">We've verified your payment. The tailor has been notified.</p>
          
          <div className="bg-gradient-soft border border-gold/20 rounded-2xl p-6 text-left mb-8 inline-block w-full max-w-md space-y-2">
            <p className="text-sm text-mocha flex justify-between"><span>Payment ID:</span> <span className="font-mono text-navy">{paymentId}</span></p>
            <p className="text-sm text-mocha flex justify-between"><span>Payment Status:</span> <span className="font-medium text-emerald-600">Paid</span></p>
            <div className="my-4 border-t border-gold/20 pt-4" />
            <p className="font-medium text-navy text-lg">{finalService}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-mocha">
              <CalendarDays className="h-4 w-4 text-gold" /> {dates[selectedDate].full}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-mocha">
              <Clock className="h-4 w-4 text-gold" /> {selectedSlot}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-navy text-cream px-8 h-12 rounded-xl shadow-navy font-bold"
              onClick={() => navigate({ to: `/customer/order/${orderId}` })}
            >
              View Order Details
            </Button>
            <Button 
              variant="outline"
              className="px-8 h-12 rounded-xl border-navy/20 text-navy font-medium"
              onClick={() => navigate({ to: "/customer/orders" })}
            >
              All My Bookings
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Book Appointment" subtitle="Schedule your visit or consultation">
      
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium overflow-x-auto pb-2 no-scrollbar">
          {["Select Service", "Requirements", "Schedule", "Review", "Payment"].map((s, i) => (
            <React.Fragment key={s}>
              <span className={step > i + 1 ? "text-emerald-600" : step === i + 1 ? "text-navy font-bold" : "text-mocha"}>
                {i + 1}. {s}
              </span>
              {i < 4 && <ChevronRight className="h-4 w-4 text-mocha/50 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <Card className="p-6 border-border shadow-sm bg-card">
            <h3 className="font-display text-xl text-navy mb-4">1. Select Service</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {services.map((s) => {
                const meta = getServiceMeta(s);
                return (
                  <div 
                    key={s}
                    onClick={() => setService(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${service === s ? 'border-gold bg-gold/5 shadow-glow' : 'border-border bg-white hover:border-gold/40'}`}
                  >
                    <div className={`mt-1 shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${service === s ? 'border-gold bg-gold' : 'border-muted-foreground'}`}>
                      {service === s && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-medium text-navy text-sm block">{s}</span>
                      <p className="text-xs text-mocha mt-1">{meta.desc}</p>
                      <div className="flex gap-3 mt-3 text-[11px] font-medium text-navy/70">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {meta.duration}</span>
                        {meta.price > 0 && <span className="text-emerald-600">From ₹{meta.price}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {service === "Other" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-2 block">Please specify your service</label>
                <Input 
                  placeholder="E.g., Rush alteration, Specific styling..." 
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="h-12 rounded-xl border-border bg-white text-navy focus:border-gold"
                />
              </div>
            )}
            
            <div className="grid sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {["Women", "Men", "Kids"].map((c) => (
                    <button 
                      key={c} 
                      onClick={() => { setCategory(c); setGarment(categoryGarments[c][0]); }} 
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${category === c ? 'bg-gradient-navy text-cream border-navy' : 'bg-white text-navy border-border hover:border-gold/40'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Garment Type</label>
                <div className="flex flex-wrap gap-2">
                  {categoryGarments[category]?.map((g) => (
                    <button 
                      key={g} 
                      onClick={() => setGarment(g)} 
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${garment === g ? 'bg-gradient-gold text-navy-deep border-gold' : 'bg-white text-navy border-border hover:border-gold/40'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Occasion Context</label>
              <div className="flex flex-wrap gap-2">
                {["Wedding", "Party", "Casual", "Formal"].map((c) => (
                  <button key={c} onClick={() => setOccasion(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${occasion === c ? 'bg-gradient-navy text-cream border-navy' : 'bg-white text-navy border-border hover:border-gold/40'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border shadow-sm bg-card">
            <h3 className="font-display text-xl text-navy mb-4">2. Requirements</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Measurements</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div onClick={() => { setMeasurement("visit"); setSelectedProfileId(null); }} className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${measurement === "visit" ? 'border-gold bg-gold/5 shadow-glow' : 'border-border bg-white hover:border-gold/40'}`}>
                    <MapPin className="h-5 w-5 text-navy/70" />
                    <span className="font-medium text-navy text-sm">I'll visit the shop</span>
                  </div>
                  <div onClick={() => setMeasurement("saved")} className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${measurement === "saved" ? 'border-gold bg-gold/5 shadow-glow' : 'border-border bg-white hover:border-gold/40'}`}>
                    <Search className="h-5 w-5 text-navy/70" />
                    <span className="font-medium text-navy text-sm">Use saved profiles</span>
                  </div>
                  <div onClick={() => { setMeasurement("upload"); setSelectedProfileId(null); }} className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${measurement === "upload" ? 'border-gold bg-gold/5 shadow-glow' : 'border-border bg-white hover:border-gold/40'}`}>
                    <Upload className="h-5 w-5 text-navy/70" />
                    <span className="font-medium text-navy text-sm">Upload existing</span>
                  </div>
                </div>

                {measurement === "saved" && (
                  <div className="mt-4 p-4 border rounded-xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-navy">My Measurements</p>
                      <Button variant="link" className="text-[11px] h-auto p-0" onClick={() => window.open('/customer/measurements', '_blank')}>Manage</Button>
                    </div>
                    {MOCK_SAVED_MEASUREMENTS.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => setSelectedProfileId(m.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${selectedProfileId === m.id ? 'bg-gold/10 border-gold' : 'bg-white border-border hover:border-gold/40'}`}
                      >
                        <div>
                          <p className="font-medium text-sm text-navy flex items-center gap-2">
                            {m.garment}
                            {garment === m.garment && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Matches Selection</span>}
                          </p>
                          <p className="text-xs text-mocha mt-0.5">Updated {m.updated}</p>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${selectedProfileId === m.id ? 'border-gold bg-gold' : 'border-muted-foreground'}`}>
                          {selectedProfileId === m.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Fabric</label>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div onClick={() => setFabric("own")} className={`p-4 rounded-xl border cursor-pointer transition-all ${fabric === "own" ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold/40'}`}>
                    <span className="font-medium text-navy text-sm">I have my own fabric</span>
                  </div>
                  <div onClick={() => setFabric("tailor")} className={`p-4 rounded-xl border cursor-pointer transition-all ${fabric === "tailor" ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold/40'}`}>
                    <span className="font-medium text-navy text-sm">I need fabric from tailor</span>
                  </div>
                </div>
                <Input 
                  placeholder={fabric === "own" ? "Material type, color, etc. (Optional)" : "Preferences (Material, color, finish, budget)"}
                  value={fabricDetails}
                  onChange={e => setFabricDetails(e.target.value)}
                  className="rounded-xl border-border bg-white text-navy focus:border-gold h-10"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Reference Images (Max 3)</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <div className="flex flex-wrap gap-4">
                  {refImages.map((img, idx) => (
                    <div key={idx} className="relative h-24 w-24 rounded-xl overflow-hidden border border-gold/40">
                      <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
                      <button onClick={() => setRefImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full h-5 w-5 text-[10px] flex items-center justify-center">×</button>
                    </div>
                  ))}
                  {refImages.length < 3 && (
                    <Button variant="outline" className="border-dashed border-2 border-gold/40 h-24 w-24 text-mocha hover:bg-gold/5 flex flex-col items-center justify-center gap-2 p-0" onClick={() => fileInputRef.current?.click()}>
                      <span className="text-xl leading-none">+</span>
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-2 block">Additional Notes</label>
                <textarea 
                  placeholder="E.g., Keep sleeve length at 17'', prefer slightly loose fitting, add extra lining..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-white text-navy focus:border-gold text-sm"
                />
              </div>
            </div>
          </Card>

          <Card className={`p-6 border-border shadow-sm bg-card transition-all`}>
            <h3 className="font-display text-xl text-navy mb-4">3. Appointment Date & Time</h3>
            
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {dates.map((d, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border cursor-pointer transition-all ${selectedDate === i ? 'bg-gradient-gold text-navy-deep border-gold shadow-glow' : 'bg-white border-border text-navy hover:border-gold/40'}`}
                >
                  <span className="text-xs font-medium uppercase tracking-wider">{d.day}</span>
                  <span className="text-xl font-display mt-1">{d.date}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedSlot === s ? 'bg-gradient-navy text-cream border-navy shadow-navy' : 'bg-white text-navy border-border hover:border-gold/40'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <Card className={`p-6 border-border shadow-sm bg-card transition-all`}>
            <h3 className="font-display text-xl text-navy mb-4">4. Order Priority</h3>
            <div className="flex flex-col gap-3">
              {priorities.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${priority === p.id ? 'border-gold bg-gold/5 shadow-glow' : 'border-border bg-white hover:border-gold/40'}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy text-sm">{p.name}</span>
                      {p.id === 'vip' && <span className="bg-gradient-gold text-navy-deep px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Recommended</span>}
                    </div>
                    <p className="text-xs text-mocha mt-1">{p.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium text-sm ${p.price === 'Free' ? 'text-mocha' : 'text-emerald-600'}`}>{p.price}</span>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${priority === p.id ? 'border-gold bg-gold' : 'border-muted-foreground'}`}>
                      {priority === p.id && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 border-border shadow-sm sticky top-24 bg-card">
            <h3 className="font-display text-lg text-navy mb-4">Booking Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Tailor</p>
                <p className="font-medium text-navy text-sm">{tailorName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Service</p>
                  <p className="font-medium text-navy text-sm">{finalService || "Other"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Category</p>
                  <p className="font-medium text-navy text-sm">{category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Garment</p>
                  <p className="font-medium text-navy text-sm">{garment}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Occasion</p>
                  <p className="font-medium text-navy text-sm">{occasion}</p>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Measurements</p>
                {measurement === "saved" && selectedProfileId ? (
                  <div className="text-sm">
                    <span className="font-medium text-navy block">{MOCK_SAVED_MEASUREMENTS.find(m => m.id === selectedProfileId)?.garment}</span>
                    <span className="text-emerald-600 text-[11px] flex items-center gap-1"><Check className="h-3 w-3"/> Will be shared with tailor</span>
                  </div>
                ) : (
                  <p className="font-medium text-navy text-sm">{measurement === "visit" ? "Will visit shop" : "Will upload"}</p>
                )}
              </div>

              {(selectedSlot) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Date</p>
                    <p className="font-medium text-navy text-sm">{dates[selectedDate].day}, {dates[selectedDate].date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-mocha mb-1">Time</p>
                    <p className="font-medium text-navy text-sm">{selectedSlot}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-mocha">Service</span>
                <span className="text-navy font-medium">₹{serviceBasePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mocha">Priority ({priority})</span>
                <span className="text-navy font-medium">{priorityPrice === 0 ? 'Free' : `₹${priorityPrice}`}</span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-border">
                <span className="font-medium text-navy">Estimated total</span>
                <span className="font-display text-xl text-navy">₹{estimatedTotal}</span>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-gold text-navy-deep h-12 rounded-xl font-bold shadow-glow text-lg"
              disabled={!selectedSlot || (service === "Other" && customService.trim() === "") || (measurement === "saved" && !selectedProfileId)}
              onClick={handleProceedToReview}
            >
              Review Booking
            </Button>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
