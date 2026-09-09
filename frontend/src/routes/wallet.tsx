import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle, CheckCircle2, Building, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/wallet")({ component: TailorWallet });

function TailorWallet() {
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get('/tailors/profile');
      if (res.data) {
        setBalance(res.data.walletBalance || 0);
        setWithdrawals(res.data.withdrawals || []);
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
                disabled={withdrawing || balance <= 0 || !amount}
                className="w-full h-12 rounded-xl bg-gradient-navy text-cream font-semibold hover:opacity-95 shadow-md"
              >
                {withdrawing ? "Processing..." : "Withdraw Funds"}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="p-6 border-gold/40 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl text-navy">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="text-center py-10 opacity-60">
                <Clock className="h-8 w-8 text-mocha mx-auto mb-2 opacity-50" />
                <p className="text-sm">No withdrawals yet.</p>
              </div>
            ) : (
              withdrawals.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gold/20 hover:bg-gold/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Withdrawal</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(w.date).toLocaleDateString()} · {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-navy">-₹{w.amount}</p>
                    <p className={`text-[10px] capitalize font-medium ${w.status === 'completed' ? 'text-emerald-600' : w.status === 'failed' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {w.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
