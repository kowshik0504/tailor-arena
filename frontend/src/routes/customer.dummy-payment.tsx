import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

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
  const [failed, setFailed] = useState(false);

  const amount = search.amount || "0";
  const method = search.method || "upi";

  const handlePay = async () => {
    setLoading(true);
    try {
      if (search.orderId) {
        if (method === 'cash') {
          await api.put(`/bookings/${search.orderId}/request-cash`);
        } else {
          await api.put(`/bookings/${search.orderId}/pay-online`, { method });
        }
      }
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 500);
    } catch (error) {
      console.error(error);
      if (search.orderId) {
        try {
          await api.post(`/bookings/${search.orderId}/payment-failed`, { method, reason: "Technical Error" });
        } catch (e) {
          console.error("Failed to trigger failure email:", e);
        }
      }
      setLoading(false);
      setFailed(true);
    }
  };

  return (
    <PageShell title="Secure Payment" subtitle="Complete your order payment">
      <div className="max-w-md mx-auto mt-10">
        {!success ? (
          <Card className="p-8 border-gold/40 shadow-luxe text-center">
            <div className="h-16 w-16 bg-gradient-navy rounded-full mx-auto flex items-center justify-center text-cream mb-6 shadow-glow">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl text-navy mb-2">
              {method === 'cash' ? "Cash Payment Confirmation" : "Payment Required"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {method === 'cash' 
                ? "You have chosen to pay the remaining balance by handing cash directly to the tailor."
                : <>You are about to pay the remaining balance for your order via <span className="font-bold text-navy uppercase">{method}</span>.</>}
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
              {loading ? "Processing..." : method === 'cash' ? "Yes, okay to pay by cash to tailor" : `Pay ₹${amount} Now`}
            </Button>
          </Card>
        ) : failed ? (
          <Card className="p-8 border-rose-200 shadow-luxe text-center bg-rose-50">
            <div className="h-20 w-20 bg-rose-100 rounded-full mx-auto flex items-center justify-center text-rose-600 mb-6 shadow-glow">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="font-display text-3xl text-rose-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-rose-700/80 text-sm mb-8">
              Payment failed due to a technical error. Please try again.
            </p>
            <Button 
              className="w-full h-12 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-lg mb-3" 
              onClick={() => {
                setFailed(false);
                setLoading(false);
              }}
            >
              Pay Again
            </Button>
            <Button 
              variant="ghost"
              className="w-full h-12 rounded-xl text-rose-700 hover:bg-rose-100 text-sm" 
              onClick={() => navigate({ to: "/customer" })}
            >
              Cancel and go to Dashboard
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border-[#48BB78]/40 shadow-luxe text-center bg-[#F0FFF4]">
            <div className="h-20 w-20 bg-[#48BB78] rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-glow">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-display text-3xl text-[#2F855A] mb-2">
              {method === 'cash' ? "Request Sent!" : "Payment Successful!"}
            </h2>
            <p className="text-[#2F855A]/80 text-sm mb-8">
              {method === 'cash' 
                ? "The tailor has been notified that you will pay the balance in cash upon delivery."
                : "Thank you for your payment. The tailor has been notified."}
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

