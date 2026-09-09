import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CircleCheck, CircleX, Scissors, CalendarDays, Truck, MessageCircle, Bell, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/customer/notifications")({ component: Notifications });

const items = [
  { icon: CircleCheck, tint: "bg-emerald-100 text-emerald-800", title: "Booking accepted", body: "Maison Aarav accepted your Bridal Lehenga order #TA-2061.", time: "2m ago", unread: true },
  { icon: MessageCircle, tint: "bg-sky-100 text-sky-800", title: "New message from Studio Kavya", body: "“Pricing for the saree blouse is ₹4,200 incl. lining.”", time: "1h ago", unread: true },
  { icon: CalendarDays, tint: "bg-gradient-gold text-navy-deep", title: "Trial fitting scheduled", body: "Saree Blouse · Mar 22 · 4:00 PM at Studio Kavya.", time: "3h ago", unread: true },
  { icon: Scissors, tint: "bg-navy/10 text-navy", title: "Stitching started", body: "Maison Aarav has started stitching your Bridal Lehenga.", time: "Yesterday", unread: false },
  { icon: Truck, tint: "bg-violet-100 text-violet-800", title: "Ready for pickup", body: "Atelier Dev: your Linen Suit is ready. Visit anytime today.", time: "2 days ago", unread: false },
  { icon: CircleX, tint: "bg-rose-100 text-rose-700", title: "Booking declined", body: "Quick Stitch can't take new alteration requests until Mar 25.", time: "4 days ago", unread: false },
];

function Notifications() {
  const unread = items.filter((i) => i.unread).length;
  return (
    <PageShell title="Notifications" subtitle="Booking updates, messages and delivery alerts.">
      <Card className="p-5 border-gold/60 shadow-luxe flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-gold text-navy-deep flex items-center justify-center shadow-glow">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-navy text-lg">{unread} new updates</p>
            <p className="text-xs text-mocha/70">Personal alerts from your tailors and bookings</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full border-navy/20 text-navy">Mark all as read</Button>
      </Card>

      <Card className="border-gold/60 shadow-luxe divide-y divide-border/40">
        {items.map((n, i) => (
          <div key={i} className={`flex items-start gap-4 p-5 ${n.unread ? "bg-champagne/30" : ""}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.tint}`}>
              <n.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-navy text-sm">{n.title}</p>
                {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
              </div>
              <p className="text-xs text-mocha mt-1">{n.body}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
          </div>
        ))}
      </Card>

      <Card className="p-5 border-gold/40 bg-gradient-cream shadow-glow flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-gold" />
        <p className="text-xs text-navy">Want fewer alerts? Customise in <Badge variant="outline" className="rounded-full text-[10px] border-navy/20 ml-1">Settings → Notifications</Badge></p>
      </Card>
    </PageShell>
  );
}






