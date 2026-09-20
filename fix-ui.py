import os
import re

with open("frontend/src/routes/order.$id.tsx", "r", encoding="utf-8") as f:
    orderStr = f.read()

newPaymentDetails = """
              <Card className="p-6 shadow-sm border-gold/20 print:shadow-none print:border-0 print:p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-navy flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-600 print:hidden" /> Payment Breakdown</h3>
                  <Button size="sm" variant="outline" className="text-xs h-7 rounded-full print:hidden" onClick={() => window.print()}>
                    <Printer className="h-3 w-3 mr-1" /> Print Invoice
                  </Button>
                </div>
                <div className="space-y-3 print:space-y-2">
                  <DetailItem label="Total Amount" value={`?${order.amount || 0}`} valueClass="text-lg font-bold text-navy" />
                  <DetailItem label="Advance Paid" value={`?${order.baseAmountPaid || Math.min(500, order.amount)}`} valueClass="text-emerald-600 font-medium" />
                  <DetailItem label="Advance Method" value="Online" />
                  <div className="border-t border-gold/20 pt-3 mt-3"></div>
                  <DetailItem label="Remaining Amount" value={`?${order.amount - (order.baseAmountPaid || Math.min(500, order.amount))}`} valueClass="text-md font-bold text-rose-600" />
                  <DetailItem label="Remaining Status" value={order.paymentStatus === 'paid' ? 'Paid' : 'Pending'} valueClass={order.paymentStatus === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'} />
                  {order.paymentStatus === 'paid' && order.paymentMethod && (
                    <DetailItem label="Remaining Method" value={order.paymentMethod.replace('_', ' ').toUpperCase()} />
                  )}
                </div>

                {order.cashRequestStatus === 'pending' && (
                  <div className="mt-6 pt-4 border-t border-gold/20 print:hidden">
                    <p className="text-sm font-medium text-navy mb-3">Customer wants to pay remaining cash?</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleCashAction('reject')}><X className="h-4 w-4 mr-2" /> No</Button>
                      <Button className="flex-1 bg-navy text-cream" onClick={() => handleCashAction('confirm')}><Check className="h-4 w-4 mr-2" /> Received in wallet</Button>
                    </div>
                  </div>
                )}

                {order.onlinePaymentStatus === 'pending' && (
                  <div className="mt-6 pt-4 border-t border-gold/20 print:hidden">
                    <p className="text-sm font-medium text-navy mb-3">Customer paid remaining online. Check your bank?</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleOnlineAction('reject-online')}><X className="h-4 w-4 mr-2" /> No</Button>
                      <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleOnlineAction('confirm-online')}><Check className="h-4 w-4 mr-2" /> Received in bank</Button>
                    </div>
                  </div>
                )}
              </Card>
"""

orderStr = re.sub(r'<Card className="p-6 shadow-sm border-gold/20">[\s\S]*?\{\/\* Handover Action \*\/\}', newPaymentDetails.replace("\\", "\\\\") + "\n            {/* Handover Action */}", orderStr)

if "Printer" not in orderStr:
    orderStr = orderStr.replace("Check, CalendarDays, Edit3, Image as ImageIcon, MapPin", "Check, CalendarDays, Edit3, Image as ImageIcon, MapPin, Printer")

with open("frontend/src/routes/order.$id.tsx", "w", encoding="utf-8") as f:
    f.write(orderStr)

with open("frontend/src/routes/customer.order.$id.tsx", "r", encoding="utf-8") as f:
    custStr = f.read()

custPayment = """
        {/* Payment details */}
        <Card className="p-6 border-gold/60 shadow-luxe print:shadow-none print:border-0 print:p-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg text-navy flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600 print:hidden" /> Payment Breakdown</h3>
            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full print:hidden" onClick={() => window.print()}>
              <Printer className="h-3 w-3 mr-1" /> Print / Download
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0 print:hidden">
                <CreditCard className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Total Amount</p>
                <p className="font-display text-xl text-navy">?{booking.amount || 0}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0 print:hidden">
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-600 mb-1">Advance Paid</p>
                <p className="font-display text-xl text-emerald-600">?{booking.baseAmountPaid || Math.min(500, booking.amount)}</p>
                <p className="text-xs text-mocha">Online</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-t border-gold/20 pt-4">
              <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 print:hidden">
                <CreditCard className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-rose-600 mb-1">Remaining Balance</p>
                <p className="font-display text-xl text-rose-600">?{booking.amount - (booking.baseAmountPaid || Math.min(500, booking.amount))}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-gold/20 pt-4">
              <div className="h-9 w-9 rounded-lg bg-champagne/50 flex items-center justify-center shrink-0 print:hidden">
                <Check className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mocha mb-1">Remaining Status</p>
                <Badge className={`rounded-full ${booking.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {(booking.paymentStatus || "pending").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
                {booking.paymentStatus === 'paid' && booking.paymentMethod && (
                  <p className="text-xs text-mocha mt-1">Paid via {booking.paymentMethod.toUpperCase()}</p>
                )}
              </div>
            </div>
          </div>
"""

custStr = re.sub(r'\{\/\* Payment details \*\/\}[\s\S]*?\{\/\* Design image \*\/\}', custPayment.replace("\\", "\\\\") + "\n        {/* Design image */}", custStr)

if "Printer" not in custStr:
    custStr = custStr.replace("CreditCard,", "CreditCard, Printer,")
    
with open("frontend/src/routes/customer.order.$id.tsx", "w", encoding="utf-8") as f:
    f.write(custStr)
print("Done")
