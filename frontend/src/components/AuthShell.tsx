import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export function AuthShell({
  title, subtitle, children, footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-navy-deep px-4 py-10">
      {/* Background imagery */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.22] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80')",
          filter: "blur(2px) saturate(0.85)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-navy-deep/70" style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 265 / 0.85), oklch(0.15 0.06 265 / 0.92))" }} />
      {/* Gold orbs */}
      <div aria-hidden className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-3xl bg-cream/95 gold-border flex items-center justify-center shadow-glow animate-scale-in">
            <Logo size={62} />
          </div>
          <h1 className="font-display text-4xl text-cream mt-6 text-center tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-cream/70 mt-2 text-center max-w-sm font-sans tracking-wide">{subtitle}</p>
          )}
        </div>

        <div className="glass-dark rounded-[2rem] p-8 shadow-navy relative overflow-hidden group transition-all duration-500 hover:shadow-glow/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </div>

        {footer && (
          <div className="text-center text-sm text-cream/80 mt-6">{footer}</div>
        )}

        <div className="flex items-center justify-center gap-1 mt-8 text-[11px] text-cream/30 uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-gold transition">Back to site</Link>
          <span className="opacity-50">·</span>
          <span>© Tailor Arena</span>
        </div>
      </div>
    </div>
  );
}





