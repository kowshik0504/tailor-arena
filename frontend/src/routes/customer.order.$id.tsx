import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, Clock, AlertCircle, RefreshCw, User, Scissors,
  CreditCard, FileText, Image, Tag, ArrowLeft, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export const Route = createFileRoute("/customer/order/$id")({
  component: CustomerOrderDetails,
});

function CustomerOrderDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data);
      } catch (err: any) {
        console.error("Failed to fetch booking:", err);
        setError(err.response?.data?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Loading..." subtitle="Fetching your booking details">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold mb-4" />
          <p className="text-mocha">Loading booking details...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !booking) {
    return (
      <PageShell title="Booking Not Found" subtitle="We couldn't find this booking.">
        <Card className="max-w-lg mx-auto p-8 text-center border-border shadow-luxe">
          <AlertCircle className="h-12 w-12 text-terracotta mx-auto mb-4" />
          <h2 className="font-display text-xl text-navy mb-2">Booking Not Found</h2>
          <p className="text-mocha text-sm mb-6">{error || "The booking you're looking for doesn't exist or you don't have access to it."}</p>
          <Button
            variant="outline"
            className="border-navy/20 text-navy"
            onClick={() => navigate({ to: "/customer" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Card>
      </PageShell>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    acknowledged: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-rose-100 text-rose-800",
    hold: "bg-orange-100 text-orange-800",
    "in-progress": "bg-indigo-100 text-indigo-800",
  };

  const priorityColors: Record<string, string> = {
    Normal: "bg-secondary text-secondary-foreground",
    High: "bg-amber-100 text-amber-800",
    VIP: "bg-gradient-gold text-navy-deep",
  };

  const formattedDate = booking.date
    ? new Date(booking.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const tailorName =
    booking.tailor?.shopName ||
    booking.tailor?.user?.name ||
    "Tailor";

  const statusLabel = (booking.status || "pending").replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <PageShell title="Booking Details" subtitle={`Order #${booking._id?.slice(-8).toUpperCase()}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back button */}
        <Button
          variant="ghost"
          className="text-mocha hover:text-navy -ml-2"
          onClick={() => navigate({ to: "/customer" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Status banner */}
        <Card className="p-5 border-gold/60 shadow-luxe flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-luxe flex items-center justify-center">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl text-navy">{booking.dressType}</h2>
              <p className="text-xs text-mocha capitalize">{booking.workType || "stitching"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {booking.priority && booking.priority !== "Normal" && (
              <Badge className={`rounded-full ${priorityColors[booking.priority] || ""}`}>
                {booking.priority}
              </Badge>
            )}
            <Badge className={`rounded-full ${statusColors[booking.status] || "bg-secondary text-secondary-foreground"}`}>
              {statusLabel}
            </Badge>
          </div>
        </Card>

        {/* Main details */}
        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-lg text-navy mb-5">Booking Information</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Tailor */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Tailor</p>
                <p className="font-medium text-navy">{tailorName}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <CalendarDays className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Appointment Date</p>
                <p className="font-medium text-navy">{formattedDate}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Time Slot</p>
                <p className="font-medium text-navy">{booking.timeSlot || "—"}</p>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <Tag className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Priority</p>
                <p className="font-medium text-navy">{booking.priority || "Normal"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment details */}
        <Card className="p-6 border-gold/60 shadow-luxe">
          <h3 className="font-display text-lg text-navy mb-5">Payment</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Amount</p>
                <p className="font-display text-2xl text-navy">₹{booking.amount || 0}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Payment Status</p>
                <Badge className={`rounded-full ${booking.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {(booking.paymentStatus || "pending").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </Badge>
              </div>
            </div>
            {booking.paymentMethod && (
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Payment Method</p>
                  <p className="font-medium text-navy capitalize">{booking.paymentMethod}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Design image */}
        {booking.designImg && !booking.designImg.includes("linear-gradient") && (
          <Card className="p-6 border-gold/60 shadow-luxe">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-mocha" /> Reference Design
            </h3>
            <div className="rounded-xl overflow-hidden border border-gold/30 inline-block">
              <img src={booking.designImg} alt="Reference design" className="max-h-64 object-cover" />
            </div>
          </Card>
        )}

        {/* Notes */}
        {booking.notes && (
          <Card className="p-6 border-gold/60 shadow-luxe">
            <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-mocha" /> Additional Notes
            </h3>
            <p className="text-navy bg-cream/30 p-4 rounded-xl border border-border whitespace-pre-wrap">
              {booking.notes}
            </p>
          </Card>
        )}

        {/* Measurements */}
        {booking.measurements && booking.measurements.length > 0 && (
          <Card className="p-6 border-gold/60 shadow-luxe">
            <h3 className="font-display text-lg text-navy mb-4">Measurements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {booking.measurements.map((m: any, i: number) => (
                <div key={i} className="bg-cream/30 p-3 rounded-xl border border-border">
                  <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">{m.label}</p>
                  <p className="font-medium text-navy">{m.v || "—"}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="p-5 border-gold/60 shadow-luxe bg-gradient-soft">
          <div className="flex flex-wrap gap-8 text-xs text-mocha">
            {booking.createdAt && (
              <div>
                <span className="uppercase tracking-wider">Booked On:</span>{" "}
                <span className="text-navy font-medium">
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>
            )}
            {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
              <div>
                <span className="uppercase tracking-wider">Last Updated:</span>{" "}
                <span className="text-navy font-medium">
                  {new Date(booking.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex-1 border-navy/20 text-navy h-12 rounded-xl"
            onClick={() => navigate({ to: "/customer" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <Button
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 h-12 rounded-xl"
              onClick={async () => {
                if (confirm("Are you sure you want to cancel this booking?")) {
                  try {
                    await api.put(`/bookings/${id}/cancel`);
                    setBooking((prev: any) => prev ? { ...prev, status: "cancelled" } : prev);
                  } catch (err) {
                    console.error("Cancel error:", err);
                    alert("Failed to cancel booking.");
                  }
                }
              }}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
