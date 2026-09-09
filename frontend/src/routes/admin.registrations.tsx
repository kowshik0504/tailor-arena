import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Check, X, Clock, Mail, Phone, FileText, Camera, ShieldAlert, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/registrations")({ component: AdminRegistrations });

type Reg = {
  id: string;
  name: string;
  kind: "Tailor" | "Customer";
  email: string;
  phone: string;
  city: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected" | "Changes Requested";
  documents?: any;
};

const statusTint: Record<string, string> = {
  Pending: "bg-gold/20 text-navy-deep",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-700",
  "Changes Requested": "bg-blue-100 text-blue-700",
};

import api from "@/lib/api";
import { useEffect } from "react";

function AdminRegistrations() {
  const [filter, setFilter] = useState<"Pending" | "Approved" | "Rejected" | "Changes Requested" | "All">("Pending");
  const [kind, setKind] = useState<"All" | "Tailor" | "Customer">("All");
  
  const [queue, setQueue] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTailor, setSelectedTailor] = useState<Reg | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/admin/pending-tailors');
      const tailors = res.data.map((t: any) => ({
        id: t._id,
        name: t.user?.name || "Unknown",
        kind: "Tailor",
        email: t.user?.email || "",
        phone: t.phone || "",
        city: t.address?.city || "Unknown",
        date: new Date(t.createdAt).toLocaleDateString(),
        status: t.status === "pending" ? "Pending" : t.status === "approved" ? "Approved" : t.status === "changes_requested" ? "Changes Requested" : "Rejected",
        documents: {
          aadhar: t.aadharDocUrl || "Missing",
          shop: t.shopPhotoUrl || "Missing",
          machine: t.machinePhotoUrl || "Missing"
        }
      }));
      setQueue(tailors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected' | 'changes_requested', reason?: string) => {
    try {
      await api.put(`/admin/verify-tailor/` + id, { status, reason });
      fetchRegistrations();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to verify tailor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this tailor, their account, and all their uploaded documents?")) return;
    try {
      await api.delete(`/admin/tailors/` + id);
      fetchRegistrations();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to delete tailor');
    }
  };

  const closeModal = () => {
    setSelectedTailor(null);
    setFeedback("");
    setShowFeedbackInput(false);
    setShowConfirm(false);
  };

  const filtered = queue.filter(
    (q) => (filter === "All" || q.status === filter) && (kind === "All" || q.kind === kind),
  );

  return (
    <PageShell title="Registrations" subtitle="New tailor & customer signups awaiting review.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="New tailors (week)" value="46" tint="bg-gradient-navy text-cream" />
        <Stat label="New customers (week)" value="312" tint="bg-gradient-gold text-navy-deep" />
        <Stat label="Approved" value="284" tint="bg-gradient-cream text-navy" />
        <Stat label="Rejected" value="8" tint="bg-rose-100 text-rose-800" />
      </div>

      <Card className="p-6 border-gold/60 shadow-luxe">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-navy" />
            <h3 className="font-display text-xl text-navy">Registration queue</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tabs value={kind} setValue={setKind} options={["All", "Tailor", "Customer"]} />
            <Tabs value={filter} setValue={setFilter} options={["Pending", "Approved", "Rejected", "Changes Requested", "All"]} />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id} onClick={() => q.status === "Pending" && setSelectedTailor(q)} className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-gold/60 bg-gradient-soft transition ${q.status === "Pending" ? "hover:border-gold/80 hover:shadow-md cursor-pointer" : ""}`}>
              <div className="flex items-center gap-3 lg:w-64">
                <div className="h-11 w-11 rounded-xl bg-gradient-navy text-cream flex items-center justify-center font-display">
                  {q.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{q.name}</p>
                  <p className="text-[11px] text-muted-foreground">{q.id} · {q.city}</p>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-3 text-xs">
                <Badge className={`rounded-full ${q.kind === "Tailor" ? "bg-champagne text-navy" : "bg-rose/30 text-terracotta"}`}>{q.kind}</Badge>
                <span className="text-mocha inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {q.email}</span>
                <span className="text-mocha inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {q.phone}</span>
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {q.date}
                </span>
                <Badge className={`rounded-full ${statusTint[q.status]}`}>{q.status}</Badge>
              </div>
              {q.status === "Pending" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy font-medium underline underline-offset-2">Review Docs</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* VERIFICATION MODAL */}
      {selectedTailor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full max-w-3xl bg-cream border border-gold/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-white/50">
              <div>
                <h2 className="font-display text-2xl text-navy">Document Verification</h2>
                <p className="text-sm text-mocha mt-1">Reviewing {selectedTailor.name}'s submitted proofs</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full hover:bg-rose-50 text-mocha hover:text-rose-600">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Document Mockups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gold/20 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Govt ID (Aadhar)</p>
                    <p className="text-[10px] text-mocha">Verified via DigiLocker API</p>
                  </div>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 mt-2">Valid</Badge>
                </div>
                
                <div className="p-4 rounded-xl border border-gold/20 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-deep">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Shop Photo</p>
                    <p className="text-[10px] text-mocha">Exterior view with signage</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full mt-2">View Image</Button>
                </div>

                <div className="p-4 rounded-xl border border-gold/20 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-deep">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Machine Photo</p>
                    <p className="text-[10px] text-mocha">Interior workspace</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full mt-2">View Image</Button>
                </div>
              </div>

              {/* Action Area */}
              {showFeedbackInput ? (
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 mb-2 text-rose-800">
                    <MessageSquare className="h-4 w-4" />
                    <p className="text-sm font-semibold">Request Changes</p>
                  </div>
                  <textarea 
                    className="w-full bg-white border border-rose-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent min-h-[100px]"
                    placeholder="E.g., Your Aadhar card photo is too blurry, please re-upload a clear copy..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => setShowFeedbackInput(false)} className="text-mocha hover:text-navy hover:bg-white">Cancel</Button>
                    <Button size="sm" onClick={() => handleVerify(selectedTailor.id, 'changes_requested', feedback)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm" disabled={!feedback.trim()}>
                      Send to Tailor
                    </Button>
                  </div>
                </div>
              ) : showConfirm ? (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </div>
                  <p className="font-semibold text-emerald-900">Approve Tailor Registration?</p>
                  <p className="text-xs text-emerald-700 mt-1 max-w-sm mb-4">Are you sure these documents are original and valid? This will activate their account and allow them to take orders.</p>
                  <div className="flex justify-center gap-3 w-full">
                    <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)} className="text-emerald-800 hover:bg-emerald-100 flex-1 max-w-[120px]">Cancel</Button>
                    <Button size="sm" onClick={() => handleVerify(selectedTailor.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex-1 max-w-[120px]">
                      Confirm
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-gold/20">
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button variant="outline" onClick={() => handleVerify(selectedTailor.id, 'rejected')} className="border-rose-200 text-rose-700 hover:bg-rose-50 flex-1 max-w-[200px]">
                      <X className="h-4 w-4 mr-2" /> Reject Application
                    </Button>
                    <Button variant="outline" onClick={() => setShowFeedbackInput(true)} className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-1 max-w-[200px]">
                      <MessageSquare className="h-4 w-4 mr-2" /> Request Changes
                    </Button>
                    <Button onClick={() => setShowConfirm(true)} className="bg-gradient-navy text-cream flex-1 max-w-[200px] shadow-md hover:shadow-lg">
                      <Check className="h-4 w-4 mr-2" /> Approve Tailor
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => handleDelete(selectedTailor.id)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 self-center text-xs mt-2 w-fit">
                    <ShieldAlert className="h-3 w-3 mr-1" /> Delete Account & Uploads
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </PageShell>
  );
}

function Tabs<T extends string>({ value, setValue, options }: { value: T; setValue: (v: T) => void; options: T[] }) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-cream border border-gold/60">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setValue(o)}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
            value === o ? "bg-gradient-navy text-cream" : "text-mocha hover:text-navy"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <Card className={`p-5 border-0 shadow-luxe ${tint}`}>
      <p className="text-[10px] uppercase tracking-[0.22em] opacity-75">{label}</p>
      <p className="font-display text-3xl mt-2">{value}</p>
    </Card>
  );
}
