import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, User, Scissors, Banknote, Search, History as HistoryIcon, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/tailor');
      // Filter for completed or cancelled orders
      const historyOrders = res.data.filter((b: any) => 
        b.status === "completed" || b.status === "cancelled"
      );
      setOrders(historyOrders);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => 
    o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageShell title="Order History" subtitle="View your past completed and cancelled orders.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mocha/60" />
          <Input 
            placeholder="Search by customer or ID..." 
            className="pl-9 bg-white border-gold/40 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-gold/60 shadow-luxe overflow-hidden bg-white/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-soft text-mocha text-[10px] uppercase tracking-wider border-b border-gold/40">
              <tr>
                <th className="px-6 py-4 font-medium">Order Details</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-mocha">
                    Loading history...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <HistoryIcon className="h-10 w-10 text-mocha/30 mx-auto mb-3" />
                    <p className="text-navy font-medium">No order history found</p>
                    <p className="text-mocha text-xs mt-1">Completed and cancelled orders will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-navy">{order.dressType || "Garment"}</span>
                        <span className="text-[10px] text-mocha uppercase mt-0.5 tracking-wider">#{order._id?.slice(-8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-navy">
                        <User className="h-4 w-4 text-mocha/60" />
                        {order.customer?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-navy">
                        <CalendarDays className="h-4 w-4 text-mocha/60" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`rounded-full border-0 ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {order.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-navy">₹{order.amount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-mocha hover:text-navy hover:bg-gold/10"
                        onClick={() => navigate({ to: `/order/${order._id}` })}
                      >
                        View Details <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
