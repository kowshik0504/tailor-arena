import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User, Calendar, Mail, MapPin, Building2, Map, Navigation, Ruler, Heart,
  ArrowLeft, ArrowRight, Check, Sparkles, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/customer-signup")({ component: CustomerSignup });

const STEPS = ["Personal", "Contact", "Measurements", "Review", "Done"];

function CustomerSignup() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "Riya Malhotra", gender: "Female", dob: "1996-04-12",
    address: "Flat 802, Sea Pearl", city: "Mumbai", state: "Maharashtra", pincode: "400050",
    saveMeasurements: true, preferredTailor: "Maison Aarav",
  });

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const finish = () => navigate({ to: "/customer" });

  return (
    <AuthShell
      title={step === 5 ? "Welcome to Tailor Arena" : "Create your atelier profile"}
      subtitle={step === 5 ? "Your luxury wardrobe journey begins." : `Step ${step} of 4 — ${STEPS[step - 1]} details`}
    >
      <Progress step={step} />

      {step === 1 && <Personal data={data} setData={setData} onNext={next} />}
      {step === 2 && <Contact data={data} setData={setData} onBack={back} onNext={next} />}
      {step === 3 && <Measurements data={data} setData={setData} onBack={back} onNext={next} />}
      {step === 4 && <Review data={data} onBack={back} onNext={next} />}
      {step === 5 && <Done onFinish={finish} />}
    </AuthShell>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ${i <= step ? "bg-gradient-gold shadow-glow w-full" : "w-0"}`}
          />
        </div>
      ))}
    </div>
  );
}

function Personal({ data, setData, onNext }: any) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-navy">Personal information</h2>
      <Floating icon={<User className="h-4 w-4" />} label="Full name" value={data.name}
        onChange={(v) => setData({ ...data, name: v })} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField icon={<User className="h-4 w-4" />} label="Gender" value={data.gender}
          options={["Female", "Male", "Other"]} onChange={(v) => setData({ ...data, gender: v })} />
        <Floating icon={<Calendar className="h-4 w-4" />} label="Date of birth" type="date"
          value={data.dob} onChange={(v) => setData({ ...data, dob: v })} />
      </div>
      <NavRow onNext={onNext} />
    </div>
  );
}

function Contact({ data, setData, onBack, onNext }: any) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-navy">Contact information</h2>
      <Floating icon={<Building2 className="h-4 w-4" />} label="Address line" value={data.address}
        onChange={(v) => setData({ ...data, address: v })} />
      <div className="grid grid-cols-2 gap-3">
        <Floating icon={<Map className="h-4 w-4" />} label="City" value={data.city}
          onChange={(v) => setData({ ...data, city: v })} />
        <Floating icon={<Navigation className="h-4 w-4" />} label="State" value={data.state}
          onChange={(v) => setData({ ...data, state: v })} />
      </div>
      <Floating icon={<MapPin className="h-4 w-4" />} label="Pincode" value={data.pincode}
        onChange={(v) => setData({ ...data, pincode: v })} />
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

function Measurements({ data, setData, onBack, onNext }: any) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-navy">Measurement preferences</h2>

      <button
        type="button"
        onClick={() => setData({ ...data, saveMeasurements: !data.saveMeasurements })}
        className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 ${
          data.saveMeasurements ? "border-gold bg-gold/10 shadow-glow" : "border-cream/15 bg-cream"
        }`}
      >
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          data.saveMeasurements ? "bg-gradient-gold text-navy-deep" : "bg-white/10 text-navy"
        }`}>
          <Ruler className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-navy font-medium">Save measurements to my profile</p>
          <p className="text-xs text-navy/60 mt-0.5">Auto-fill every order — no need to re-enter.</p>
        </div>
        <span className={`h-5 w-5 rounded-full flex items-center justify-center transition ${
          data.saveMeasurements ? "bg-gold" : "border border-cream/30"
        }`}>
          {data.saveMeasurements && <Check className="h-3 w-3 text-navy-deep" strokeWidth={3} />}
        </span>
      </button>

      <Floating icon={<Heart className="h-4 w-4" />} label="Preferred tailor (optional)"
        value={data.preferredTailor} onChange={(v) => setData({ ...data, preferredTailor: v })} />

      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

function Review({ data, onBack, onNext }: any) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-navy">Account review</h2>
      <div className="rounded-2xl border border-gold/30 bg-cream divide-y divide-cream/10">
        <Row label="Name" value={data.name} />
        <Row label="Gender · DOB" value={`${data.gender} · ${data.dob}`} />
        <Row label="Address" value={`${data.address}, ${data.city}, ${data.state} ${data.pincode}`} />
        <Row label="Measurements" value={data.saveMeasurements ? "Will be saved to profile" : "Not saved"} />
        <Row label="Preferred tailor" value={data.preferredTailor || "—"} />
      </div>
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-gold mt-0.5" />
        <p className="text-xs text-navy/80">
          By creating your account you agree to our terms & privacy policy. Your data is encrypted end-to-end.
        </p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack} className="text-navy/70 hover:text-navy hover:bg-cream rounded-xl gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="h-11 px-6 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2">
          Create my account <Check className="h-4 w-4" strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}

function Done({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow animate-scale-in">
        <Check className="h-10 w-10 text-navy-deep" strokeWidth={3} />
      </div>
      <h3 className="font-display text-2xl text-navy mt-5">You're in.</h3>
      <p className="text-navy/70 text-sm mt-2">Your perfect stitch starts here.</p>
      <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full border border-gold/40 bg-gold/10">
        <Sparkles className="h-3 w-3 text-gold" />
        <span className="text-[11px] text-gold uppercase tracking-[0.22em]">Atelier Member</span>
      </div>
      <Button onClick={onFinish} className="mt-6 h-12 px-7 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2 group">
        Enter your wardrobe <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-[11px] uppercase tracking-[0.18em] text-navy/50">{label}</span>
      <span className="text-navy font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function NavRow({ onBack, onNext }: { onBack?: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} className="text-navy/70 hover:text-navy hover:bg-cream rounded-xl gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      ) : <span />}
      <Button onClick={onNext} className="h-11 px-6 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2">
        Next <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Floating({
  icon, label, type = "text", value, onChange,
}: {
  icon: React.ReactNode; label: string; type?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/80">{icon}</span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer pl-10 pt-5 pb-1 h-14 bg-cream border-cream/15 text-navy rounded-xl focus-visible:ring-gold/40 focus-visible:border-gold/50 placeholder-transparent"
        placeholder={label}
        id={label}
      />
      <label
        htmlFor={label}
        className={`absolute left-10 transition-all pointer-events-none ${
          value ? "top-1.5 text-[10px] tracking-[0.18em] uppercase text-gold"
                : "top-1/2 -translate-y-1/2 text-sm text-navy/50"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function SelectField({
  icon, label, value, options, onChange,
}: { icon: React.ReactNode; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/80 z-10">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 pl-10 pr-3 pt-5 pb-1 bg-cream border border-cream/15 text-navy rounded-xl focus:outline-none focus:border-gold/50 appearance-none"
      >
        {options.map((o) => <option key={o} value={o} className="bg-navy-deep">{o}</option>)}
      </select>
      <label className="absolute left-10 top-1.5 text-[10px] tracking-[0.18em] uppercase text-gold pointer-events-none">
        {label}
      </label>
    </div>
  );
}






