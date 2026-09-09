import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/change-requests")({ component: ChangeRequests });

function ChangeRequests() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/change-requests");
      setReqs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/change-requests/${id}/approve`);
      setSelectedReq(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/admin/change-requests/${id}/reject`, { reason: rejectReason });
      setRejectReason("");
      setSelectedReq(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to reject");
    }
  };

  const getChangesList = (r: any) => {
    let list = [];
    if (r.pendingFields?.shopName) list.push({ key: "Shop Name", from: r.shopName, to: r.pendingFields.shopName });
    if (r.pendingFields?.address) list.push({ key: "Address", from: r.address?.city, to: r.pendingFields.address.city });
    if (r.pendingFields?.documentUrl) list.push({ key: "Document", from: "Old Doc", to: "New Doc", img: r.pendingFields.documentUrl });
    return list;
  };

  return (
    <PageShell title="Change requests" subtitle="Profile and document update requests from tailors.">
      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-4 w-4 text-navy" />
          <h3 className="font-display text-xl text-navy">Pending changes</h3>
          <Badge className="rounded-full bg-gradient-gold text-navy-deep ml-2">{reqs.length}</Badge>
        </div>
        <div className="space-y-3">
          {reqs.length === 0 && <p className="text-mocha text-sm">No pending changes.</p>}
          {reqs.map((r) => {
            const changes = getChangesList(r);
            return (
              <div 
                key={r._id} 
                className="p-4 rounded-2xl border border-gold/60 bg-gradient-soft cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedReq(r)}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap pointer-events-none">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-mocha/70">{r._id.slice(-6)} · {new Date(r.updatedAt).toLocaleDateString()}</p>
                    <p className="font-display text-navy mt-1">{r.shopName || r.user?.name}</p>
                    <p className="text-sm text-mocha">Requested {changes.length} changes</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs pointer-events-none">
                  {changes.slice(0,1).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 w-full">
                      <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-gold/40">
                        <span className="text-[10px] uppercase tracking-wider text-mocha/60">From {c.key}</span>
                        <p className="text-navy font-medium">{c.from || "None"}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-mocha/50" />
                      <div className="px-3 py-1.5 rounded-lg bg-gradient-gold/20 border border-gold/40">
                        <span className="text-[10px] uppercase tracking-wider text-mocha/60">To</span>
                        <p className="text-navy font-medium">{c.to}</p>
                      </div>
                    </div>
                  ))}
                  {changes.length > 1 && <Badge variant="outline">+{changes.length - 1} more</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={!!selectedReq} onOpenChange={(o) => !o && setSelectedReq(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review Change Request</DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4">
              <p className="text-sm"><strong>Tailor:</strong> {selectedReq.shopName || selectedReq.user?.name}</p>
              
              {selectedReq.pendingFields?.reason && (
                <div className="p-3 bg-secondary/20 rounded-md">
                  <p className="text-xs font-bold text-navy">Reason for change provided by Tailor:</p>
                  <p className="text-sm text-mocha mt-1">{selectedReq.pendingFields.reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold">Requested Changes:</p>
                {getChangesList(selectedReq).map((c, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 border-b pb-2">
                    <div>
                      <p className="text-xs text-mocha">Old {c.key}</p>
                      <p className="text-sm">{c.from}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mocha">New {c.key}</p>
                      <p className="text-sm font-medium text-navy">{c.to}</p>
                      {c.img && <img src={c.img} alt="Proof" className="mt-2 h-32 rounded object-cover border" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-semibold text-rose-600">If Rejecting, provide a reason:</p>
                <Input 
                  placeholder="e.g., Upload a clearer photo of your GST certificate..." 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => handleReject(selectedReq._id)} className="border-rose-200 text-rose-700">
              Reject / Request Update
            </Button>
            <Button onClick={() => handleApprove(selectedReq._id)} className="bg-gradient-navy text-cream">
              Approve Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

