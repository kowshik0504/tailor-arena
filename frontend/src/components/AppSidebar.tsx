import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Ruler, Scissors, Sparkles,
  CalendarDays, Bell, BarChart3, Settings, LogOut,
  Compass, Heart, ShoppingBag, CircleUser, ShieldCheck, IndianRupee,
  FileCheck, UserCog, Crown, Zap, ClipboardList, RefreshCw, CreditCard,
  MessageCircle, Image as ImageIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";
import { roleFromPath, roleMeta, type Role } from "@/lib/role";
import { useAuth } from "@/context/AuthContext";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type Section = { label: string; items: Item[] };

const tailorMenu: Section[] = [
  {
    label: "Business",
    items: [
      { title: "Appointments", url: "/appointments", icon: CalendarDays },
      { title: "Messages", url: "/chat", icon: MessageCircle },
      { title: "Wallet", url: "/wallet", icon: IndianRupee },
      { title: "Availability", url: "/availability", icon: Zap },
    ],
  },
  {
    label: "Workshop",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", url: "/orders", icon: Scissors },
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Measurements", url: "/measurements", icon: Ruler },
      { title: "Design Catalog", url: "/catalog", icon: Sparkles },
      { title: "Portfolio", url: "/portfolio", icon: ImageIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

const customerMenu: Section[] = [
  {
    label: "Discover",
    items: [
      { title: "Dashboard", url: "/customer", icon: LayoutDashboard },
      { title: "Discover Tailors", url: "/customer/discover", icon: Compass },
      { title: "Saved Tailors", url: "/customer/saved", icon: Heart },
    ],
  },
  {
    label: "My Wardrobe",
    items: [
      { title: "My Bookings", url: "/customer/orders", icon: ShoppingBag },
      { title: "Measurements", url: "/customer/measurements", icon: Ruler },
      { title: "Chat", url: "/customer/chat", icon: MessageCircle },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", url: "/customer/notifications", icon: Bell },
      { title: "Profile", url: "/customer/profile", icon: CircleUser },
      { title: "Settings", url: "/customer/settings", icon: Settings },
    ],
  },
];

const adminMenu: Section[] = [
  {
    label: "Command",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Verifications", url: "/admin/verifications", icon: FileCheck },
      { title: "Registrations", url: "/admin/registrations", icon: UserCog },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "User Directory", url: "/admin/users", icon: Users },
      { title: "Change Requests", url: "/admin/change-requests", icon: RefreshCw },
      { title: "Reports", url: "/admin/reports", icon: BarChart3 },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const menuByRole: Record<Role, Section[]> = {
  tailor: tailorMenu,
  customer: customerMenu,
  admin: adminMenu,
};


export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = roleFromPath(pathname);
  const sections = menuByRole[role];
  const meta = roleMeta[role];
  const navigate = useNavigate();
  const { logout } = useAuth();
  const signOut = () => { logout(); navigate({ to: "/login" }); };


  const isActive = (p: string) => {
    if (p === meta.homePath) return pathname === p;
    return pathname === p || pathname.startsWith(p + "/");
  };

  // Distinct sidebar surface per role
  const surface =
    role === "admin"
      ? "bg-cream"
      : role === "customer"
        ? "bg-gradient-soft"
        : "bg-gradient-cream";

  const groupLabelCls =
    "text-[10px] uppercase tracking-[0.28em] text-mocha/60 font-medium px-3";

  return (
    <Sidebar collapsible="icon" className={`border-r border-border/60 ${surface}`}>
      <SidebarHeader className="px-3 py-4 border-b border-border/60">
        <div className="flex items-center gap-3 px-1">
          <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-luxe bg-cream gold-border">
            <Logo size={30} />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base tracking-[0.12em] uppercase text-navy">
              Tailor Arena
            </span>
            <span className="text-[9px] uppercase tracking-[0.32em] text-mocha/70">
              Precision · Style · Stitching
            </span>
          </div>
        </div>
        <div className={`mt-3 mx-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.22em] w-fit ${meta.chipBg} group-data-[collapsible=icon]:hidden`}>
          <Crown className="h-2.5 w-2.5" />
          {meta.label}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className={groupLabelCls}>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="rounded-xl h-10 px-3 transition-all
                          data-[active=true]:bg-gradient-gold
                          data-[active=true]:text-navy-deep
                          data-[active=true]:font-semibold
                          data-[active=true]:shadow-glow
                          data-[active=true]:border data-[active=true]:border-gold
                          text-navy/85 hover:bg-champagne/60 hover:text-navy-deep"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 ${active ? "text-navy-deep" : "text-navy/70"}`} />
                          <span className={`text-sm ${active ? "text-navy-deep" : "text-navy/90"}`}>{item.title}</span>
                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-navy-deep" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2 border-t border-border/60">
        <div className={`rounded-2xl p-4 shadow-navy group-data-[collapsible=icon]:hidden ${
          role === "admin" ? "bg-gradient-gold text-navy-deep" : "bg-gradient-navy text-cream"
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-4 w-4 ${role === "admin" ? "text-navy-deep" : "text-gold"}`} />
            <p className="text-xs font-semibold tracking-wide">
              {role === "admin" ? "Super Admin" : role === "customer" ? "Atelier Member" : "Atelier Pro"}
            </p>
          </div>
          <p className={`text-[11px] mt-1 ${role === "admin" ? "text-navy-deep/80" : "opacity-80"}`}>
            {role === "admin"
              ? "Full platform control. All permissions enabled."
              : role === "customer"
                ? "Save measurements, follow tailors, track every fitting."
                : "Unlock unlimited orders, fabric inventory & analytics."}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition w-full text-left text-muted-foreground hover:text-navy"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </button>

      </SidebarFooter>
    </Sidebar>
  );
}





