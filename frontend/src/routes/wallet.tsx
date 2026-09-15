import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle, CheckCircle2, Building, ShieldCheck, HandCoins, Check, X } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/wallet")({ component: TailorWallet });

function TailorWallet() {
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const [res, bookingsRes] = await Promise.all([
        api.get('/tailors/profile'),
        api.get('/bookings/tailor')
      ]);
      
      if (res.data) {
        setBalance(res.data.walletBalance || 0);
        setWithdrawals(res.data.withdrawals || []);
      }
      
      if (bookingsRes.data) {
        const activities: any[] = [];
        
        bookingsRes.data.forEach((b: any) => {
          // 1. Advance Payment (Base Amount) - Online
          activities.push({
            type: 'online_payment',
            id: b._id + '_base',
            bookingId: b._id,
            date: b.createdAt,
            amount: b.baseAmountPaid || Math.min(500, b.amount),
            status: 'completed',
            customer: b.customer?.name || "Customer",
            label: "Advance Payment"
          });

          const remaining = b.amount - (b.baseAmountPaid || Math.min(500, b.amount));

          // 2. Online Payment (Remaining)
          if (['pending', 'approved', 'rejected'].includes(b.onlinePaymentStatus)) {
            activities.push({
              type: 'online_payment',
              id: b._id + '_online',
              bookingId: b._id,
              date: b.updatedAt || b.createdAt,
              amount: remaining,
              status: b.onlinePaymentStatus,
              customer: b.customer?.name || "Customer",
              label: "Final Payment (" + (b.paymentMethod || "Online") + ")",
              isOnlineRequest: b.onlinePaymentStatus === 'pending',
              onOnlineApprove: () => handleOnlineAction(b._id, 'confirm-online'),
              onOnlineReject: () => handleOnlineAction(b._id, 'reject-online')
            });
          }

          // 3. Cash Handover (Remaining)
          if (['pending', 'approved', 'rejected'].includes(b.cashRequestStatus)) {
            activities.push({
              type: 'cash_handover',
              id: b._id + '_cash',
              bookingId: b._id,
              date: b.updatedAt || b.createdAt,
              amount: remaining,
              status: b.cashRequestStatus,
              customer: b.customer?.name || "Customer",
              label: "Cash Handover"
            });
          } 
          // 3. Online Payment (Remaining)
          else if (b.paymentStatus === 'paid') {
            activities.push({
              type: 'online_payment',
              id: b._id + '_final',
              bookingId: b._id,
              date: b.updatedAt || b.createdAt,
              amount: remaining,
              status: 'completed',
              customer: b.customer?.name || "Customer",
              label: "Final Payment"
            });
          }
        });
        
        setPayments(activities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const val = parseFloat(amount);
    
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    setWithdrawing(true);
    try {
      await api.post('/tailors/wallet/withdraw', { amount: val });
      setAmount("");
      fetchProfile(); // Refresh balance and history
      alert("Withdrawal requested successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleCashAction = async (orderId: string, action: 'confirm' | 'reject') => {
    try {
      await api.put(`/bookings/${orderId}/${action}-cash`);
      fetchProfile();
    } catch (err) {
      console.error(`Failed to ${action} cash payment`, err);
    }
  };

  const paymentHistory = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivities = [...withdrawals.map(w => ({ ...w, type: 'withdrawal' })), ...payments.filter(p => p.type === 'cash_handover')]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PageShell title="Tailor Wallet" subtitle="Manage your earnings and withdrawals.">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <Card className="p-8 border-0 shadow-luxe bg-gradient-navy-deep text-cream relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cream/60 font-semibold mb-2">Available Balance</p>
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-8 w-8 text-gold" />
                  <h2 className="font-display text-5xl text-cream">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-gold" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6">
              <div>
                <p className="text-[10px] text-cream/50 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active for withdrawals
                </div>
              </div>
              <div>
                <p className="text-[10px] text-cream/50 uppercase tracking-widest mb-1">Bank Account</p>
                <p className="text-xs text-cream/90 font-mono">XXXX-XXXX-9012</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gold/40 shadow-sm bg-gradient-soft">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="h-5 w-5 text-navy" />
              <h3 className="font-display text-xl text-navy">Request Withdrawal</h3>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-mocha font-medium">Amount to withdraw</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-navy/50" />
                  </div>
                  <Input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 h-12 text-lg font-display rounded-xl border-gold/40 focus-visible:ring-gold"
                    min="1"
                    max={balance}
                    step="0.01"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Limits: 1 withdrawal per day, max 5 per week.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-600 text-xs">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={withdrawing || balance < 100 || !amount || parseFloat(amount) < 100}
                className="w-full h-12 rounded-xl bg-gradient-navy text-cream font-semibold hover:opacity-95 shadow-md"
              >
                {withdrawing ? "Processing..." : "Withdraw Funds"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 border-gold/40 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-navy">Payment History</h3>
            </div>
            <div className="space-y-4">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <Clock className="h-8 w-8 text-mocha mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payment history.</p>
                </div>
              ) : (
                paymentHistory.map((w, i) => (
                  <div key={i} className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${w.type === 'cash_handover' && w.status === 'pending' ? 'bg-amber-50/50 border-amber-200' : 'border-gold/20 hover:bg-gold/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${w.type === 'withdrawal' ? 'bg-rose-100 text-rose-600' : w.type === 'online_payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {w.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : w.type === 'online_payment' ? <CheckCircle2 className="h-4 w-4" /> : <HandCoins className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {w.type === 'withdrawal' ? 'Withdrawal' : w.type === 'online_payment' ? `${w.label} from ${w.customer}` : `Cash from ${w.customer}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{new Date(w.date).toLocaleDateString()} · {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${w.type === 'withdrawal' ? 'text-navy' : 'text-emerald-700'}`}>{w.type === 'withdrawal' ? '-' : '+'}₹{w.amount}</p>
                        <p className={`text-[10px] capitalize font-medium ${w.status === 'completed' || w.status === 'approved' ? 'text-emerald-600' : w.status === 'failed' || w.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                          {w.status === 'pending' && w.type === 'cash_handover' ? 'Pending Approval' : w.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 border-gold/40 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl text-navy">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-10 opacity-60">
                <Clock className="h-8 w-8 text-mocha mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity.</p>
              </div>
            ) : (
              recentActivities.map((w, i) => (
                <div key={i} className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${w.type === 'cash_handover' && w.status === 'pending' ? 'bg-amber-50/50 border-amber-200' : 'border-gold/20 hover:bg-gold/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${w.type === 'withdrawal' ? 'bg-rose-100 text-rose-600' : w.type === 'online_payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {w.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : w.type === 'online_payment' ? <CheckCircle2 className="h-4 w-4" /> : <HandCoins className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {w.type === 'withdrawal' ? 'Withdrawal' : w.type === 'online_payment' ? `${w.label} from ${w.customer}` : `Cash from ${w.customer}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{new Date(w.date).toLocaleDateString()} · {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${w.type === 'withdrawal' ? 'text-navy' : 'text-emerald-700'}`}>{w.type === 'withdrawal' ? '-' : '+'}₹{w.amount}</p>
                      <p className={`text-[10px] capitalize font-medium ${w.status === 'completed' || w.status === 'approved' ? 'text-emerald-600' : w.status === 'failed' || w.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {w.status === 'pending' && w.type === 'cash_handover' ? 'Pending Approval' : w.status}
                      </p>
                    </div>
                  </div>
                  {w.type === 'cash_handover' && w.status === 'pending' && (
                    <div className="flex items-center gap-2 mt-1">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 rounded-full" onClick={() => handleCashAction(w.bookingId, 'reject')}>
                        <X className="h-3 w-3 mr-1" /> No
                      </Button>
                      <Button size="sm" className="flex-1 h-7 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 rounded-full" onClick={() => handleCashAction(w.bookingId, 'confirm')}>
                        <Check className="h-3 w-3 mr-1" /> Received in hand
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}






