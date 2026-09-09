import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Check, X, AlertCircle, Phone, Mail, User, Image as ImageIcon, Ruler, Scissors, Banknote } from "lucide-react";

export const Route = createFileRoute("/order/$id")({
  component: OrderDetails,
});

function OrderDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [changesComment, setChangesComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  useEffect(() => {
    const fetchOrder = () => {
      const saved = localStorage.getItem("orders_board");
      if (saved) {
        const orders = JSON.parse(saved);
        const found = orders.find((o: any) => o.id === id);
        if (found) setOrder(found);
      }
    };
    fetchOrder();

    const handleStorage = (e?: StorageEvent) => {
      if (!e || e.key === "orders_board") fetchOrder();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id]);

  if (!order) return <PageShell title="Loading..."><div className="p-8 text-center">Loading booking details...</div></PageShell>;

  const updateStatus = (newStatus: string, extraFields: any = {}) => {
    const saved = localStorage.getItem("orders_board");
    if (saved) {
      let orders = JSON.parse(saved);
      orders = orders.map((o: any) => o.id === id ? { ...o, status: newStatus, ...extraFields } : o);
      localStorage.setItem("orders_board", JSON.stringify(orders));
      window.dispatchEvent(new Event("storage"));
      setOrder({ ...order, status: newStatus, ...extraFields });
      
      // Reset modes
      setIsRejecting(false);
      setIsRequestingChanges(false);
    }
  };

  const notifyCustomer = (title: string, message: string) => {
    const str = localStorage.getItem("customer_notifications");
    const notes = str ? JSON.parse(str) : [];
    notes.unshift({
      id: Date.now().toString(),
      orderId: id,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    localStorage.setItem("customer_notifications", JSON.stringify(notes));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAccept = () => {
    updateStatus("Accepted");
    notifyCustomer("Booking Accepted", `Your booking ${id} has been accepted by the tailor.`);
  };
  
  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    updateStatus("Rejected", { rejectionReason });
    notifyCustomer("Booking Rejected", `Your booking ${id} was rejected.\nReason: ${rejectionReason}`);
  };
  
  const handleRequestChanges = () => {
    if (!changesComment.trim()) return;
    updateStatus("Changes Requested", { tailorComments: changesComment });
    notifyCustomer("Changes Requested", `Kowshik Tailor has requested updates to your booking.\nBooking ID: ${id}\n\nReason:\n${changesComment}`);
  };

  return (
    <PageShell title={`Booking Details: ${order.id}`} subtitle="Manage customer appointment and requirements.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Status Line */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-luxe border border-gold/40">
          <div>
            <h2 className="font-display text-2xl text-navy flex items-center gap-3">
              {order.customer} 
              <Badge className={`rounded-full ${order.status === 'Pending' ? 'bg-gold/20 text-navy-deep' : order.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : order.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                {order.status === 'Pending' ? 'Pending Review' : order.status}
              </Badge>
            </h2>
            <p className="text-sm text-mocha flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {order.phone || "+91 98765 43210"}</span>
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {order.email || "customer@example.com"}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {order.status === "Pending" && !isRejecting && !isRequestingChanges && (
              <>
                <Button className="bg-gradient-navy text-cream shadow-navy rounded-xl h-10 px-6 gap-2" onClick={handleAccept}>
                  <Check className="h-4 w-4" /> Accept Booking
                </Button>
                <Button variant="outline" className="border-gold/40 text-navy hover:bg-gold/10 rounded-xl h-10 px-4" onClick={() => setIsRequestingChanges(true)}>
                  Request Changes
                </Button>
                <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 rounded-xl h-10 px-4 gap-2" onClick={() => setIsRejecting(true)}>
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Action Panels */}
        {isRejecting && (
          <Card className="p-6 border-rose-200 bg-rose-50 shadow-sm animate-in fade-in slide-in-from-top-2">
            <h3 className="text-rose-800 font-medium mb-2">Reject Booking</h3>
            <Input placeholder="Enter reason for rejection (required)..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mb-3 bg-white" />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>Confirm Rejection</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {isRequestingChanges && (
          <Card className="p-6 border-amber-200 bg-amber-50 shadow-sm animate-in fade-in slide-in-from-top-2">
            <h3 className="text-amber-800 font-medium mb-2">Request Changes</h3>
            <Input placeholder="E.g., Please upload clearer measurements..." value={changesComment} onChange={(e) => setChangesComment(e.target.value)} className="mb-3 bg-white" />
            <div className="flex gap-2">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestChanges} disabled={!changesComment.trim()}>Send Request</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsRequestingChanges(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            {/* Dress Details */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Scissors className="h-5 w-5 text-gold" /> Dress Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Dress Type" value={order.garment || order.dress} />
                <DetailItem label="Category" value={order.category || "Women"} />
                <DetailItem label="Occasion" value={order.occasion || "Wedding"} />
                <DetailItem label="Fabric" value={order.fabric === 'own' ? "Customer's Own Fabric" : (order.fabric === 'tailor' ? "Tailor Provides Fabric" : order.fabric)} />
              </div>
            </Card>

            {/* Measurements */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Ruler className="h-5 w-5 text-gold" /> Measurements</h3>
              <p className="text-navy">{order.measurement === 'visit' ? "Customer will visit the shop for measurements." : "Customer has uploaded measurements."}</p>
            </Card>

            {/* Images & Notes */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-gold" /> Reference Images & Notes</h3>
              {order.designImg && !order.designImg.includes("linear-gradient") ? (
                <div className="mb-4">
                  <p className="text-xs uppercase text-mocha mb-2">Reference Upload</p>
                  <img src={order.designImg} alt="Reference" className="rounded-xl border border-gold/40 max-h-64 object-cover" />
                </div>
              ) : (
                <p className="text-mocha text-sm italic mb-4">No reference images uploaded.</p>
              )}
              <div>
                <p className="text-xs uppercase text-mocha mb-1">Additional Notes</p>
                <p className="text-navy bg-cream/30 p-3 rounded-lg border border-border">{order.notes || "No special instructions provided."}</p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Appointment */}
            <Card className="p-6 shadow-sm border-gold/20 bg-gradient-soft">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold" /> Appointment</h3>
              <div className="space-y-3">
                <DetailItem label="Date" value={order.due || "Pending"} />
                <DetailItem label="Time Slot" value="11:30 AM (Requested)" />
              </div>
            </Card>

            {/* Payment Details */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-600" /> Payment</h3>
              <div className="space-y-3">
                <DetailItem label="Payment ID" value={order.paymentId || "PAY-XXX"} valueClass="font-mono text-sm" />
                <DetailItem label="Payment Status" value={order.paymentStatus || "Paid"} valueClass="text-emerald-600 font-medium" />
                <DetailItem label="Amount Paid" value={order.priority === 'VIP' ? '₹1500' : order.priority === 'High' ? '₹500' : '₹500 (Base)'} />
                <DetailItem label="Payment Time" value={order.bookedAt || "Just now"} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function DetailItem({ label, value, valueClass = "text-navy" }: { label: string, value: string, valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-mocha mb-0.5">{label}</p>
      <p className={`font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
