import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, QrCode, Clock, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/onboarding/payment")({ component: PaymentStep });

function PaymentStep() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handlePayLater = async () => {
    setIsProcessing(true);
    try {
      navigate({ to: "/onboarding/success" });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      await api.post("/tailors/pay-now");
      navigate({ to: "/onboarding/success" });
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Payment simulation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex bg-gradient-navy-deep overflow-hidden">
      <div className="fixed inset-0 opacity-10 scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(4px)" }} />
      <div className="absolute top-0 right-0 h-[40rem] w-[40rem] bg-gold/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative w-full max-w-2xl mx-auto flex flex-col justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto h-16 w-16 bg-cream/95 rounded-2xl flex items-center justify-center shadow-glow mb-6">
            <Logo size={48} />
          </div>
          <h1 className="font-display text-4xl text-cream tracking-tight mb-3">Activate Your Atelier</h1>
          <p className="text-cream/70 text-lg">Choose how you'd like to pay the one-time ₹199 activation fee.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pay Now Option */}
          <div className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col ${showQR ? 'bg-gradient-gold border-gold/60 text-navy-deep scale-[1.02] shadow-luxe' : 'bg-gradient-soft border-gold/30 text-navy hover:border-gold/50'}`}>
            <div className="mb-4">
              <QrCode className={`h-8 w-8 ${showQR ? 'text-navy-deep' : 'text-gold'}`} />
            </div>
            <h3 className="font-display text-2xl mb-2">Pay Now</h3>
            <p className={`text-sm mb-6 ${showQR ? 'text-navy-deep/80' : 'text-navy/70'}`}>
              Pay the ₹199 fee instantly via UPI to immediately activate full features upon verification.
            </p>
            
            <div className="mt-auto">
              {showQR ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="aspect-square w-48 mx-auto bg-white rounded-xl p-3 flex flex-col items-center justify-center border-2 border-navy/20">
                    <QrCode className="h-24 w-24 text-navy-deep mb-2" />
                    <p className="text-[10px] text-navy-deep font-bold tracking-wider">SCAN TO PAY ₹199</p>
                  </div>
                  <Button 
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full bg-navy-deep text-cream hover:bg-navy h-12 rounded-xl shadow-md"
                  >
                    {isProcessing ? "Processing..." : "I have paid successfully"}
                  </Button>
                  <button onClick={() => setShowQR(false)} className="w-full text-xs font-semibold text-navy-deep/70 hover:text-navy-deep">
                    Back to options
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowQR(true)}
                  className="w-full bg-gold/10 border border-gold/30 hover:bg-gold/20 text-gold h-12 rounded-xl"
                >
                  Show QR Code
                </Button>
              )}
            </div>
          </div>

          {/* Pay Later Option */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col ${!showQR ? 'bg-gradient-soft border-gold/30 text-navy hover:border-gold/50' : 'bg-navy-deep/40 border-gold/10 text-cream/40 opacity-70'}`}>
            <div className="mb-4">
              <Clock className="h-8 w-8 text-gold" />
            </div>
            <h3 className="font-display text-2xl mb-2">Pay Later</h3>
            <p className={`text-sm mb-6 ${!showQR ? 'text-navy/70' : 'text-cream/60'}`}>
              Skip the payment now. The ₹199 activation fee will be automatically deducted from your first successful customer order.
            </p>
            
            <div className="mt-auto space-y-4">
              <div className={`flex items-start gap-2 p-3 rounded-lg border ${!showQR ? 'bg-navy/5 border-gold/20' : 'bg-black/20 border-gold/10'}`}>
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className={`text-xs leading-relaxed ${!showQR ? 'text-navy/80' : 'text-cream/70'}`}>No upfront cost. You'll only pay when you start earning through Tailor Arena.</p>
              </div>
              
              <Button 
                onClick={handlePayLater}
                disabled={isProcessing}
                className="w-full bg-gradient-gold text-navy-deep h-12 rounded-xl shadow-glow font-semibold"
              >
                Continue with Pay Later <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-black/20 p-4 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gold/10 rounded-lg shrink-0">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream">Tailor Wallet & Withdrawals</h4>
              <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                All your earnings are securely stored in your Tailor Wallet. You can withdraw funds directly to your bank account up to <strong>1 time daily</strong> and a maximum of <strong>5 times weekly</strong>. Your profile must be approved by an Admin before you can accept bookings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
