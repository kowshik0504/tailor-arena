import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, FileCheck, UserCog, CreditCard, RefreshCw, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });


import { useState, useEffect } from "react";
import api from "@/lib/api";

function AdminNotifications() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/activity").then(res => setItems(res.data)).catch(console.error);
  }, []);

  const getIcon = (type: string) => {
    if (type === 'tailor_registration') return UserCog;
    if (type === 'alert') return AlertTriangle;
    return Bell;
  };

  return (
    <PageShell title="Notifications" subtitle="Platform-wide alerts and operational events.">
      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-navy" />
          <h3 className="font-display text-xl text-navy">Recent activity</h3>
          <Badge className="rounded-full bg-gradient-gold text-navy-deep ml-2">{items.length} new</Badge>
        </div>
        <div className="space-y-2">
          {items.map((n, i) => {
            const Icon = getIcon(n.type);
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-soft border border-gold/60 hover:border-gold/40 transition">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.tint}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy">{n.title}</p>
                  <p className="text-[12px] text-mocha mt-0.5">{n.desc}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(n.when).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}







