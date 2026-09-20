import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, IndianRupee, CalendarDays, AlertCircle, Bell, Check, HandCoins, X, CheckCircle2 } from "lucide-react";

const formatTime = (time: number) => {
  const diffMs = Date.now() - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const Route = createFileRoute("/notifications")({ component: Notifications });

type Reminder = {
  type: "Delivery" | "Payment" | "Appointment" | "Delayed";
  title: string;
  detail: string;
  when: string;
  I: typeof Bell;
  tint: string;
  isCashRequest?: boolean;
  isOnlineRequest?: boolean;
  orderId?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onOnlineApprove?: () => void;
  onOnlineReject?: () => void;
};

const filters = ["All", "Delivery", "Payment", "Appointment", "Delayed"];

function Notifications() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/bookings/tailor');
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOnlineAction = async (orderId: string, action: 'confirm-online' | 'reject-online') => {
    try {
      await api.put(`/bookings/${orderId}/${action}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, onlinePaymentStatus: action === 'confirm-online' ? 'approved' : 'rejected', paymentStatus: action === 'confirm-online' ? 'paid' : o.paymentStatus } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCashAction = async (orderId: string, action: 'confirm' | 'reject') => {
    try {
      await api.put(`/bookings/${orderId}/${action}-cash`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, cashRequestStatus: action === 'confirm' ? 'approved' : 'rejected', paymentStatus: action === 'confirm' ? 'paid' : o.paymentStatus } : o));
    } catch (err) {
      console.error(`Failed to ${action} cash payment`, err);
    }
  };

  const reminders: Reminder[] = orders
    .filter(o => ["Pending", "New", "Ready for Delivery", "Request Changes", "Changes Requested", "In Stitching"].includes(o.status) || o.cashRequestStatus === 'pending' || o.onlinePaymentStatus === 'pending')
    .map(o => {
      let type: "Delivery" | "Payment" | "Appointment" | "Delayed" = "Appointment";
      let title = "Action needed";
      let I = CalendarDays;
      let tint = "bg-gradient-rose";
      
      const updateTime = new Date(o.updatedAt || o.createdAt).getTime();
      let when = o.due || o.delivery || formatTime(updateTime);
      let detail = "";
      let isCashRequest = false;
      let isOnlineRequest = false;

      if (o.cashRequestStatus === 'pending' && o.paymentMethod === 'cash') {
        type = "Payment";
        title = "Cash Payment Verification";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] Remaining amount of ₹${o.amount - (o.baseAmountPaid || Math.min(500, o.amount))} requested to be paid via CASH`;
        I = HandCoins;
        tint = "bg-gradient-cream text-navy";
        when = formatTime(updateTime);
        isCashRequest = true;
      } else if (o.onlinePaymentStatus === 'pending') {
        type = "Payment";
        title = "Online Payment Verification";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] Remaining amount of ₹${o.amount - (o.baseAmountPaid || Math.min(500, o.amount))} paid via ${(o.paymentMethod || 'upi').toUpperCase()}`;
        I = IndianRupee;
        tint = "bg-gradient-cream text-navy";
        when = formatTime(updateTime);
        isOnlineRequest = true;
      } else if (o.cashRequestStatus === 'pending') {
        type = "Payment";
        title = "Cash Payment Verification";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] Remaining amount of ₹${o.amount - (o.baseAmountPaid || Math.min(500, o.amount))} requested to be paid via CASH`;
        I = HandCoins;
        tint = "bg-gradient-cream text-navy";
        when = formatTime(updateTime);
        isCashRequest = true;
      } else if (o.status === "Pending" || o.status === "New") {
        type = "Action Required";
        title = "New Booking Request";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} - ${o.dressType || o.dress || 'Custom Order'}`;
        I = Clock;
        tint = "bg-champagne text-navy";
      } else if (o.status === "Rejected") {
        type = "Declined";
        title = "Booking Rejected";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} - ${o.dressType || o.dress || 'Custom Order'}`;
        I = AlertCircle;
        tint = "bg-rose-100 text-rose-800";
      } else if (o.status === "Request Changes" || o.status === "Changes Requested") {
        type = "Delayed";
        title = "Changes Requested";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} requested changes`;
        I = AlertCircle;
        tint = "bg-terracotta/15 text-terracotta";
      } else if (o.status === "Ready for Delivery") {
        type = "Delivery";
        title = "Ready for Delivery";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} - Ready for Delivery`;
        I = Package;
        tint = "bg-gradient-luxe text-primary-foreground";
      } else if (o.status === "In Stitching") {
        type = "Delivery";
        title = "In Progress";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} - In Progress`;
        I = Package;
        tint = "bg-gradient-cream";
      } else {
        type = "Notice";
        title = "Update";
        detail = `[${o.orderId || `TA-${o._id.slice(-6).toUpperCase()}`}] ${o.customer?.name || 'Customer'} - ${o.dressType || o.dress || 'Custom Order'}`;
        I = AlertCircle;
        tint = "bg-gold/15 text-navy";
      }

      return {
        type,
        title,
        detail,
        when,
        I,
        tint,
        isCashRequest,
        isOnlineRequest,
        orderId: o._id,
        onApprove: () => handleCashAction(o._id, 'confirm'),
        onReject: () => handleCashAction(o._id, 'reject'),
        onOnlineApprove: () => handleOnlineAction(o._id, 'confirm-online'),
        onOnlineReject: () => handleOnlineAction(o._id, 'reject-online')
      };
    });

  return (
    <PageShell title="Reminders" subtitle="Gentle nudges so nothing slips through.">
      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <Badge key={f} variant={i === 0 ? "default" : "outline"} className="rounded-full px-4 py-1.5 cursor-pointer">
            {f}
          </Badge>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-cream0 rounded-xl">
            All caught up. No reminders at the moment!
          </div>
        ) : reminders.map((r, i) => {
          const isPayment = r.isOnlineRequest || r.isCashRequest;
          return (
          <Card key={i} className="p-5 border-gold/60 shadow-luxe hover:shadow-glow transition group">
            <Link to={isPayment ? "/wallet" : "/order/$id"} params={isPayment ? undefined : { id: r.orderId! }} search={isPayment ? { highlight: r.orderId } : undefined} className="block cursor-pointer">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-luxe ${r.tint}`}>
                  <r.I className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="rounded-full text-[10px] border-gold/70">{r.type}</Badge>
              </div>
              <p className="font-display text-lg mt-4">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
            </Link>
            
            <div className="mt-4 pt-3 border-t border-gold/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-mocha">{r.when}</span>
                {isPayment ? (
                  <div className="flex items-center gap-2">
                    {!r.isCashRequest && (
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs px-3 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); r.isOnlineRequest ? r.onOnlineReject?.() : r.onReject?.(); }}>
                        No (Decline)
                      </Button>
                    )}
                    <Button size="sm" className="rounded-full h-7 text-xs px-3 bg-navy text-white hover:bg-navy/90 gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); r.isOnlineRequest ? r.onOnlineApprove?.() : r.onApprove?.(); }}>
                      <Check className="h-3 w-3" /> Yes (Confirm)
                    </Button>
                  </div>
                ) : (
                  <Link to={"/order/$id"} params={{ id: r.orderId! }}>
                    <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs gap-1 opacity-60 group-hover:opacity-100">
                      <Check className="h-3 w-3" /> View Order
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        )})}
      </div>
    </PageShell>
  );
}













