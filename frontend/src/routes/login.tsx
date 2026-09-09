import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShoppingBag,
  Scissors,
  ShieldCheck,
  Loader2,
  UserCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import { roleHomePath } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { Role } from "@/lib/role";

export const Route = createFileRoute("/login")({ component: Login });

const roleOptions: {
  value: Role;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "customer",
    title: "Customer",
    desc: "Book your perfect stitch",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    value: "tailor",
    title: "Tailor",
    desc: "Run your atelier",
    icon: <Scissors className="h-4 w-4" />,
  },
  {
    value: "admin",
    title: "Admin",
    desc: "Platform control",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

type DetectionState = "idle" | "checking" | "found" | "not-found" | "error";

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [otp, setOtp] = useState("");
  const [trustDevice, setTrustDevice] = useState<boolean | null>(null);

  // Role detection state
  const [detectedRole, setDetectedRole] = useState<Role | null>(null);
  const [detectedName, setDetectedName] = useState<string>("");
  const [detectionState, setDetectionState] = useState<DetectionState>("idle");
  const [emailError, setEmailError] = useState("");

  const { login, verify2FALogin } = useAuth();
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // ── Auto-detect role when email changes (debounced 600ms) ──────────────────
  useEffect(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      setDetectedRole(null);
      setDetectedName("");
      setDetectionState("idle");
      setEmailError("");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDetectionState("checking");
    setEmailError("");

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/auth/check-role", {
          params: { email },
        });
        setDetectedRole(data.role as Role);
        setDetectedName(data.name ?? "");
        setDetectionState("found");
        setEmailError("");
      } catch (err: any) {
        setDetectedRole(null);
        setDetectedName("");
        if (err?.response?.status === 404) {
          setDetectionState("not-found");
          setEmailError("No account found with this email.");
        } else {
          setDetectionState("error");
          setEmailError("Could not verify email. Try again.");
        }
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  useEffect(() => {
    emailRef.current?.focus();
  }, [step]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      if (step === "login") {
        const res = await login(email, password);
        if (res.require2FA) {
          setStep("2fa");
          setLoginError("");
        } else {
          navigate({ to: roleHomePath[res.role as Role] });
        }
      } else if (step === "2fa") {
        if (trustDevice === null) return;
        const user = await verify2FALogin(email, otp, trustDevice);
        navigate({ to: roleHomePath[user.role as Role] });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed. Please check your credentials.";
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your Tailor Arena journey."
      footer={
        <span>
          New to Tailor Arena?{" "}
          <Link to="/signup" className="text-gold hover:underline font-medium">
            Create account
          </Link>
        </span>
      }
    >
      {step === "2fa" ? (
        <form onSubmit={onSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-display text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-cream/70">
              We've sent a 6-digit code to your registered email (or WhatsApp).
            </p>
          </div>

          <Field icon={<Lock className="h-4 w-4" />} label="Verification Code">
            <Input
              type="text"
              required
              placeholder="123456"
              className="w-full bg-navy border-gold/20 text-cream h-12 pl-10 focus-visible:ring-gold/50 rounded-xl transition-all text-center tracking-[0.5em] font-display text-lg"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Field>

          <div className="mt-4 p-3 rounded-xl border border-gold/20 bg-gold/5 space-y-3">
            <p className="text-xs text-cream/80 leading-relaxed">
              Do you want to trust this device for 30 days? You won't need an OTP when logging in from this browser.
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-cream cursor-pointer group">
                <input
                  type="radio"
                  name="trustDevice"
                  checked={trustDevice === true}
                  onChange={() => setTrustDevice(true)}
                  className="accent-gold h-4 w-4"
                />
                <span className="group-hover:text-gold transition">Yes, trust device</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-cream cursor-pointer group">
                <input
                  type="radio"
                  name="trustDevice"
                  checked={trustDevice === false}
                  onChange={() => setTrustDevice(false)}
                  className="accent-gold h-4 w-4"
                />
                <span className="group-hover:text-gold transition">No, ask every time</span>
              </label>
            </div>
          </div>

          {loginError && (
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs animate-in fade-in duration-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              {loginError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setStep("login")}
              className="h-12 w-1/3 rounded-xl bg-white/5 hover:bg-white/10 text-cream"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading || otp.length < 6 || trustDevice === null}
              className="h-12 w-2/3 rounded-xl bg-gradient-gold text-navy-deep font-semibold hover:opacity-95 shadow-glow gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign in"}
            </Button>
          </div>
        </form>
      ) : (
      <form onSubmit={onSubmit} className="space-y-5 animate-in slide-in-from-left-4 duration-300">
        {/* ── Email ── */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cream/50">
            <span className="text-gold">
              <Mail className="h-4 w-4" />
            </span>
            Email
          </label>
          <div className="relative">
            <Input
              type="email"
              required
              placeholder="you@atelier.com"
              className={`${inputCls} pr-10`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            {/* Detection spinner / icon */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {detectionState === "checking" && (
                <Loader2 className="h-4 w-4 text-gold/60 animate-spin" />
              )}
              {detectionState === "found" && (
                <UserCheck className="h-4 w-4 text-emerald-400" />
              )}
              {(detectionState === "not-found" || detectionState === "error") && (
                <AlertCircle className="h-4 w-4 text-rose-400" />
              )}
            </span>
          </div>

          {/* Email status */}
          {detectionState === "found" && detectedRole && (
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="inline-flex items-center gap-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                <UserCheck className="h-3 w-3" />
                Registered as{" "}
                <strong className="capitalize">{detectedRole}</strong>
                {detectedName ? ` · ${detectedName}` : ""}
              </span>
            </p>
          )}
          {emailError && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 animate-in fade-in duration-150">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {emailError}
            </p>
          )}
        </div>

        {/* ── Password ── */}
        <Field icon={<Lock className="h-4 w-4" />} label="Password">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              required
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60 hover:text-gold transition"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {/* ── Sign in as — auto-detected role cards ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cream/40">
              Sign in as
            </p>
          </div>

          <div className={`grid gap-2 ${detectionState === 'found' ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {roleOptions.map((r) => {
              const isActive = detectedRole === r.value;
              
              // If an account is found, ONLY show the matching role.
              if (detectionState === "found" && !isActive) {
                return null;
              }

              // If no account is found, show them but make them dimmed and unclickable.
              const isLocked = detectionState === "not-found" || detectionState === "error";
              
              // Default state when idle/typing
              const isIdle = detectionState === "idle" || detectionState === "checking";

              return (
                <div
                  key={r.value}
                  className={`
                    relative text-left p-3 rounded-xl border transition-all duration-250
                    ${isActive
                      ? "border-gold bg-gold/10 shadow-[0_0_18px_rgba(212,175,55,0.28)]"
                      : isLocked
                      ? "border-white/5 bg-white/5 opacity-40 grayscale"
                      : isIdle
                      ? "border-white/10 bg-white/5 opacity-70"
                      : "border-white/10 bg-white/5"
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-250 ${
                      isActive
                        ? "bg-gradient-to-br from-gold to-amber-500 text-navy-deep shadow-sm"
                        : "bg-white/10 text-cream"
                    }`}
                  >
                    {r.icon}
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-display transition-colors duration-250 ${
                        isActive ? "text-gold" : "text-cream"
                      }`}
                    >
                      {r.title}
                    </p>
                    
                    {/* Selected checkmark */}
                    {isActive && (
                      <span className="bg-gold text-navy-deep rounded-full w-4 h-4 flex items-center justify-center shadow animate-in zoom-in-50 duration-200">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Desc */}
                  <p className="text-[10px] text-cream/50 leading-tight mt-0.5">
                    {r.desc}
                  </p>

                  {/* Auto-detected pill (only when selected via auto-detect) */}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-500/80 text-white text-[8px] font-bold px-1.5 py-px rounded-full uppercase tracking-wide whitespace-nowrap animate-in fade-in duration-300">
                      Auto-detected
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Helper text */}
          {!isEmailValid && (
            <p className="text-[10px] text-cream/30 mt-2 text-center animate-in fade-in">
              Role will be automatically selected based on your email.
            </p>
          )}
        </div>

        {/* ── Remember / Forgot ── */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-cream/70 cursor-pointer group">
            <input
              type="checkbox"
              className="accent-gold h-3.5 w-3.5 rounded-sm border-white/20 bg-white/5"
            />
            <span className="group-hover:text-cream transition">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            title="Forgot password?"
            className="text-gold/80 hover:text-gold transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* ── Login error banner ── */}
        {loginError && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            {loginError}
          </div>
        )}

        {/* ── Submit ── */}
        <Button
          type="submit"
          disabled={loading || detectionState === "not-found"}
          className="w-full h-12 rounded-xl bg-gradient-gold text-navy-deep font-semibold hover:opacity-95 shadow-glow gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              {detectedRole && (
                <span className="capitalize opacity-70 text-sm font-normal">
                  as {detectedRole}
                </span>
              )}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </>
          )}
        </Button>
      </form>
      )}
    </AuthShell>
  );
}

const inputCls =
  "bg-white/5 border-white/10 text-cream placeholder:text-white/30 h-11 rounded-xl focus-visible:ring-gold/40 focus:bg-white/10 transition-all";

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cream/50">
        <span className="text-gold">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
