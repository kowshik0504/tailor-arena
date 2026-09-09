import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, IndianRupee, CalendarDays, AlertCircle, Bell, Check } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: Notifications });

type Reminder = {
  type: "Delivery" | "Payment" | "Appointment" | "Delayed";
  title: string;
  detail: string;
  when: string;
  I: typeof Bell;
  tint: string;
};

const filters = ["All", "Delivery", "Payment", "Appointment", "Delayed"];

import api from "@/lib/api";

function Notifications() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/bookings/tailor');
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const reminders: Reminder[] = orders
    .filter(o => ["Pending", "New", "Ready for Delivery", "Request Changes", "Changes Requested", "In Stitching"].includes(o.status))
    .map(o => {
      let type: "Delivery" | "Payment" | "Appointment" | "Delayed" = "Appointment";
      let title = "Action needed";
      let I = CalendarDays;
      let tint = "bg-gradient-rose";
      let when = o.due || o.delivery || "Soon";

      if (o.status === "Pending" || o.status === "New") {
        type = "Appointment";
        title = "New Booking Request";
        I = CalendarDays;
        tint = "bg-gradient-gold";
      } else if (o.status === "Ready for Delivery") {
        type = "Delivery";
        title = "Ready for Delivery";
        I = Package;
        tint = "bg-gradient-luxe text-primary-foreground";
      } else if (o.status === "In Stitching") {
        type = "Delivery";
        title = "In Progress";
        I = Package;
        tint = "bg-gradient-cream";
      } else if (o.status === "Request Changes" || o.status === "Changes Requested") {
        type = "Delayed";
        title = "Changes Requested";
        I = AlertCircle;
        tint = "bg-terracotta/15 text-terracotta";
      }

      return {
        type,
        title,
        detail: `${o.customer} · ${o.garment || o.dress || "Custom Order"}`,
        when,
        I,
        tint
      };
    });

  return (
    <PageShell title="Reminders" subtitle="Gentle nudges so nothing slips through.">
      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <Badge key={f} variant={i === 0 ? "default" : "outline"} className="rounded-full px-4 py-1.5 cursor-pointer">
            {f}
          </Badge>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-cream0 rounded-xl">
            All caught up. No reminders at the moment!
          </div>
        ) : reminders.map((r, i) => (
          <Card key={i} className="p-5 border-gold/60 shadow-luxe hover:shadow-glow transition group">
            <div className="flex items-start justify-between">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-luxe ${r.tint}`}>
                <r.I className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] border-gold/70">{r.type}</Badge>
            </div>
            <p className="font-display text-lg mt-4">{r.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
            <div className="mt-4 pt-3 border-t border-gold/40 flex items-center justify-between">
              <span className="text-[11px] text-mocha">{r.when}</span>
              <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs gap-1 opacity-60 group-hover:opacity-100">
                <Check className="h-3 w-3" /> Done
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}






