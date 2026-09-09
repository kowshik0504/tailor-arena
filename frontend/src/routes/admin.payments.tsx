import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Wallet, Download, Users, Scissors, Sparkles, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoLockup } from "@/components/Logo";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });

const statusTint: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-800",
  Pending: "bg-gold/20 text-navy-deep",
  Refunded: "bg-rose-100 text-rose-800",
};

function AdminPayments() {
  const [data, setData] = useState<any>(null);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/payments").then(res => setData(res.data)).catch(console.error);
  }, []);

  const downloadReport = () => {
    window.print();
  };

  if (!data) return <PageShell title="Payments" subtitle="Loading..."><div /></PageShell>;

  const { kpis, flow, txns } = data;

  return (
    <>
    <div className="hidden print:block p-8 bg-white min-h-screen text-black">
      <div className="flex justify-center mb-2"><LogoLockup size={40} variant="dark" /></div>
      <h2 className="text-xl mb-6 text-center text-mocha">Transaction Report</h2>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-2">ID</th>
            <th>Participant</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {txns.map((t: any) => (
            <tr key={t.id} className="border-b border-gray-200">
              <td className="py-2">{t.id}</td>
              <td>{t.who}</td>
              <td>{t.type}</td>
              <td className="font-medium">{t.amount}</td>
              <td className="uppercase">{t.paymentMethod}</td>
              <td>{t.status}</td>
              <td>{new Date(t.when).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="print:hidden">
      <PageShell title="Payments" subtitle="Customer payments, tailor payouts, and platform revenue.">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Stat icon={<Users className="h-5 w-5" />} label="Customer Payments" value={kpis.customerPayments} trend="this week" tint="bg-gradient-navy text-cream" />
          <Stat icon={<Scissors className="h-5 w-5" />} label="Tailor Payouts" value={kpis.tailorPayouts} trend="80% rev share" tint="bg-gradient-cream text-navy" />
          <Stat icon={<Sparkles className="h-5 w-5" />} label="Activation Fees" value={kpis.activationFees} trend="Lifetime" tint="bg-gradient-champagne text-navy" />
          <Stat icon={<CreditCard className="h-5 w-5" />} label="Subscription Revenue" value={kpis.subscriptionRevenue} trend="Not active" tint="bg-gradient-gold text-navy-deep" />
          <Stat icon={<Clock className="h-5 w-5" />} label="Pending Payments" value={kpis.pendingPayments} trend="Open bookings" tint="bg-cream" />
          <Stat icon={<Wallet className="h-5 w-5" />} label="Completed (week)" value={kpis.completedWeek.toString()} trend="Transactions" tint="bg-cream" />
        </div>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display text-xl text-navy">Payment flow</h3>
              <p className="text-xs text-muted-foreground">Gross processing volume — last 7 days</p>
            </div>
            <Badge className="rounded-full bg-gold/15 text-navy-deep border border-gold/40">
              <TrendingUp className="h-3 w-3 mr-1" /> Live
            </Badge>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flow} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.76 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 80)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.5 0.04 260)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.04 260)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.91 0.02 80)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.27 0.09 265)" strokeWidth={2.5} fill="url(#pay)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-gold/60 shadow-luxe">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-navy">Transaction history</h3>
            <Button onClick={downloadReport} variant="outline" size="sm" className="rounded-full gap-2 border-gold/40 text-navy hover:bg-champagne/40">
              <Download className="h-3.5 w-3.5" /> Download report
            </Button>
          </div>
          <div className="space-y-2">
            {txns.length === 0 && <p className="text-sm text-mocha">No transactions found.</p>}
            {txns.map((t: any) => (
              <div key={t.id} className="grid grid-cols-2 lg:grid-cols-6 items-center gap-3 p-3 rounded-xl border border-gold/60 bg-white/40">
                <div>
                  <p className="text-sm font-medium text-navy">{t.who}</p>
                  <p className="text-[11px] text-muted-foreground">{t.id} · {new Date(t.when).toLocaleDateString()}</p>
                </div>
                <Badge className="rounded-full bg-champagne text-navy text-[10px] w-fit">{t.type}</Badge>
                <p className="text-sm font-display text-navy tabular-nums">{t.amount}</p>
                <Badge className={`rounded-full text-[10px] w-fit ${statusTint[t.status] || "bg-gray-100"}`}>{t.status}</Badge>
                <span className="text-[11px] text-mocha lg:col-span-1">{t.paymentMethod}</span>
                <button onClick={() => setSelectedTxn(t)} className="text-xs text-gold hover:underline text-right">View</button>
              </div>
            ))}
          </div>
        </Card>

        <Dialog open={!!selectedTxn} onOpenChange={(o) => !o && setSelectedTxn(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Receipt</DialogTitle>
            </DialogHeader>
            {selectedTxn && (
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-mocha">Transaction ID</span>
                  <span className="font-medium text-navy">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-mocha">Participant</span>
                  <span className="font-medium text-navy">{selectedTxn.who}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-mocha">Amount</span>
                  <span className="font-medium text-navy">{selectedTxn.amount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-mocha">Payment Method</span>
                  <span className="font-medium uppercase text-navy">{selectedTxn.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-mocha">Status</span>
                  <Badge className={statusTint[selectedTxn.status]}>{selectedTxn.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-mocha">Date</span>
                  <span className="text-navy">{new Date(selectedTxn.when).toLocaleString()}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageShell>
    </div>
    </>
  );
}

function Stat({ icon, label, value, trend, tint }: any) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint}`}>
      {icon}
      <p className="text-[10px] uppercase tracking-[0.22em] mt-3 opacity-75">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
      <p className="text-[11px] mt-1 opacity-70">{trend}</p>
    </Card>
  );
}


