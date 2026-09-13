import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/customer/dummy-payment")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: search.orderId as string | undefined,
      amount: search.amount as string | undefined,
      method: search.method as string | undefined,
    }
  },
  component: DummyPayment,
});

function DummyPayment() {
  const search = Route.useSearch() as { orderId?: string; amount?: string; method?: string };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const amount = search.amount || "0";
  const method = search.method || "upi";

  const handlePay = () => {
    setLoading(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <PageShell title="Secure Payment" subtitle="Complete your order payment">
      <div className="max-w-md mx-auto mt-10">
        {!success ? (
          <Card className="p-8 border-gold/40 shadow-luxe text-center">
            <div className="h-16 w-16 bg-gradient-navy rounded-full mx-auto flex items-center justify-center text-cream mb-6 shadow-glow">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl text-navy mb-2">Payment Required</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You are about to pay the remaining balance for your order via <span className="font-bold text-navy uppercase">{method}</span>.
            </p>
            
            <div className="bg-cream/30 p-4 rounded-xl border border-gold/30 mb-8">
              <span className="text-sm uppercase tracking-widest text-mocha/70 block mb-1">Amount Due</span>
              <span className="font-display text-4xl text-navy">₹{amount}</span>
            </div>

            <Button 
              className="w-full h-12 rounded-xl bg-gradient-navy text-cream text-lg" 
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ₹${amount} Now`}
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border-[#48BB78]/40 shadow-luxe text-center bg-[#F0FFF4]">
            <div className="h-20 w-20 bg-[#48BB78] rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-glow">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-display text-3xl text-[#2F855A] mb-2">Payment Successful!</h2>
            <p className="text-[#2F855A]/80 text-sm mb-8">
              Thank you for your payment. The tailor has been notified.
            </p>
            <Button 
              className="w-full h-12 rounded-xl bg-[#48BB78] text-white hover:bg-[#38A169] text-lg" 
              onClick={() => navigate({ to: "/customer" })}
            >
              Back to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
