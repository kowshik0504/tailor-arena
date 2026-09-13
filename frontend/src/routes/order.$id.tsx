import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Check, X, AlertCircle, Phone, Mail, User, Image as ImageIcon, Ruler, Scissors, Banknote, ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/order/$id")({
  component: OrderDetails,
});

function OrderDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [changesComment, setChangesComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  
  const [isHandoverPanelOpen, setIsHandoverPanelOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [expectedDate, setExpectedDate] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/bookings/${id}`);
        setOrder(res.data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Loading..." subtitle="Fetching booking details">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold mb-4" />
          <p className="text-mocha">Loading booking details...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell title="Booking Not Found" subtitle="We couldn't find this booking.">
        <Card className="max-w-lg mx-auto p-8 text-center border-border shadow-luxe">
          <AlertCircle className="h-12 w-12 text-terracotta mx-auto mb-4" />
          <h2 className="font-display text-xl text-navy mb-2">Booking Not Found</h2>
          <p className="text-mocha text-sm mb-6">{error || "The booking you're looking for doesn't exist or you don't have access to it."}</p>
          <Button
            variant="outline"
            className="border-navy/20 text-navy"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Card>
      </PageShell>
    );
  }

  const updateStatusLocally = (newStatus: string) => {
    setOrder({ ...order, status: newStatus });
    setIsRejecting(false);
    setIsRequestingChanges(false);
  };

  const handleAccept = async () => {
    try {
      await api.put(`/bookings/${id}/accept`);
      updateStatusLocally("confirmed");
    } catch (err) {
      console.error(err);
      alert("Failed to accept booking.");
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      await api.put(`/bookings/${id}/reject`, { reason: rejectionReason });
      updateStatusLocally("cancelled"); // Using cancelled for rejection
    } catch (err) {
      console.error(err);
      alert("Failed to reject booking.");
    }
  };
  
  const handleRequestChanges = async () => {
    if (!changesComment.trim()) return;
    try {
      await api.put(`/bookings/${id}/hold`);
      updateStatusLocally("hold");
    } catch (err) {
      console.error(err);
      alert("Failed to request changes.");
    }
  };

  const handleHandover = async () => {
    try {
      await api.put(`/bookings/${id}/handover`);
      updateStatusLocally("handed_over");
    } catch (err) {
      console.error(err);
      alert("Failed to mark handover.");
    }
  };

  const handleDelay = async () => {
    if (!delayReason.trim() || !expectedDate) return;
    try {
      await api.put(`/bookings/${id}/delay-handover`, { reason: delayReason, expectedDate });
      setOrder({ ...order, status: "delayed", delayCount: (order.delayCount || 0) + 1 });
      setIsHandoverPanelOpen(false);
      alert("Handover delay recorded and customer notified.");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to record delay.");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gold/20 text-navy-deep",
    acknowledged: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-rose-100 text-rose-800",
    hold: "bg-amber-100 text-amber-800",
    "in-progress": "bg-indigo-100 text-indigo-800",
    delayed: "bg-amber-100 text-amber-800",
    "handed_over": "bg-indigo-100 text-indigo-800",
  };

  const statusLabel = (order.status || "pending").replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const customerName = order.customer?.name || "Customer";
  const formattedDate = order.date ? new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Pending";
  
  const isFullyPaid = (order.amount <= (order.baseAmountPaid || 0)) || order.paymentStatus === 'paid' || order.cashRequestStatus === 'approved';
  const showHandoverAction = (order.status === 'completed' || order.status === 'delayed') && isFullyPaid;

  return (
    <PageShell title={`Booking Details`} subtitle={`Order #${order._id?.slice(-8).toUpperCase()}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back button */}
        <Button
          variant="ghost"
          className="text-mocha hover:text-navy -ml-2 mb-2"
          onClick={() => navigate({ to: "/orders" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>

        {/* Header / Status Line */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-luxe border border-gold/40">
          <div>
            <h2 className="font-display text-2xl text-navy flex items-center gap-3">
              {customerName} 
              <Badge className={`rounded-full ${statusColors[order.status] || 'bg-secondary text-secondary-foreground'}`}>
                {order.status === 'pending' ? 'Pending Review' : statusLabel}
              </Badge>
            </h2>
            <p className="text-sm text-mocha flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {order.customer?.phone || "Not provided"}</span>
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {order.customer?.email || "customer@example.com"}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {order.status === "pending" && !isRejecting && !isRequestingChanges && (
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
            <h3 className="text-amber-800 font-medium mb-2">Request Changes (Hold)</h3>
            <Input placeholder="E.g., Please clarify your measurements..." value={changesComment} onChange={(e) => setChangesComment(e.target.value)} className="mb-3 bg-white" />
            <div className="flex gap-2">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestChanges} disabled={!changesComment.trim()}>Send Request</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsRequestingChanges(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {showHandoverAction && !isHandoverPanelOpen && (
          <Card className="p-6 border-indigo-200 bg-indigo-50 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-indigo-800 font-medium mb-1 flex items-center gap-2">
                  <PackageCheck className="h-5 w-5" /> Handover Status
                </h3>
                <p className="text-sm text-indigo-600/80">Has the cloth been handed over to the customer?</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleHandover}>
                  Yes, Handed Over
                </Button>
                <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100" onClick={() => setIsHandoverPanelOpen(true)}>
                  No
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isHandoverPanelOpen && (
          <Card className="p-6 border-amber-200 bg-amber-50 shadow-sm animate-in fade-in slide-in-from-top-2">
            <h3 className="text-amber-800 font-medium mb-2">Delay Handover</h3>
            <p className="text-xs text-amber-700 mb-4 bg-amber-100 p-2 rounded">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Disclaimer: This delay process is only allowed 3 times per order. (Current delays: {order.delayCount || 0}/3)
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Reason for late delivery</label>
                <Input placeholder="E.g., Customer didn't arrive to pick it up..." value={delayReason} onChange={(e) => setDelayReason(e.target.value)} className="bg-white border-amber-200" />
              </div>
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">New Expected Date</label>
                <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="bg-white border-amber-200" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleDelay} disabled={!delayReason.trim() || !expectedDate || (order.delayCount || 0) >= 3}>
                {(order.delayCount || 0) >= 3 ? "Limit Reached" : "Confirm Delay"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsHandoverPanelOpen(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            {/* Dress Details */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Scissors className="h-5 w-5 text-gold" /> Dress Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Dress Type" value={order.dressType || "Not specified"} />
                <DetailItem label="Work Type" value={order.workType ? order.workType.charAt(0).toUpperCase() + order.workType.slice(1) : "Stitching"} />
                <DetailItem label="Priority" value={order.priority || "Normal"} />
                <DetailItem label="Date Created" value={new Date(order.createdAt).toLocaleDateString()} />
              </div>
            </Card>

            {/* Measurements */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Ruler className="h-5 w-5 text-gold" /> Measurements</h3>
              {order.measurements && order.measurements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {order.measurements.map((m: any, i: number) => (
                    <div key={i} className="bg-cream/30 p-3 rounded-xl border border-border">
                      <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">{m.label}</p>
                      <p className="font-medium text-navy">{m.v || "—"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-navy">No measurements provided.</p>
              )}
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
                <p className="text-navy bg-cream/30 p-3 rounded-lg border border-border whitespace-pre-wrap">{order.notes || "No special instructions provided."}</p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Appointment */}
            <Card className="p-6 shadow-sm border-gold/20 bg-gradient-soft">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-gold" /> Appointment</h3>
              <div className="space-y-3">
                <DetailItem label="Date" value={formattedDate} />
                <DetailItem label="Time Slot" value={order.timeSlot || "Not specified"} />
              </div>
            </Card>

            {/* Payment Details */}
            <Card className="p-6 shadow-sm border-gold/20">
              <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-600" /> Payment</h3>
              <div className="space-y-3">
                <DetailItem label="Amount" value={`₹${order.amount || 0}`} valueClass="text-lg font-bold text-navy" />
                <DetailItem label="Payment Status" value={order.paymentStatus === 'paid' ? 'Paid' : 'Pending'} valueClass={order.paymentStatus === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'} />
                <DetailItem label="Payment Method" value={order.paymentMethod ? order.paymentMethod.replace("_", " ").toUpperCase() : "Online"} />
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
