import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye, EyeOff, User, Mail, Lock, ArrowRight, ShoppingBag, Scissors, ArrowLeft, Check,
} from "lucide-react";
import { roleHomePath } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/role";


export const Route = createFileRoute("/signup")({ component: Signup });

type Step = "form" | "otp";

function Signup() {
  const [step, setStep] = useState<Step>("form");
  const [role, setRole] = useState<Role>("tailor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendOtp } = useAuth();

  const handleSendOtp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(name, email, password, role);
      setStep("otp");
    } catch (err) {
      alert("Failed to send OTP. User might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return step === "form" ? (
    <SignupForm 
      role={role} setRole={setRole} 
      name={name} setName={setName}
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
      loading={loading}
      onSend={handleSendOtp} 
    />
  ) : (
    <OtpStep role={role} email={email} onBack={() => setStep("form")} />
  );
}

function SignupForm({
  role, setRole, name, setName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, loading, onSend,
}: any) {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Tailor Arena — the premium operating system for ateliers."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="space-y-5">
        <Field icon={<User className="h-4 w-4" />} label="Full name">
          <Input required placeholder="Aarav Kapoor" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field icon={<Mail className="h-4 w-4" />} label="Email">
          <Input required type="email" placeholder="you@atelier.com" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field icon={<Lock className="h-4 w-4" />} label="Password">
            <div className="relative">
              <Input required type={show ? "text" : "password"} placeholder="••••••••" className={`${inputCls} pr-9`} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60 hover:text-gold">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field icon={<Lock className="h-4 w-4" />} label="Confirm">
            <div className="relative">
              <Input required type={show2 ? "text" : "password"} placeholder="••••••••" className={`${inputCls} pr-9`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" onClick={() => setShow2(!show2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60 hover:text-gold">
                {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cream/50 mb-3">I am joining as</p>
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              active={role === "customer"}
              onClick={() => setRole("customer")}
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Customer"
              desc="Book outfits & track stitching"
            />
            <RoleCard
              active={role === "tailor"}
              onClick={() => setRole("tailor")}
              icon={<Scissors className="h-5 w-5" />}
              title="Tailor"
              desc="Run your atelier digitally"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-bold shadow-glow hover:opacity-95 gap-2 group transition-all duration-300 active:scale-[0.98]">
          {loading ? "Sending..." : "Send OTP"}
          {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />}
        </Button>
      </form>
    </AuthShell>
  );
}

function OtpStep({ role, email, onBack }: { role: Role; email: string; onBack: () => void }) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setChar = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const full = code.join("");
  const ready = full.length === 6;

  const handleVerify = async () => {
    setLoading(true);
    try {
      const user = await verifyOtp(email, full);
      setVerified(true);
      setTimeout(() => {
        if (user.role === "tailor") navigate({ to: "/onboarding" });
        else navigate({ to: "/customer-signup" });
      }, 1100);
    } catch (err) {
      alert("Invalid OTP or expired.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthShell
      title={verified ? "Verified" : "Verify your email"}
      subtitle={verified ? "Redirecting you to the next step…" : "We sent a 6-digit code to your inbox."}
    >
      {!verified ? (
        <div className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                value={c}
                onChange={(e) => setChar(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-12 sm:w-12 text-center text-2xl font-display text-cream bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-gold focus:bg-white/10 transition-all shadow-inner"
              />
            ))}
          </div>

          <Button
            disabled={!ready || loading}
            onClick={handleVerify}
            className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-bold disabled:opacity-50 shadow-glow transition-all active:scale-[0.98]"
          >
            {loading ? "Verifying..." : "Verify & continue"}
          </Button>

          <div className="flex items-center justify-between text-xs text-cream/50">
            <button onClick={onBack} className="flex items-center gap-1 hover:text-gold transition">
              <ArrowLeft className="h-3 w-3" /> Edit details
            </button>
            {seconds > 0 ? (
              <span>Resend in <span className="text-gold">0:{seconds.toString().padStart(2, "0")}</span></span>
            ) : (
              <button onClick={() => setSeconds(45)} className="text-gold hover:underline">Resend code</button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow animate-scale-in">
            <Check className="h-10 w-10 text-navy-deep" strokeWidth={3} />
          </div>
          <p className="text-cream mt-6 font-display text-xl tracking-wide">All set</p>
        </div>
      )}
    </AuthShell>
  );
}

const inputCls =
  "bg-white/5 border-white/10 text-cream placeholder:text-white/20 h-11 rounded-xl focus-visible:ring-gold/40 focus:bg-white/10 transition-all";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cream/50">
        <span className="text-gold">{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, desc }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-2xl border transition-all duration-300 ${
        active
          ? "border-gold bg-gold/10 shadow-glow"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-gradient-gold text-navy-deep shadow-glow" : "bg-white/10 text-cream"}`}>
        {icon}
      </div>
      <p className={`font-display text-base tracking-wide ${active ? "text-gold" : "text-cream"}`}>{title}</p>
      <p className="text-[11px] text-cream/40 mt-1 leading-tight">{desc}</p>
      {active && (
        <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-gold flex items-center justify-center shadow-sm">
          <Check className="h-3 w-3 text-navy-deep" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}






