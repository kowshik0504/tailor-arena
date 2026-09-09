import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Phone, Mail, MapPin, Star } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/customers")({ component: Customers });

function Customers() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/tailor');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const customers = useMemo(() => {
    const customerMap = new Map();
    orders.forEach((o) => {
      const cname = o.customer?.name || "Unknown";
      if (!customerMap.has(cname)) {
        customerMap.set(cname, {
          id: cname,
          name: cname,
          phone: o.customer?.phone ? o.customer.phone : "Not provided",
          email: "Not provided",
          city: o.customer?.address?.city || "Not provided",
          orders: 0,
          spent: 0,
        });
      }
      const c = customerMap.get(cname);
      c.orders += 1;
    });

    return Array.from(customerMap.values()).map((c, i) => {
      // Initials
      const words = c.name.trim().split(" ");
      const initial =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : c.name.slice(0, 2).toUpperCase();

      // Tag logic
      let tag = "New";
      let tint = "bg-gradient-cream";
      if (c.orders > 5) {
        tag = "VIP";
        tint = "bg-gradient-luxe text-primary-foreground";
      } else if (c.orders > 1) {
        tag = "Regular";
        tint = "bg-gradient-gold";
      }

      return {
        ...c,
        id: i,
        spent: "—", // Actual spend not tracked in local orders
        tag,
        initial,
        tint,
      };
    });
  }, [orders]);

  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <PageShell title="Customers" subtitle="Your atelier's most valued patrons">
      <Card className="p-4 border-gold/60 shadow-luxe">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone…" 
              className="pl-9 bg-background/60 border-gold/60 rounded-full h-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-full gap-2 border-gold/70"><Filter className="h-4 w-4" />Filters</Button>
          <Button className="rounded-full gap-2 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" />Add Customer</Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-cream0 rounded-xl">
            {search ? "No customers found for your search." : "No customers yet. Start taking orders to see your patrons here."}
          </div>
        ) : filteredCustomers.map((c) => (
          <Card key={c.id} className="p-6 border-gold/60 shadow-luxe hover:shadow-glow transition-all group">
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-2xl ${c.tint} flex items-center justify-center font-display text-xl shadow-luxe`}>
                {c.initial}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg">{c.name}</h3>
                  {c.tag === "VIP" && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                </div>
                <Badge variant="outline" className="rounded-full text-[10px] mt-1 border-gold/70 uppercase tracking-wider">{c.tag}</Badge>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{c.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{c.email}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3 w-3" />{c.city}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-gold/60 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orders</p>
                <p className="font-display text-xl">{c.orders}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lifetime</p>
                <p className="font-display text-xl">{c.spent}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length > 0 && (
        <Card className="border-gold/60 shadow-luxe overflow-hidden">
          <div className="px-6 py-4 border-b border-gold/60 flex items-center justify-between">
            <h3 className="font-display text-lg">All customers</h3>
            <span className="text-xs text-muted-foreground">{filteredCustomers.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Customer</th>
                  <th className="text-left px-6 py-3 font-medium">Contact</th>
                  <th className="text-left px-6 py-3 font-medium">City</th>
                  <th className="text-left px-6 py-3 font-medium">Orders</th>
                  <th className="text-left px-6 py-3 font-medium">Spent</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-t border-gold/40 hover:bg-secondary/40 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full ${c.tint} flex items-center justify-center text-xs font-semibold`}>{c.initial}</div>
                      <span className="font-medium">{c.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.phone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.city}</td>
                    <td className="px-6 py-4">{c.orders}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">{c.spent}</td>
                    <td className="px-6 py-4"><Badge variant="outline" className="rounded-full text-[10px] border-gold/70">{c.tag}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
