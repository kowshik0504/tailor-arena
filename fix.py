import os
import re

print("Starting fixes in tailor directory...")

# 1. Fix notifications.tsx
with open("frontend/src/routes/notifications.tsx", "r", encoding="utf-8") as f:
    notif = f.read()

if "import { createFileRoute, Link }" not in notif:
    notif = notif.replace("import { createFileRoute } from \"@tanstack/react-router\";", "import { createFileRoute, Link } from \"@tanstack/react-router\";")

notif = re.sub(
    r"isCashRequest\?: boolean;\s*isOnlineRequest\?: boolean;\s*orderId\?: string;\s*onApprove\?: \(\) => void;\s*onReject\?: \(\) => void;\s*\};",
    "isCashRequest?: boolean;\n  isOnlineRequest?: boolean;\n  orderId?: string;\n  onApprove?: () => void;\n  onReject?: () => void;\n  onOnlineApprove?: () => void;\n  onOnlineReject?: () => void;\n};",
    notif
)

notif = notif.replace("await api.put(`/bookings/${action}`);", "await api.put(`/bookings/${orderId}/${action}`);")
notif = notif.replace("await api.put(`/bookings//`);", "await api.put(`/bookings/${orderId}/${action}`);")

notif = re.sub(
    r"detail: o\.onlinePaymentStatus === 'pending' \? `[^`]+` : o\.cashRequestStatus === 'pending' \? `[^`]+` : `[^`]+`,",
    "detail: o.onlinePaymentStatus === 'pending' ? `Remaining amount of ?${o.amount - (o.baseAmountPaid || Math.min(500, o.amount))} received in ${o.paymentMethod || 'upi'}` : o.cashRequestStatus === 'pending' ? `Remaining amount of ?${o.amount - (o.baseAmountPaid || Math.min(500, o.amount))} must be pay in cash` : `${o.customer?.name || 'Customer'} - ${o.dressType || o.dress || 'Custom Order'}`,",
    notif
)

oldCardRegex = r'<Card key=\{i\} className="p-5 border-gold/60 shadow-luxe hover:shadow-glow transition group">([\s\S]*?)</Card>'
newCard = """<Card key={i} className="p-5 border-gold/60 shadow-luxe hover:shadow-glow transition group">
            <Link to="/order/$id" params={{ id: r.orderId! }} className="block cursor-pointer">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-luxe ${r.tint}`}>
                  <r.I className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="rounded-full text-[10px] border-gold/70">{r.type}</Badge>
              </div>
              <p className="font-display text-lg mt-4">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
            </Link>
            
            {r.isOnlineRequest ? (
              <div className="mt-4 pt-3 border-t border-gold/40 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" className="rounded-full h-8 flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { e.preventDefault(); r.onOnlineReject?.(); }}>
                  <X className="h-3 w-3 mr-1" /> Not
                </Button>
                <Button size="sm" className="rounded-full h-8 flex-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={(e) => { e.preventDefault(); r.onOnlineApprove?.(); }}>
                  <Check className="h-3 w-3 mr-1" /> Checked in bank
                </Button>
              </div>
            ) : r.isCashRequest ? (
              <div className="mt-4 pt-3 border-t border-gold/40 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" className="rounded-full h-8 flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { e.preventDefault(); r.onReject?.(); }}>
                  <X className="h-3 w-3 mr-1" /> No
                </Button>
                <Button size="sm" className="rounded-full h-8 flex-1 text-xs bg-navy text-cream" onClick={(e) => { e.preventDefault(); r.onApprove?.(); }}>
                  <Check className="h-3 w-3 mr-1" /> Received in hand
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-gold/40 flex items-center justify-between">
                <span className="text-[11px] text-mocha">{r.when}</span>
                <Link to="/order/$id" params={{ id: r.orderId! }}>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs gap-1 opacity-60 group-hover:opacity-100">
                    <Check className="h-3 w-3" /> View Order
                  </Button>
                </Link>
              </div>
            )}
          </Card>"""

notif = re.sub(oldCardRegex, newCard.replace("\\", "\\\\"), notif)
with open("frontend/src/routes/notifications.tsx", "w", encoding="utf-8") as f:
    f.write(notif)


# 2. Fix order.$id.tsx
with open("frontend/src/routes/order.$id.tsx", "r", encoding="utf-8") as f:
    orderDetails = f.read()

if "handleCashAction" not in orderDetails:
    orderDetails = orderDetails.replace(
        "  const handleHandover = async () => {",
        "  const handleCashAction = async (action: 'confirm' | 'reject') => {\n    try {\n      await api.put(`/bookings/${id}/${action}-cash`);\n      setOrder({ ...order, cashRequestStatus: action === 'confirm' ? 'approved' : 'rejected', paymentStatus: action === 'confirm' ? 'paid' : order.paymentStatus });\n    } catch(err) { console.error(err); }\n  };\n\n  const handleOnlineAction = async (action: 'confirm-online' | 'reject-online') => {\n    try {\n      await api.put(`/bookings/${id}/${action}`);\n      setOrder({ ...order, onlinePaymentStatus: action === 'confirm-online' ? 'approved' : 'rejected', paymentStatus: action === 'confirm-online' ? 'paid' : order.paymentStatus });\n    } catch(err) { console.error(err); }\n  };\n\n  const handleHandover = async () => {"
    )

if "Customer handed over cash?" not in orderDetails:
    orderDetails = re.sub(
        r"              \{\/\* Payment Details \*\/\}[\s\S]*?<\/Card>",
        """              {/* Payment Details */}
              <Card className="p-6 shadow-sm border-gold/20">
                <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-600" /> Payment</h3>
                <div className="space-y-3">
                  <DetailItem label="Amount" value={`?${order.amount || 0}`} valueClass="text-lg font-bold text-navy" />
                  <DetailItem label="Payment Status" value={order.paymentStatus === 'paid' ? 'Paid' : 'Pending'} valueClass={order.paymentStatus === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'} />
                  <DetailItem label="Payment Method" value={order.paymentMethod ? order.paymentMethod.replace("_", " ").toUpperCase() : "Online"} />
                </div>

                {order.cashRequestStatus === 'pending' && (
                  <div className="mt-6 pt-4 border-t border-gold/20">
                    <p className="text-sm font-medium text-navy mb-3">Customer handed over cash?</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleCashAction('reject')}><X className="h-4 w-4 mr-2" /> No</Button>
                      <Button className="flex-1 bg-navy text-cream" onClick={() => handleCashAction('confirm')}><Check className="h-4 w-4 mr-2" /> Received in hand</Button>
                    </div>
                  </div>
                )}

                {order.onlinePaymentStatus === 'pending' && (
                  <div className="mt-6 pt-4 border-t border-gold/20">
                    <p className="text-sm font-medium text-navy mb-3">Customer paid online. Did you receive it in your bank?</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleOnlineAction('reject-online')}><X className="h-4 w-4 mr-2" /> No</Button>
                      <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleOnlineAction('confirm-online')}><Check className="h-4 w-4 mr-2" /> Received in bank</Button>
                    </div>
                  </div>
                )}
              </Card>""".replace("\\", "\\\\"),
        orderDetails
    )
with open("frontend/src/routes/order.$id.tsx", "w", encoding="utf-8") as f:
    f.write(orderDetails)


# 3. Fix customer dummy payment
with open("frontend/src/routes/customer.dummy-payment.tsx", "r", encoding="utf-8") as f:
    dummyPay = f.read()

if "api.put(`/bookings/${search.orderId}/pay-online`" not in dummyPay:
    dummyPay = re.sub(
        r"  const handlePay = \(\) => \{\s*setLoading\(true\);\s*\/\/ Simulate payment processing delay\s*setTimeout\(\(\) => \{\s*setLoading\(false\);\s*setSuccess\(true\);\s*\}, 1500\);\s*\};",
        """  const handlePay = async () => {
    setLoading(true);
    try {
      if (search.orderId) {
        await api.put(`/bookings/${search.orderId}/pay-online`, { method });
      }
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 500);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Payment failed. Please try again.");
    }
  };""".replace("\\", "\\\\"),
        dummyPay
    )
    with open("frontend/src/routes/customer.dummy-payment.tsx", "w", encoding="utf-8") as f:
        f.write(dummyPay)


# 4. Fix Backend routes
with open("backend/routes/bookingRoutes.js", "r", encoding="utf-8") as f:
    bRoutes = f.read()

if "pay-online" not in bRoutes:
    bRoutes = bRoutes.replace(
        "module.exports = router;",
        "router.put('/:id/pay-online', protect, roleCheck('customer'), bookingController.payOnline);\nrouter.put('/:id/confirm-online', protect, roleCheck('tailor'), bookingController.confirmOnlinePayment);\nrouter.put('/:id/reject-online', protect, roleCheck('tailor'), bookingController.rejectOnlinePayment);\n\nmodule.exports = router;"
    )
    with open("backend/routes/bookingRoutes.js", "w", encoding="utf-8") as f:
        f.write(bRoutes)


# 5. Fix Backend controller for cash payment method
with open("backend/controllers/bookingController.js", "r", encoding="utf-8") as f:
    bController = f.read()

if "booking.paymentMethod = 'cash';" not in bController:
    bController = bController.replace(
        "booking.cashRequestStatus = 'pending';",
        "booking.cashRequestStatus = 'pending';\n      booking.paymentMethod = 'cash';"
    )
    with open("backend/controllers/bookingController.js", "w", encoding="utf-8") as f:
        f.write(bController)

print("Done")
