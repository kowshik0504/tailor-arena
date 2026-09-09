import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, Percent, ShieldCheck, Bell, Palette } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  return (
    <PageShell title="Platform Settings" subtitle="Configure freemium, plans, fees, and platform-wide rules.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Section icon={<Clock />} title="Freemium duration" subtitle="Trial windows before users must upgrade.">
          <Row label="Tailor freemium (days)" defaultValue="14" />
          <Row label="Customer freemium (days)" defaultValue="7" />
          <Toggle label="Auto-prompt to upgrade after expiry" defaultChecked />
          <Toggle label="Restrict premium features after expiry" defaultChecked />
        </Section>

        <Section icon={<CreditCard />} title="Subscription plans" subtitle="Monthly price points for each tier.">
          <Row label="Tailor Basic (₹/mo)" defaultValue="199" />
          <Row label="Tailor Pro (₹/mo)" defaultValue="699" />
          <Row label="Tailor Elite (₹/mo)" defaultValue="1,499" />
          <Row label="Customer Pro (₹/mo)" defaultValue="299" />
        </Section>

        <Section icon={<Percent />} title="Platform fees" subtitle="Take rate and add-ons.">
          <Row label="Booking service charge (%)" defaultValue="5" />
          <Row label="Premium booking add-on (₹)" defaultValue="49" />
          <Row label="Tailor activation fee (₹)" defaultValue="199" />
          <Row label="Payout cycle (days)" defaultValue="7" />
        </Section>

        <Section icon={<ShieldCheck />} title="Verification rules" subtitle="Required proofs and auto-flag triggers.">
          <Toggle label="Require government ID for tailors" defaultChecked />
          <Toggle label="Require shop photo for shop-type tailors" defaultChecked />
          <Toggle label="Require machine photo" defaultChecked />
          <Toggle label="Auto-flag accounts with > 3 chargebacks" defaultChecked />
          <Toggle label="Mandatory contact OTP for customers" defaultChecked />
        </Section>

        <Section icon={<Bell />} title="Notification preferences" subtitle="What lands in the admin inbox.">
          <Toggle label="New tailor registrations" defaultChecked />
          <Toggle label="New customer registrations" />
          <Toggle label="Verification requests" defaultChecked />
          <Toggle label="Payment failures" defaultChecked />
          <Toggle label="Suspicious activity" defaultChecked />
          <Toggle label="Change requests" defaultChecked />
        </Section>

        <Section icon={<Palette />} title="Branding" subtitle="Public-facing identity.">
          <Row label="Platform name" defaultValue="Tailor Arena" />
          <Row label="Tagline" defaultValue="Precision · Style · Stitching" />
          <Row label="Support email" defaultValue="hello@tailorarena.in" />
          <Row label="Support phone" defaultValue="+91 98200 00000" />
        </Section>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="rounded-full">Cancel</Button>
        <Button className="rounded-full bg-gradient-navy text-cream shadow-navy">Save platform settings</Button>
      </div>
    </PageShell>
  );
}

function Section({ icon, title, subtitle, children }: any) {
  return (
    <Card className="p-6 border-gold/60 shadow-luxe">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-gradient-navy text-cream flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="font-display text-xl text-navy">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Badge className="ml-auto rounded-full bg-gold/15 text-navy-deep border border-gold/40 text-[10px]">Live</Badge>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

function Row({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="grid grid-cols-[1fr_140px] items-center gap-3">
      <p className="text-sm text-navy">{label}</p>
      <Input defaultValue={defaultValue} className="h-9 rounded-lg bg-cream border-gold/60 text-right" />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <p className="text-sm text-navy">{label}</p>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}






