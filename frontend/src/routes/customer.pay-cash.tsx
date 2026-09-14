import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export const Route = createFileRoute("/customer/pay-cash")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: search.orderId as string | undefined,
    }
  },
  component: PayCash,
});

function PayCash() {
  const search = Route.useSearch() as { orderId?: string };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const orderId = search.orderId;

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }

    const triggerCashRequest = async () => {
      try {
        await api.put(`/bookings/${orderId}/request-cash`);
        setSuccess(true);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to notify tailor.");
      } finally {
        setLoading(false);
      }
    };

    triggerCashRequest();
  }, [orderId]);

  return (
    <PageShell title="Cash Payment" subtitle="Pay via cash at pickup/delivery">
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-8 border-gold/40 shadow-luxe text-center">
          {loading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="h-12 w-12 text-navy animate-spin mb-4" />
              <p className="text-navy font-display text-xl">Notifying Tailor...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <div className="h-16 w-16 bg-red-100 rounded-full mx-auto flex items-center justify-center text-red-600 mb-6 shadow-glow">
                <span className="text-2xl font-bold">!</span>
              </div>
              <h2 className="font-display text-2xl text-red-600 mb-2">Error</h2>
              <p className="text-muted-foreground text-sm mb-6">{error}</p>
              <Button 
                className="w-full h-12 rounded-xl bg-navy text-cream text-lg hover:bg-navy/90" 
                onClick={() => navigate({ to: "/customer" })}
              >
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <div className="py-8">
              <div className="h-20 w-20 bg-gradient-gold rounded-full mx-auto flex items-center justify-center text-navy mb-6 shadow-glow">
                <HandCoins className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">Tailor Notified</h2>
              <p className="text-muted-foreground text-sm mb-8 px-4">
                We've notified the tailor that you will be paying the remaining balance in cash. 
                Please keep the exact amount ready.
              </p>
              <Button 
                className="w-full h-12 rounded-xl bg-gradient-navy text-cream text-lg shadow-glow" 
                onClick={() => navigate({ to: "/customer" })}
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
