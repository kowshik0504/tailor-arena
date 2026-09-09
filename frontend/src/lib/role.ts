export type Role = "tailor" | "customer" | "admin";

export function roleFromPath(pathname: string): Role {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/customer" || pathname.startsWith("/customer/")) return "customer";
  return "tailor";
}

export const roleMeta: Record<
  Role,
  {
    label: string;
    welcome: string;
    accent: string; // tailwind text class
    chipBg: string;
    homePath: string;
  }
> = {
  tailor: {
    label: "Tailor Workshop",
    welcome: "Crafting Excellence, One Stitch at a Time.",
    accent: "text-gold",
    chipBg: "bg-gold/10 border-gold/40 text-gold",
    homePath: "/",
  },
  customer: {
    label: "Luxury Marketplace",
    welcome: "Your Perfect Stitch Starts Here.",
    accent: "text-gold",
    chipBg: "bg-rose/20 border-rose/50 text-terracotta",
    homePath: "/customer",
  },
  admin: {
    label: "Executive Command",
    welcome: "Manage. Monitor. Grow.",
    accent: "text-gold",
    chipBg: "bg-navy-deep/20 border-gold/50 text-gold",
    homePath: "/admin/dashboard",
  },
};
