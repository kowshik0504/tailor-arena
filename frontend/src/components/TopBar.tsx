import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Search, Bell, LogOut, Crown, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { roleFromPath, roleMeta } from "@/lib/role";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = roleFromPath(pathname);
  const meta = roleMeta[role];
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getStorageKey = () => role === "admin" ? "admin_notifications" : role === "tailor" ? "tailor_notifications" : "customer_notifications";

  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) return JSON.parse(cached);
    }
    
    // Default system alerts for admin if none exist
    if (role === "admin") {
      return [
        { title: "New tailor registration", message: "Maison Aarav (Mumbai) — awaiting initial review", time: "8m", read: false, type: "verification" },
        { title: "Verification request", message: "Studio Kavya uploaded GST & shop photos", time: "1h", read: false, type: "verification" },
        { title: "Suspicious activity", message: "Multiple chargebacks on TX-9817 — House of Couture", time: "2h", read: false, type: "alert" },
        { title: "Payment failure", message: "Subscription renewal failed for 6 tailors", time: "3h", read: false, type: "alert" },
        { title: "Freemium expiring", message: "5 freemium tailor trials end today", time: "Today", read: false, type: "alert" }
      ];
    }
    return [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) setNotifications(JSON.parse(cached));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [role]);

  const markAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const accountName = user?.name || (role === "admin" ? "Super Admin" : role === "customer" ? "Riya Malhotra" : "Aarav Kapoor");
  const initials = accountName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const signOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isHome = pathname === meta.homePath || pathname === meta.homePath + "/";

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50">
      <div className="flex items-center gap-4 px-6 py-3">
        <SidebarTrigger className="text-muted-foreground" />
        
        {!isHome && (
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/40 hover:bg-secondary text-navy transition-colors border border-border/60 shadow-sm"
            title="Go Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="hidden md:flex items-center gap-3">
          <div className="md:hidden lg:flex h-9 w-9 rounded-xl bg-cream gold-border items-center justify-center shadow-luxe">
            <Logo size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl text-navy leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="pl-9 w-64 bg-background/60 border-border/60 rounded-full h-9"
            />
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-navy text-[10px] uppercase tracking-[0.22em]">
            <Crown className="h-3 w-3 text-gold" />
            {meta.label}
          </div>

          <DropdownMenu onOpenChange={(open) => { if(!open) markAsRead(); }}>
            <DropdownMenuTrigger asChild>
              <button className="relative h-9 w-9 rounded-full bg-secondary/70 flex items-center justify-center border border-border/60 hover:bg-accent transition">
                <Bell className="h-4 w-4 text-navy" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse border border-cream" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl w-80 p-0 overflow-hidden border-gold/40 shadow-luxe">
              <div className="bg-gradient-soft border-b border-gold/20 px-4 py-3 flex items-center justify-between">
                <p className="font-display text-navy text-sm">Notifications</p>
                {unreadCount > 0 && <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-mocha/70 text-sm">No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} onClick={() => { 
                      markAsRead(); 
                      if (role === "admin") {
                        navigate({ to: n.type === "verification" ? "/admin/verifications" : "/admin/notifications" });
                      } else {
                        navigate({ to: role === 'customer' ? `/customer/order/${n.orderId}` : `/order/${n.orderId}` }); 
                      }
                    }} className={`p-4 border-b border-gold/10 hover:bg-gold/5 transition cursor-pointer ${!n.read ? 'bg-gold/10' : 'bg-white'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-navy">{n.title}</p>
                        <span className="text-[10px] text-mocha shrink-0 ml-4">{n.time}</span>
                      </div>
                      <p className="text-xs text-mocha whitespace-pre-wrap">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-gradient-gold gold-border flex items-center justify-center text-xs font-semibold text-navy-deep shadow-luxe">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-1.5">
              <DropdownMenuLabel className="text-navy">
                <p className="font-display text-sm leading-tight">{accountName}</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-mocha/70 mt-0.5">{meta.label}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to={role === "customer" ? "/customer/profile" : role === "admin" ? "/admin/settings" : "/settings"}>
                  Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="rounded-xl cursor-pointer text-rose-700 focus:text-rose-700 gap-2">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function PageShell({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} />
      <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">{children}</div>
    </>
  );
}





