import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail, Lock, ArrowRight, ArrowLeft, Check, EyeOff, Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

type Step = "email" | "otp" | "reset" | "success";

function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("otp");
    } catch (err) {
      alert("Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    setOtp(otpValue);
    setLoading(true);
    try {
      await verifyResetOtp(email, otpValue);
      setStep("reset");
    } catch (err) {
      alert("Invalid OTP or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email, password);
      setStep("success");
    } catch (err) {
      alert("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        step === "email" ? "Forgot Password" :
        step === "otp" ? "Verify OTP" :
        step === "reset" ? "Reset Password" : "Password Reset"
      }
      subtitle={
        step === "email" ? "Enter your email to receive a reset code." :
        step === "otp" ? `We sent a code to ${email}` :
        step === "reset" ? "Enter your new password below." : "Your password has been successfully updated."
      }
      footer={
        step !== "success" && (
          <span>
            Remember your password?{" "}
            <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </span>
        )
      }
    >
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <Field icon={<Mail className="h-4 w-4" />} label="Email">
            <Input 
              type="email" required placeholder="you@atelier.com" className={inputCls} 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2 group">
            {loading ? "Sending..." : "Send Reset Code"}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <OtpStep onVerify={handleVerifyOtp} loading={loading} onBack={() => setStep("email")} />
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <Field icon={<Lock className="h-4 w-4" />} label="New Password">
            <PasswordField value={password} onChange={setPassword} />
          </Field>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow gap-2 group">
            {loading ? "Resetting..." : "Reset Password"}
            {!loading && <Check className="h-4 w-4" />}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center py-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow animate-scale-in">
            <Check className="h-10 w-10 text-navy-deep" strokeWidth={3} />
          </div>
          <p className="text-navy mt-6 font-display text-lg">Password Updated</p>
          <Link to="/login">
            <Button className="mt-8 w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow">
              Sign in now
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

function PasswordField({ value, onChange }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input 
        type={show ? "text" : "password"} required placeholder="••••••••" className={`${inputCls} pr-10`} 
        value={value} onChange={(e) => onChange(e.target.value)} 
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60 hover:text-gold transition">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function OtpStep({ onVerify, loading, onBack }: any) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-2">
        {code.map((c, i) => (
          <input
            key={i} ref={(el) => { inputs.current[i] = el; }}
            value={c} onChange={(e) => setChar(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            inputMode="numeric" maxLength={1}
            className="h-14 w-12 text-center text-2xl font-display text-navy bg-cream border border-cream/15 rounded-xl focus:outline-none focus:border-gold transition"
          />
        ))}
      </div>
      <Button
        disabled={!ready || loading}
        onClick={() => onVerify(full)}
        className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-semibold shadow-glow"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
      <button onClick={onBack} className="w-full text-center text-xs text-navy/60 hover:text-gold flex items-center justify-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Change email
      </button>
    </div>
  );
}

const inputCls = "bg-background border-cream/15 text-navy placeholder:text-navy/40 h-11 rounded-xl focus-visible:ring-gold/40";

function Field({ icon, label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-navy/60">
        <span className="text-gold">{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}






