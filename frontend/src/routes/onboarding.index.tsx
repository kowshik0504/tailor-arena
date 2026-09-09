import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Store, Home, ArrowLeft, ArrowRight, Building2, MapPin, Map, Navigation,
  Upload, FileText, Camera, Image as ImageIcon, Check, Mail, Phone, Sparkles, Rocket, Loader2,
  Shield, CreditCard, AlertCircle, User
} from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/onboarding/")({ component: Onboarding });

type WorkType = "shop" | "home" | null;
type UploadKey = "id" | "photo" | "passport" | "machine" | "shop";

function Onboarding() {
  const getInitial = (key: string, defaultVal: any) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [step, setStep] = useState(() => getInitial("onboard_step", 1));
  const [workType, setWorkType] = useState<WorkType>(() => getInitial("onboard_workType", null));
  const [shopName, setShopName] = useState(() => getInitial("onboard_shopName", ""));
  const [established, setEstablished] = useState(() => getInitial("onboard_established", ""));
  const [address, setAddress] = useState(() => getInitial("onboard_address", { house: "", street: "", area: "", city: "", pin: "" }));
  const [gstin, setGstin] = useState(() => getInitial("onboard_gstin", ""));
  const [contact, setContact] = useState(() => getInitial("onboard_contact", { email: "", phone: "" }));
  const [files, setFiles] = useState<Record<UploadKey, File | null>>({
    id: null, photo: null, passport: null, machine: null, shop: null,
  });
  const [aadharNumber, setAadharNumber] = useState(() => getInitial("onboard_aadharNumber", ""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("onboard_step", JSON.stringify(step));
    localStorage.setItem("onboard_workType", JSON.stringify(workType));
    localStorage.setItem("onboard_shopName", JSON.stringify(shopName));
    localStorage.setItem("onboard_established", JSON.stringify(established));
    localStorage.setItem("onboard_address", JSON.stringify(address));
    localStorage.setItem("onboard_gstin", JSON.stringify(gstin));
    localStorage.setItem("onboard_contact", JSON.stringify(contact));
    localStorage.setItem("onboard_aadharNumber", JSON.stringify(aadharNumber));
  }, [step, workType, shopName, established, address, gstin, contact, aadharNumber]);

  const next = () => setStep((s: number) => Math.min(5, s + 1));
  const back = () => setStep((s: number) => Math.max(1, s - 1));

  const finish = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("workType", workType || "");
      formData.append("shopName", shopName);
      formData.append("established", established);
      formData.append("address", JSON.stringify(address));
      formData.append("gstin", gstin);
      formData.append("email", contact.email);
      formData.append("phone", contact.phone);
      formData.append("aadharNumber", aadharNumber.replace(/\s/g, ""));

      if (files.id) formData.append("govtId", files.id);
      if (files.passport) formData.append("passportPhoto", files.passport);
      if (files.photo) formData.append("tailorPhoto", files.photo);
      if (files.machine) formData.append("machinePhoto", files.machine);
      if (files.shop) formData.append("shopPhoto", files.shop);

      await api.post("/tailors/register-onboarding", formData);

      localStorage.removeItem("onboard_step");
      localStorage.removeItem("onboard_workType");
      localStorage.removeItem("onboard_shopName");
      localStorage.removeItem("onboard_established");
      localStorage.removeItem("onboard_address");
      localStorage.removeItem("onboard_gstin");
      localStorage.removeItem("onboard_contact");
      localStorage.removeItem("onboard_aadharNumber");
      
      navigate({ to: "/onboarding/payment" });
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Tailor Registration"
      subtitle={`Step ${step} of 5 — let's set up your atelier`}
    >
      <Progress step={step} />

      {step === 1 && <StepWork workType={workType} setWorkType={setWorkType} shopName={shopName} setShopName={setShopName} established={established} setEstablished={setEstablished} onNext={next} />}
      {step === 2 && <StepAddress address={address} setAddress={setAddress} onBack={back} onNext={next} />}
      {step === 3 && <StepDocs gstin={gstin} setGstin={setGstin} files={files} setFiles={setFiles} aadharNumber={aadharNumber} setAadharNumber={setAadharNumber} onBack={back} onNext={next} />}
      {step === 4 && <StepContact contact={contact} setContact={setContact} onBack={back} onFinish={finish} isSubmitting={isSubmitting} />}
    </AuthShell>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-1">
          <div
            className={`h-1.5 rounded-full transition-all ${
              i <= step ? "bg-gradient-gold shadow-glow" : "bg-white/10"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function StepWork({ workType, setWorkType, shopName, setShopName, established, setEstablished, onNext }: any) {
  const isValid = workType !== null && shopName.trim() !== "" && established.trim() !== "";

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h2 className="font-display text-xl text-cream">Where do you work from?</h2>
        <p className="text-xs text-cream/60">Choose the setup that best describes your tailoring business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <WorkCard
          active={workType === "shop"}
          onClick={() => setWorkType("shop")}
          icon={<Store className="h-6 w-6" />}
          title="I have a Shop"
          desc="Boutique, storefront, or studio"
        />
        <WorkCard
          active={workType === "home"}
          onClick={() => setWorkType("home")}
          icon={<Home className="h-6 w-6" />}
          title="I work from Home"
          desc="Home-based stitching service"
        />
      </div>

      <div className="space-y-3 mt-2">
         <Floating icon={<Store className="h-4 w-4" />} label="Shop / Atelier Name" value={shopName} onChange={setShopName} />
         <Floating icon={<Building2 className="h-4 w-4" />} label="Established Year (e.g. 2014)" value={established} onChange={setEstablished} />
      </div>

      {workType === "home" && (
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 mt-2">
          <div className="flex items-start gap-3 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <h4 className="text-sm font-medium text-blue-100">Home Atelier Guidelines</h4>
          </div>
          <ul className="text-[11px] text-blue-100/75 space-y-1.5 ml-7 list-disc pr-2">
            <li><strong>Legal & Common:</strong> Operating a home boutique is fully legal. You can use up to 20% of your residential space for professional work.</li>
            <li><strong>Society Rules:</strong> Ensure foot traffic is manageable to comply with standard RWA guidelines and avoid neighbor complaints.</li>
            <li><strong>GST Registration:</strong> GST is NOT required until you cross Rs. 20 Lakhs in annual revenue.</li>
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 flex items-start gap-3 mt-2">
        <Sparkles className="h-4 w-4 text-gold mt-0.5" />
        <p className="text-xs text-cream/80">
          <span className="text-gold font-medium">Join for Free</span> - activation only when your first
          booking arrives.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          disabled={!isValid}
          onClick={onNext}
          className="h-11 px-6 rounded-xl bg-gradient-gold text-navy-deep font-semibold disabled:opacity-40 shadow-glow gap-2"
        >
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepAddress({ address, setAddress, onBack, onNext }: any) {
  const isValid = address.house && address.street && address.area && address.city && address.pin;
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAddress({ ...address, pin: `${latitude.toFixed(4)}Ã‚Â° N, ${longitude.toFixed(4)}Ã‚Â° E` });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Could not get location. Please allow location access.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-cream">Address details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Floating icon={<Building2 className="h-4 w-4" />} label="House / Building" value={address.house} onChange={(v: string) => setAddress({...address, house: v})} />
        <Floating icon={<Navigation className="h-4 w-4" />} label="Street" value={address.street} onChange={(v: string) => setAddress({...address, street: v})} />
        <Floating icon={<MapPin className="h-4 w-4" />} label="Area / Locality" value={address.area} onChange={(v: string) => setAddress({...address, area: v})} />
        <Floating icon={<Map className="h-4 w-4" />} label="City" value={address.city} onChange={(v: string) => setAddress({...address, city: v})} />
        <div className="sm:col-span-2">
           <Floating 
             icon={<MapPin className={`h-4 w-4 ${isLocating ? 'animate-pulse text-emerald-400' : ''}`} />} 
             label="Location Pin (e.g. 19.0620Ã‚Â° N, 72.8273Ã‚Â° E) - Click icon to auto-detect" 
             value={address.pin} 
             onChange={(v: string) => setAddress({...address, pin: v})} 
             onIconClick={handleLocate}
           />
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={!isValid} />
    </div>
  );
}

function StepDocs({ gstin, setGstin, files, setFiles, aadharNumber, setAadharNumber, onBack, onNext }: any) {
  const cleanDigits = aadharNumber.replace(/\D/g, "");
  // All 5 files are now mandatory (id, passport, photo, machine, shop)
  const isValid = gstin.trim() !== "" && files.id && files.passport && files.photo && files.machine && files.shop && cleanDigits.length === 12;

  const handleAadharInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadharNumber(raw);
  };

  const formattedDisplay = cleanDigits.replace(/(\d{4})(?=\d)/g, "$1 ");

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-cream">Verification documents</h2>
      <Floating icon={<FileText className="h-4 w-4" />} label="GSTIN Number" value={gstin} onChange={setGstin} />

      <div className="space-y-3">
        <p className="text-xs text-cream/60 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-gold" /> Aadhaar Card Details</p>
        
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/80 z-10">
            <CreditCard className="h-4 w-4" />
          </span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={14}
            value={formattedDisplay}
            onChange={handleAadharInput}
            placeholder="Enter 12-digit Aadhaar number"
            className="w-full pl-10 pt-5 pb-1 h-14 bg-cream border border-cream/15 text-navy rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50 text-base font-mono tracking-[0.2em] placeholder:text-navy/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
          />
          <label className={`absolute left-10 pointer-events-none text-navy/50 transition-all ${
            cleanDigits.length > 0 ? "top-1.5 text-[10px] tracking-[0.18em] uppercase text-gold" : "top-1/2 -translate-y-1/2 text-sm"
          }`}>
            Aadhaar Number
          </label>
          {cleanDigits.length > 0 && cleanDigits.length < 12 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-amber-600">
              <AlertCircle className="h-3 w-3" /> {12 - cleanDigits.length} more digits
            </span>
          )}
          {cleanDigits.length === 12 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-600">
              <Check className="h-3 w-3" strokeWidth={3} /> Entered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20">
          <Shield className="h-3.5 w-3.5 text-amber-300 shrink-0" />
          <p className="text-[10px] text-amber-200">The 12-digit Aadhaar number will be manually verified by the admin against your uploaded Aadhaar document.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Dropzone label="Aadhaar Document" hint="PDF • max 5MB" icon={<FileText className="h-5 w-5" />}
          file={files.id} onFile={(f) => setFiles({ ...files, id: f })} accept="application/pdf" />
        <Dropzone label="Passport Size Photo" hint="JPG / PNG • Clear Face" icon={<User className="h-5 w-5" />}
          file={files.passport} onFile={(f) => setFiles({ ...files, passport: f })} accept="image/*" />
        <Dropzone label="Tailoring Workspace" hint="JPG / PNG • Your shop" icon={<Camera className="h-5 w-5" />}
          file={files.photo} onFile={(f) => setFiles({ ...files, photo: f })} accept="image/*" />
        <Dropzone label="Sewing Machine" hint="JPG / PNG • Show equipment" icon={<ImageIcon className="h-5 w-5" />}
          file={files.machine} onFile={(f) => setFiles({ ...files, machine: f })} accept="image/*" />
        <Dropzone label="Shop Front" hint="JPG / PNG" icon={<Store className="h-5 w-5" />}
          file={files.shop} onFile={(f) => setFiles({ ...files, shop: f })} accept="image/*" />
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={!isValid} />
    </div>
  );
}

function StepContact({ contact, setContact, onBack, onFinish, isSubmitting }: any) {
  const isValid = contact.email.trim() !== "" && contact.phone.trim() !== "";

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-cream">Contact & Activation</h2>
      <Floating icon={<Mail className="h-4 w-4" />} label="Email for notifications" type="email" value={contact.email} onChange={(v: string) => setContact({...contact, email: v})} />
      <Floating icon={<Phone className="h-4 w-4" />} label="Primary phone number" type="tel" value={contact.phone} onChange={(v: string) => setContact({...contact, phone: v})} />

      <div className="mt-8 relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gold">Freemium Activation</h3>
          </div>
          <p className="text-cream font-display text-lg mt-2 relative">
            Join Tailor Arena today — for free.
          </p>
          <p className="text-cream/80 text-xs mt-2 leading-relaxed relative">
            Pay only <span className="text-gold font-semibold">₹199</span> activation fee when your
            first customer booking arrives. A welcome mail with freemium details will be sent to your email.
          </p>
        </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="text-cream/70 hover:text-cream hover:bg-white/10 rounded-xl gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button disabled={!isValid || isSubmitting} onClick={onFinish} className="h-11 px-6 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2 disabled:opacity-40">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <>Complete Registration <Check className="h-4 w-4" strokeWidth={3} /></>
          )}
        </Button>
      </div>
    </div>
  );
}

function Nav({ onBack, onNext, disabled }: any) {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button variant="ghost" onClick={onBack} className="text-cream/70 hover:text-cream hover:bg-white/10 rounded-xl gap-1">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Button disabled={disabled} onClick={onNext} className="h-11 px-6 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2 disabled:opacity-40">
        Next <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function WorkCard({ active, onClick, icon, title, desc }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-5 rounded-2xl border transition-all group ${
        active
          ? "border-gold bg-gold/10 shadow-glow"
          : "border-white/15 bg-white/5 hover:border-gold/40 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
          active ? "bg-gradient-gold text-navy-deep" : "bg-white/10 text-cream"
        }`}>
          {icon}
        </div>
      </div>
      <p className={`font-display text-lg ${active ? "text-gold" : "text-cream"}`}>{title}</p>
      <p className={`text-xs mt-1 ${active ? "text-gold/70" : "text-cream/60"}`}>{desc}</p>
      {active && (
        <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-gold flex items-center justify-center shadow-glow">
          <Check className="h-3 w-3 text-navy-deep" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function Floating({ icon, label, type = "text", value, onChange, onIconClick }: { icon: React.ReactNode; label: string; type?: string; value?: string; onChange?: (v: string) => void; onIconClick?: () => void }) {
  // If controlled, use value/onChange. Else fallback to internal state (just for safety)
  const isControlled = value !== undefined;
  const [internalV, setInternalV] = useState("");
  const displayV = isControlled ? value : internalV;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlled && onChange) onChange(e.target.value);
    else setInternalV(e.target.value);
  };

  return (
    <div className="relative">
      <span 
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-gold/80 z-10 ${onIconClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={onIconClick}
        title={onIconClick ? "Click to auto-detect" : undefined}
      >
        {icon}
      </span>
      <Input
        type={type}
        value={displayV}
        onChange={handleChange}
        className="peer pl-10 pt-5 pb-1 h-14 bg-cream border-cream/15 text-navy rounded-xl focus-visible:ring-gold/40 focus-visible:border-gold/50 placeholder:text-transparent placeholder-transparent"
        placeholder={label}
        id={label}
      />
      <label
        htmlFor={label}
        className={`absolute left-10 transition-all pointer-events-none text-navy/50 ${
          displayV
            ? "top-1.5 text-[10px] tracking-[0.18em] uppercase text-gold"
            : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:tracking-[0.18em] peer-focus:uppercase peer-focus:text-gold"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function Dropzone({
  label, hint, icon, file, onFile, accept, optional,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  file: File | null;
  onFile: (f: File) => void;
  accept: string;
  optional?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);

  const handle = (f: File) => {
    onFile(f);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); return 100; }
        return p + 12;
      });
    }, 80);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
      onClick={() => ref.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-all ${
        file
          ? "border-gold/60 bg-gold/10"
          : drag
            ? "border-gold bg-gold/20"
            : "border-white/15 bg-white/5 hover:border-gold/40 hover:bg-white/10"
      }`}
    >
      <input
        ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          file ? "bg-gradient-gold text-navy-deep" : "bg-white/10 text-cream"
        }`}>
          {file && progress === 100 ? <Check className="h-5 w-5" strokeWidth={3} /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-start gap-0.5">
            <p className="text-sm text-cream font-medium leading-tight whitespace-normal break-words">{label}</p>
            {optional && <span className="text-[9px] uppercase tracking-wider text-cream/40">Optional</span>}
          </div>
          <p className="text-[11px] text-cream/60 leading-tight whitespace-normal break-words mt-1">
            {file ? file.name : hint}
          </p>
          {file && progress < 100 && (
            <div className="mt-1.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <Upload className="h-4 w-4 text-cream/40" />
      </div>
    </div>
  );
}






