import { useEffect, useState } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { roleFromPath } from "@/lib/role";
import { roleHomePath } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Logo } from "./Logo";

// Routes accessible without a role (auth/onboarding flows)
const PUBLIC_PREFIXES = ["/", "/customer/discover", "/login", "/signup", "/onboarding", "/customer-signup", "/forgot-password"];

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const requiredRole = roleFromPath(pathname);

  useEffect(() => {
    if (!mounted || isPublic || loading) return;
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [mounted, isPublic, user, loading, navigate]);

  if (!mounted || loading) return <>{children}</>;
  if (isPublic) return <>{children}</>;
  if (!user) return null;

  if (role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-6">
        <div className="max-w-md w-full bg-cream rounded-3xl shadow-luxe gold-border p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-glow">
            <Logo size={32} />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-[10px] uppercase tracking-[0.22em]">
            <ShieldAlert className="h-3 w-3" /> Access denied
          </div>
          <h1 className="font-display text-2xl text-navy mt-4">This area isn't part of your portal</h1>
          <p className="text-sm text-mocha mt-2">
            You're signed in as <span className="font-semibold text-navy capitalize">{role}</span>. Head back to your dashboard to continue.
          </p>
          <Link
            to={role ? roleHomePath[role] : "/"}
            className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-xl bg-gradient-navy text-navy font-medium shadow-navy hover:opacity-95 transition"
          >
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}





