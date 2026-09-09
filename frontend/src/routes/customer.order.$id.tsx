import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/customer/order/$id")({
  component: CustomerOrderEdit,
});

function CustomerOrderEdit() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [refImage, setRefImage] = useState<string>("");
  const [measurement, setMeasurement] = useState<string>("");
  const [fabric, setFabric] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOrder = () => {
      const saved = localStorage.getItem("orders_board");
      if (saved) {
        const orders = JSON.parse(saved);
        const found = orders.find((o: any) => o.id === id);
        if (found) {
          setOrder(found);
          setNotes(found.notes || "");
          setRefImage(found.designImg || "");
          setMeasurement(found.measurement || "visit");
          setFabric(found.fabric || "own");
        }
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <PageShell title="Loading..."><div className="p-8 text-center">Loading booking details...</div></PageShell>;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setRefImage(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleResubmit = async () => {
    try {
      setOrder((prev: any) => prev ? { ...prev, fabric, notes: "Changes Requested" } : null);
      setFabric("");
    } catch (err) {
      console.error(err);
    }
    
    
    navigate({ to: "/customer/orders" });
  };

  const isChangesRequested = order.status === "Changes Requested";

  return (
    <PageShell title={`Booking Details: ${order.id}`} subtitle={isChangesRequested ? "Please update the requested details." : "View your booking details."}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {isChangesRequested && order.tailorComments && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-amber-900 font-medium text-lg">Changes Requested</h3>
            </div>
            <p className="text-amber-800 text-sm ml-8 whitespace-pre-wrap">{order.tailorComments}</p>
          </div>
        )}

        <Card className="p-6 border-border shadow-luxe bg-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-display text-2xl text-navy">{order.garment}</h2>
              <p className="text-mocha text-sm">{order.category} · {order.occasion}</p>
            </div>
            <Badge className={`rounded-full ${order.status === 'Pending' ? 'bg-gold/20 text-navy-deep' : order.status === 'Changes Requested' ? 'bg-amber-100 text-amber-800' : 'bg-secondary text-secondary-foreground'}`}>
              {order.status === 'Pending' ? 'Pending Review' : order.status}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Measurements</label>
                {isChangesRequested ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div onClick={() => setMeasurement("visit")} className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${measurement === "visit" ? 'border-gold bg-gold/5' : 'border-border bg-white'}`}>
                      <span className="font-medium text-navy text-xs">Shop Visit</span>
                    </div>
                    <div onClick={() => setMeasurement("upload")} className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${measurement === "upload" ? 'border-gold bg-gold/5' : 'border-border bg-white'}`}>
                      <span className="font-medium text-navy text-xs">Upload</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-navy font-medium">{measurement === 'visit' ? 'Shop Visit' : 'Uploaded'}</p>
                )}
              </div>
              
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Fabric</label>
                {isChangesRequested ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div onClick={() => setFabric("own")} className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${fabric === "own" ? 'border-gold bg-gold/5' : 'border-border bg-white'}`}>
                      <span className="font-medium text-navy text-xs">My Own</span>
                    </div>
                    <div onClick={() => setFabric("tailor")} className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${fabric === "tailor" ? 'border-gold bg-gold/5' : 'border-border bg-white'}`}>
                      <span className="font-medium text-navy text-xs">From Tailor</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-navy font-medium">{fabric === 'own' ? 'Providing my own' : 'Need from tailor'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-mocha mb-3 block">Reference Image</label>
                {isChangesRequested ? (
                  <>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    {refImage && !refImage.includes("linear-gradient") ? (
                      <div className="relative h-24 w-32 rounded-xl overflow-hidden border border-gold/40">
                        <img src={refImage} alt="Reference" className="w-full h-full object-cover" />
                        <button onClick={() => setRefImage("")} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full h-5 w-5 text-[10px] flex items-center justify-center">×</button>
                      </div>
                    ) : (
                      <Button variant="outline" className="border-dashed border-2 border-gold/40 h-16 w-full text-mocha hover:bg-gold/5 text-xs" onClick={() => fileInputRef.current?.click()}>
                        + Upload New Reference
                      </Button>
                    )}
                  </>
                ) : (
                  refImage && !refImage.includes("linear-gradient") ? (
                    <img src={refImage} alt="Reference" className="rounded-xl border border-gold/40 max-h-32 object-cover" />
                  ) : <p className="text-mocha text-sm italic">No image uploaded.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <label className="text-[11px] uppercase tracking-wider text-mocha mb-2 block">Additional Notes</label>
            {isChangesRequested ? (
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-white text-navy focus:border-gold text-sm"
              />
            ) : (
              <p className="text-navy bg-cream/30 p-3 rounded-lg border border-border">{notes || "No notes provided."}</p>
            )}
          </div>
        </Card>

        {isChangesRequested && (
          <Button onClick={handleResubmit} className="w-full bg-gradient-navy text-cream h-12 rounded-xl font-bold shadow-navy text-lg gap-2">
            <RefreshCw className="h-5 w-5" /> Resubmit Booking
          </Button>
        )}
      </div>
    </PageShell>
  );
}
