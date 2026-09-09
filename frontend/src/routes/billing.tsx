import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Send, QrCode, CreditCard, Banknote, Smartphone, ImagePlus, X, Wallet, ArrowUpRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/billing")({ component: Billing });

type Item = { desc: string; qty: number; rate: number; amt: number };
type SplitPayment = { method: "UPI" | "Card" | "Cash"; amount: number };

type Invoice = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  targetDate?: string;
  date: string;
  amt: string;
  state: "Paid" | "Pending" | "Overdue";
  payments: SplitPayment[];
  items: Item[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};


const mockInvoices: Invoice[] = [];

const stateTint: Record<string, string> = {
  Paid: "bg-gradient-luxe text-primary-foreground",
  Pending: "bg-gradient-gold text-primary",
  Overdue: "bg-terracotta text-background",
};

function formatCurrency(val: number) {
  return "₹" + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

import { useAuth } from "@/context/AuthContext";

function Billing() {
  const { user } = useAuth();
  
  const shopProfile = {
    name: user?.shopName || user?.name || "Boutique",
    gst: user?.gstin || "N/A",
    phone: user?.phone || "N/A"
  };
  const [active, setActive] = useState<Invoice | null>(mockInvoices.length > 0 ? mockInvoices[0] : null);
  const [qr, setQr] = useState<string | null>(null);
  const [showMethod, setShowMethod] = useState<"UPI" | "Card" | "Cash" | null>(null);
  const [showPending, setShowPending] = useState(false);

  const pendingList = useMemo(() => mockInvoices.filter(i => i.state !== "Paid"), []);
  const pendingTotal = useMemo(() => pendingList.reduce((sum, i) => sum + i.total, 0), [pendingList]);

  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/tailors/profile');
        if (res.data) {
          setWalletBalance(res.data.walletBalance || 0);
          setWithdrawals(res.data.withdrawals || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleWithdraw = async () => {
    if (walletBalance <= 0) {
      alert("No balance available to withdraw.");
      return;
    }
    const amt = prompt("Enter amount to withdraw:");
    if (!amt || isNaN(Number(amt))) return;
    try {
      const res = await api.post('/tailors/wallet/withdraw', { amount: Number(amt) });
      alert(res.data.message);
      setWalletBalance(res.data.balance);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Withdrawal failed");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    if (!active) return;
    window.location.href = `mailto:${active.email}?subject=Invoice ${active.id} from ${shopProfile.name}&body=Hello ${active.name},%0D%0APlease find the details for invoice ${active.id} attached.`;
  };

  const methodPayments = useMemo(() => {
    if (!showMethod) return { list: [], total: 0 };
    let list: { inv: Invoice, amount: number, otherSplits: SplitPayment[] }[] = [];
    let total = 0;
    mockInvoices.forEach(i => {
      if (i.state === "Paid") {
        const p = i.payments.find(x => x.method === showMethod);
        if (p) {
           total += p.amount;
           const otherSplits = i.payments.filter(x => x.method !== showMethod);
           list.push({ inv: i, amount: p.amount, otherSplits });
        }
      }
    });
    return { list, total };
  }, [showMethod]);

  return (
    <PageShell title="Billing & Payments" subtitle="Invoices that feel as crafted as the garments themselves.">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="mb-6 grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-navy text-cream flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-80 text-sm">
              <Wallet className="h-4 w-4" /> Available Wallet Balance
            </div>
            <div className="font-display text-4xl">{formatCurrency(walletBalance)}</div>
            <p className="text-[10px] mt-2 opacity-60">*Withdraw up to 1 time/day, 5 times/week.</p>
          </div>
          <Button onClick={handleWithdraw} className="bg-gradient-gold text-navy-deep hover:bg-gold/90 font-semibold shadow-glow rounded-xl">
            Withdraw Funds <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Card className="print-section p-8 border-gold/60 shadow-luxe bg-gradient-cream relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-gold opacity-30 blur-3xl no-print" />
          
          {!active ? (
            <div className="text-center py-20 relative z-10 text-mocha/60 flex flex-col items-center">
              <Banknote className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="font-display text-xl text-navy">No Invoices Yet</h3>
              <p className="text-sm mt-2 max-w-[250px]">Your latest invoices will appear here once you start billing customers.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Invoice</p>
                  <h2 className="font-display text-3xl mt-1">{active.id}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Issued {active.date.split(" ")[0] + " " + active.date.split(" ")[1] + " " + active.date.split(" ")[2]} · Due on receipt</p>
                </div>
                <div className="text-right">
                  <div className="h-12 w-12 rounded-xl bg-gradient-luxe ml-auto flex items-center justify-center shadow-luxe">
                    <span className="font-display text-primary-foreground">{shopProfile.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{shopProfile.name} · GSTIN {shopProfile.gst}</p>
                  <p className="text-xs text-muted-foreground">Ph: {shopProfile.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Billed to</p>
                  <p className="font-medium mt-1">{active.name}</p>
                  <p className="text-muted-foreground text-xs">{active.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment Status</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge className={`${stateTint[active.state]} border-0 rounded-full`}>
                      {active.state}
                    </Badge>
                    {active.payments.map((p, idx) => (
                      <Badge key={idx} variant="outline" className="border-gold/60 text-[10px] rounded-full text-mocha">
                        {formatCurrency(p.amount)} {p.method}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-background/70 backdrop-blur border border-gold/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr><th className="text-left px-5 py-3 font-medium">Item</th><th className="text-right px-5 py-3 font-medium">Qty</th><th className="text-right px-5 py-3 font-medium">Rate</th><th className="text-right px-5 py-3 font-medium">Amount</th></tr>
                  </thead>
                  <tbody>
                    {active.items.map((it, idx) => (
                      <tr key={idx} className="border-t border-gold/40">
                        <td className="px-5 py-3">{it.desc}</td>
                        <td className="text-right px-5 py-3">{it.qty}</td>
                        <td className="text-right px-5 py-3">{formatCurrency(it.rate)}</td>
                        <td className="text-right px-5 py-3 font-semibold">{formatCurrency(it.amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-gold/60 p-5 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(active.subtotal)}</span></div>
                  {active.discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>−{formatCurrency(active.discount)}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>GST 5%</span><span>{formatCurrency(active.tax)}</span></div>
                  <div className="flex justify-between font-display text-xl mt-2"><span>Total</span><span>{formatCurrency(active.total)}</span></div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 no-print">
                <Button onClick={handleSend} className="rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2"><Send className="h-4 w-4" />Send to customer</Button>
                <Button onClick={handlePrint} variant="outline" className="rounded-full border-gold/70 gap-2"><Download className="h-4 w-4" />Download PDF</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6 border-gold/60 shadow-luxe bg-gradient-soft relative">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Pay by QR</h3>
              <QrCode className="h-5 w-5 text-mocha" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Upload your shop QR code here</p>
            
            <div className="mt-5 aspect-square max-w-[220px] mx-auto rounded-2xl bg-background p-4 shadow-luxe relative group overflow-hidden">
              {qr ? (
                <img src={qr} className="h-full w-full object-cover rounded-lg" alt="Shop QR" />
              ) : (
                <div className="h-full w-full border-2 border-dashed border-gold/40 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                   <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
                   <span className="text-xs text-center px-4">Upload shop QR<br/>Send ₹1 to test</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <span className="text-white text-xs uppercase tracking-wider">Change QR</span>
                <input 
                  type="file" accept="image/*" className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setQr(URL.createObjectURL(e.target.files[0]));
                    }
                  }} 
                />
              </label>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">Scan with any UPI app</p>
          </Card>

          <Card className="p-6 border-gold/60 shadow-luxe">
            <h3 className="font-display text-lg mb-4">Payment methods</h3>
            <p className="text-[10px] text-muted-foreground mb-3 -mt-3 uppercase tracking-wider">Click to view breakdown</p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {[{n:"UPI",I:Smartphone},{n:"Card",I:CreditCard},{n:"Cash",I:Banknote}].map((m) => (
                <button key={m.n} onClick={() => setShowMethod(m.n as any)} className={`p-4 rounded-xl border transition flex flex-col items-center justify-center ${showMethod === m.n ? 'bg-gold/20 border-gold shadow-inner' : 'bg-secondary/60 border-transparent hover:bg-accent'}`}>
                  <m.I className={`h-5 w-5 mx-auto ${showMethod === m.n ? 'text-navy-deep' : 'text-mocha'}`} />
                  <p className="mt-2 font-medium">{m.n}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-gradient-rose cursor-pointer hover:shadow-md transition" onClick={() => setShowPending(true)}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending balance</p>
              <p className="font-display text-3xl">{formatCurrency(pendingTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">Across {pendingList.length} customers</p>
              <p className="text-[9px] uppercase tracking-wider text-navy mt-3 flex items-center gap-1 font-medium">Click to manage & remind <Send className="h-3 w-3" /></p>
            </div>
          </Card>
        </div>
      </div>

      <Card className="border-gold/60 shadow-luxe overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gold/60">
          <h3 className="font-display text-lg">Recent invoices</h3>
          <p className="text-xs text-muted-foreground">Click on an invoice to view details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3 font-medium">Invoice</th><th className="text-left px-6 py-3 font-medium">Customer</th><th className="text-left px-6 py-3 font-medium">Date & Time</th><th className="text-left px-6 py-3 font-medium">Amount</th><th className="text-left px-6 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody>
              {mockInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-mocha/60">
                    <p>No invoices have been created yet.</p>
                  </td>
                </tr>
              ) : (
                mockInvoices.map((i) => (
                  <tr key={i.id} onClick={() => setActive(i)} className={`border-t border-gold/40 cursor-pointer transition ${active?.id === i.id ? 'bg-gold/10' : 'hover:bg-secondary/40'}`}>
                    <td className="px-6 py-4 font-medium">{i.id}</td>
                    <td className="px-6 py-4">{i.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{i.date}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">{i.amt}</td>
                    <td className="px-6 py-4"><Badge className={`rounded-full border-0 text-[10px] uppercase tracking-wider ${stateTint[i.state]}`}>{i.state}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Method Breakdown Modal */}
      {showMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gold/40">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gold/20">
              <h3 className="font-display text-xl text-navy">{showMethod} Payments</h3>
              <button onClick={() => setShowMethod(null)} className="text-navy/50 hover:text-navy transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-auto">
              {methodPayments.list.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No payments received via {showMethod} yet.</p>
              ) : (
                <div className="space-y-4">
                  {methodPayments.list.map(p => (
                    <div key={p.inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gold/20 shadow-sm">
                       <div>
                         <p className="font-medium text-sm text-navy">{p.inv.name}</p>
                         <p className="text-[10px] text-muted-foreground mt-0.5">{p.inv.date}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-semibold text-navy">
                           {formatCurrency(p.amount)}
                           {p.otherSplits.length > 0 && <span className="text-muted-foreground text-xs font-normal ml-1">({p.otherSplits.map(s => `${formatCurrency(s.amount)} ${s.method}`).join(', ')})</span>}
                         </p>
                         <p className="text-[10px] text-muted-foreground mt-0.5">{p.inv.id}</p>
                       </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-2 border-t border-gold/40 flex items-center justify-between font-display text-lg text-navy-deep">
                    <span>Total {showMethod} Received</span>
                    <span>{formatCurrency(methodPayments.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Balance Manager Modal */}
      {showPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gold/40">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gold/20">
              <div>
                <h3 className="font-display text-xl text-navy">Pending Balances</h3>
                <p className="text-sm text-muted-foreground">Total: {formatCurrency(pendingTotal)}</p>
              </div>
              <button onClick={() => setShowPending(false)} className="text-navy/50 hover:text-navy transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-auto">
              {pendingList.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No pending balances! Great job!</p>
              ) : (
                <div className="space-y-4">
                  {pendingList.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row gap-4 justify-between p-4 rounded-xl bg-white border border-gold/20 shadow-sm">
                       <div>
                         <div className="flex items-center gap-2">
                           <p className="font-medium text-sm text-navy">{p.name}</p>
                           <Badge className={`${stateTint[p.state]} border-0 rounded-full text-[9px] px-1.5 py-0`}>{p.state}</Badge>
                         </div>
                         <p className="text-xs text-muted-foreground mt-1">Ph: {p.phone}</p>
                         {p.targetDate && <p className="text-xs text-terracotta mt-0.5 font-medium">Target Date: {p.targetDate}</p>}
                       </div>
                       <div className="flex flex-col items-end justify-between gap-3">
                         <div className="text-right">
                           <p className="font-semibold text-navy">{formatCurrency(p.total)}</p>
                           <p className="text-[10px] text-muted-foreground mt-0.5">{p.id}</p>
                         </div>
                         <Button onClick={() => {
                           const subject = `Payment Reminder: Invoice ${p.id} from ${shopProfile.name}`;
                           const body = `Hello ${p.name},%0D%0A%0D%0AThis is a friendly reminder regarding the pending balance of ${formatCurrency(p.total)} for Invoice ${p.id}.${p.targetDate ? `%0D%0AAs discussed, the target payment date is ${p.targetDate}.` : ''}%0D%0A%0D%0APlease let us know if you have any questions.%0D%0A%0D%0AThanks,%0D%0A${shopProfile.name}`;
                           window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
                         }} size="sm" variant="outline" className="h-7 text-xs rounded-full border-gold/70 text-navy hover:bg-gold/10 gap-1.5">
                           <Send className="h-3 w-3" /> Send Reminder
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}







