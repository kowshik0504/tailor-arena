import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type U = {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Tailor";
  plan: "Freemium" | "Pro" | "Elite" | "Basic";
  city: string;
  joined: string;
  status: "Active" | "Expired" | "Suspended";
};

const data: U[] = [
  { id: "U-10241", name: "Riya Malhotra", email: "riya.m@gmail.com", role: "Customer", plan: "Freemium", city: "Delhi", joined: "Jun 2026", status: "Active" },
  { id: "U-10240", name: "Maison Aarav", email: "aarav@maison.in", role: "Tailor", plan: "Elite", city: "Mumbai", joined: "Apr 2025", status: "Active" },
  { id: "U-10239", name: "Aanya Kapoor", email: "aanya.k@outlook.com", role: "Customer", plan: "Freemium", city: "Pune", joined: "May 2026", status: "Active" },
  { id: "U-10238", name: "Studio Kavya", email: "hello@kavya.co", role: "Tailor", plan: "Pro", city: "Delhi", joined: "Mar 2025", status: "Active" },
  { id: "U-10237", name: "Dev Patel", email: "dev@atelier.in", role: "Tailor", plan: "Basic", city: "Bangalore", joined: "Jan 2025", status: "Expired" },
  { id: "U-10236", name: "Sana Iyer", email: "sana.iyer@gmail.com", role: "Customer", plan: "Freemium", city: "Chennai", joined: "Jun 2026", status: "Expired" },
  { id: "U-10235", name: "House of Couture", email: "info@houseofcouture.in", role: "Tailor", plan: "Elite", city: "Jaipur", joined: "Feb 2025", status: "Suspended" },
];

const planTint: Record<string, string> = {
  Freemium: "bg-champagne text-navy",
  Basic: "bg-secondary text-secondary-foreground",
  Pro: "bg-gradient-navy text-cream",
  Elite: "bg-gradient-gold text-navy-deep",
};
const statusTint: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800",
  Expired: "bg-gold/20 text-navy-deep",
  Suspended: "bg-rose-100 text-rose-700",
};

function AdminUsers() {
  const [role, setRole] = useState<"All" | "Tailor" | "Customer">("All");
  const [q, setQ] = useState("");
  const filtered = data.filter(
    (u) =>
      (role === "All" || u.role === role) &&
      (q === "" || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PageShell title="User Directory" subtitle="Every customer and tailor on Tailor Arena.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total users" value="14,820" tint="bg-gradient-navy text-cream" />
        <Stat label="Active tailors" value="2,140" tint="bg-gradient-gold text-navy-deep" />
        <Stat label="Active customers" value="12,418" tint="bg-gradient-cream text-navy" />
        <Stat label="Suspended" value="14" tint="bg-rose-100 text-rose-800" />
      </div>

      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">All users</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="h-4 w-4 text-mocha absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or email"
                className="pl-9 h-9 w-64 rounded-full bg-cream border-gold/60"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-full bg-cream border border-gold/60">
              {(["All", "Tailor", "Customer"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                    role === r ? "bg-gradient-navy text-cream" : "text-mocha hover:text-navy"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.22em] text-mocha/70 text-left">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-gold/40 hover:bg-white/40">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-navy text-cream flex items-center justify-center text-xs font-display">
                        {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-navy font-medium">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3"><Badge className={`rounded-full ${u.role === "Tailor" ? "bg-champagne text-navy" : "bg-rose/30 text-terracotta"}`}>{u.role}</Badge></td>
                  <td className="px-3"><Badge className={`rounded-full ${planTint[u.plan]}`}>{u.plan}</Badge></td>
                  <td className="px-3 text-mocha">{u.city}</td>
                  <td className="px-3 text-mocha">{u.joined}</td>
                  <td className="px-3"><Badge className={`rounded-full ${statusTint[u.status]}`}>{u.status}</Badge></td>
                  <td className="px-3 text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-mocha" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint}`}>
      <p className="text-[10px] uppercase tracking-[0.22em] opacity-75">{label}</p>
      <p className="font-display text-3xl mt-2">{value}</p>
    </Card>
  );
}






