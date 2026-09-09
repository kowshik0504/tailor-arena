import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Globe, CreditCard, Trash2 } from "lucide-react";

export const Route = createFileRoute("/customer/settings")({ component: CustomerSettings });

function CustomerSettings() {
  return (
    <PageShell title="Settings" subtitle="Preferences, security, and notifications.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe">
          <SectionHeader icon={<Bell className="h-4 w-4" />} title="Notifications" />
          <div className="space-y-3 mt-4">
            <Row label="Order updates" hint="Stitching progress, delivery alerts" defaultChecked />
            <Row label="Trial reminders" hint="A day before each fitting" defaultChecked />
            <Row label="New design drops" hint="From tailors you follow" />
            <Row label="Promotions" hint="Seasonal offers and editorial" />
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <SectionHeader icon={<Lock className="h-4 w-4" />} title="Security" />
          <div className="space-y-3 mt-4">
            <Field label="Current password" type="password" placeholder="••••••••" />
            <Field label="New password" type="password" placeholder="••••••••" />
            <Button className="rounded-xl bg-gradient-navy text-cream h-10 mt-2">Update password</Button>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <SectionHeader icon={<Globe className="h-4 w-4" />} title="Preferences" />
          <div className="space-y-3 mt-4">
            <Field label="City" defaultValue="Mumbai" />
            <Field label="Preferred language" defaultValue="English" />
            <Row label="Share measurements with saved tailors" hint="Speeds up booking" defaultChecked />
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <SectionHeader icon={<CreditCard className="h-4 w-4" />} title="Payments" />
          <div className="mt-4 rounded-2xl p-4 border border-gold/60 bg-gradient-soft">
            <p className="text-sm font-medium text-navy">HDFC Bank · •••• 4421</p>
            <p className="text-[11px] text-muted-foreground">Default · Expires 08/27</p>
          </div>
          <Button variant="outline" className="rounded-xl mt-3 border-navy/20 text-navy">Add payment method</Button>
        </Card>
      </div>

      <Card className="p-6 border border-rose-200 bg-rose-50/40">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Trash2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-display text-navy">Delete account</p>
            <p className="text-xs text-mocha mt-1">Permanently removes your profile, measurements, and order history.</p>
          </div>
          <Button variant="outline" className="rounded-full border-rose-300 text-rose-700 hover:bg-rose-100">Delete</Button>
        </div>
      </Card>
    </PageShell>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-navy text-cream flex items-center justify-center">{icon}</div>
      <h3 className="font-display text-lg text-navy">{title}</h3>
    </div>
  );
}

function Row({ label, hint, defaultChecked }: { label: string; hint: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 border border-gold/40">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-mocha/70">{label}</label>
      <Input {...props} className="mt-1 h-10 rounded-xl bg-white/60 border-gold/60" />
    </div>
  );
}






