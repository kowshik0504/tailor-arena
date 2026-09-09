import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Building2, Check, Palette, Bell, Lock, CreditCard, User, X, Upload, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const sections = [
  { I: User, l: "Profile" },
  { I: Palette, l: "Appearance" },
  { I: Bell, l: "Notifications" },
  { I: CreditCard, l: "Subscription" },
];

const palettes = [
  { n: "Cream Classic", colors: ["oklch(0.97 0.02 80)", "oklch(0.92 0.04 25)", "oklch(0.78 0.10 80)", "oklch(0.42 0.05 45)"] },
  { n: "Rose Atelier", colors: ["oklch(0.97 0.02 80)", "oklch(0.85 0.06 35)", "oklch(0.68 0.12 40)", "oklch(0.55 0.05 50)"] },
  { n: "Champagne Noir", colors: ["oklch(0.97 0.02 80)", "oklch(0.86 0.09 85)", "oklch(0.55 0.05 50)", "oklch(0.28 0.03 50)"] },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updatePreferences } = useAuth();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [changeReqModal, setChangeReqModal] = useState(false);
  const [crForm, setCrForm] = useState({ shopName: "", address: "", reason: "", documentUrl: "" });
  const [crStatus, setCrStatus] = useState({ loading: false, msg: "" });
  const [tailorProfile, setTailorProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'tailor') {
      api.get('/api/tailors/profile').then(res => setTailorProfile(res.data.profile)).catch(console.error);
    }
  }, [user]);

  const submitChangeRequest = async () => {
    setCrStatus({ loading: true, msg: "" });
    try {
      const res = await api.post("/api/tailors/profile-change-request", crForm);
      setCrStatus({ loading: false, msg: res.data.message });
      setTimeout(() => setChangeReqModal(false), 2000);
    } catch (err: any) {
      setCrStatus({ loading: false, msg: err.response?.data?.message || "Error submitting request" });
    }
  };
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0); 
  const [requestType, setRequestType] = useState("");
  const [otherText, setOtherText] = useState("");

  const resetChat = () => {
    setChatStep(0);
    setRequestType("");
    setOtherText("");
  };

  const openSupport = () => {
    resetChat();
    setIsSupportOpen(true);
  };

  const scrollToSection = (sectionName: string) => {
    const el = document.getElementById(`section-${sectionName}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <PageShell title="Settings" subtitle="Tune Tailor Arena to your atelier's character.">
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <Card className="p-3 border-gold/60 shadow-luxe h-fit sticky top-20">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button 
                key={s.l} 
                onClick={() => scrollToSection(s.l)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition hover:bg-secondary/60 text-muted-foreground`}>
                <s.I className="h-4 w-4" />{s.l}
              </button>
            ))}
          </nav>
        </Card>

        <div className="space-y-6">
          <Card id="section-Profile" className="p-6 border-gold/60 shadow-luxe relative overflow-hidden scroll-m-24">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-gold opacity-10 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl">Atelier profile</h3>
              <Badge className="bg-gradient-gold text-navy-deep rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Verified</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Your public presence to customers.</p>
            <div className="grid md:grid-cols-[120px_1fr] gap-6 mt-6 items-start relative">
              <div className="h-28 w-28 rounded-3xl bg-gradient-luxe flex items-center justify-center font-display text-3xl text-primary-foreground shadow-luxe">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "AR"}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["Shop Name", user?.shopName || "Not provided"],
                  ["Owner", user?.name || "Not provided"],
                  ["Phone", user?.phone || "Not provided"],
                  ["Email", user?.email || "Not provided"],
                  ["GSTIN", user?.gstin || "Not provided"],
                  ["Established", user?.established || "Not provided"],
                  ["Address", user?.location ? [user.location.street, user.location.area, user.location.city, user.location.pincode].filter(Boolean).join(", ") : "Not provided"],
                  ["Location Pin", user?.location?.latitude ? `${user.location.latitude}� N, ${user.location.longitude}� E` : "Not provided"],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{l}</p>
                    <Input defaultValue={v as string} readOnly className="bg-secondary/40 rounded-xl border-gold/30 text-mocha/80 cursor-not-allowed focus-visible:ring-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-gold/10 border border-gold/30 flex flex-col gap-3 relative">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-navy">Profile Locked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your atelier details have been verified and cannot be changed directly.</p>
                </div>
                <Button disabled={Object.keys(tailorProfile?.pendingFields || {}).length > 0} onClick={() => setChangeReqModal(true)} variant="outline" className="rounded-full border-gold/70 text-xs h-8 shrink-0 hover:bg-gold/20">
                  {Object.keys(tailorProfile?.pendingFields || {}).length > 0 ? "Change Request Pending" : "Request Profile Change"}
                </Button>
              </div>
              {tailorProfile?.adminFeedback && (
                <div className="p-3 mt-2 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-xs font-bold text-rose-700">Admin Feedback (Action Required):</p>
                  <p className="text-sm text-rose-600 mt-1">{tailorProfile.adminFeedback}</p>
                </div>
              )}
            </div>
          </Card>

          <Card id="section-Appearance" className="p-6 border-gold/60 shadow-luxe scroll-m-24">
            <div className="flex items-center gap-2 mb-1"><Palette className="h-4 w-4 text-mocha" /><h3 className="font-display text-xl">Appearance</h3></div>
            <p className="text-xs text-muted-foreground mb-5">Choose a palette for your dashboard.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {palettes.map((p) => {
                const isActive = theme === p.n;
                return (
                  <button 
                    key={p.n} 
                    onClick={() => setTheme(p.n as any)}
                    className={`p-4 rounded-2xl border-2 transition text-left ${isActive ? "border-foreground shadow-luxe" : "border-gold/60 hover:border-border"}`}>
                    <div className="flex gap-1.5">
                      {p.colors.map((c, j) => <div key={j} className="h-10 flex-1 rounded-lg" style={{ background: c }} />)}
                    </div>
                    <p className="font-display text-base mt-3">{p.n}</p>
                    {isActive && <Badge className="rounded-full mt-2 bg-foreground text-background text-[10px]">Active</Badge>}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card id="section-Notifications" className="p-6 border-gold/60 shadow-luxe scroll-m-24">
            <h3 className="font-display text-xl">Preferences</h3>
            <div className="mt-5 divide-y divide-border/40">
              {[
                ["emailNotifications", "Email notifications", "Daily summaries and important alerts."],
                ["whatsappUpdates", "WhatsApp customer updates", "Auto-send order milestones to customers."],
                ["smsReminders", "SMS payment reminders", "Send gentle nudges 3 days after due date."],
                ["twoFactorAuth", "Two-factor authentication", "Protect your atelier with an extra layer."],
              ].map(([key, l, d]) => {
                const isEnabled = user?.preferences ? user.preferences[key as keyof typeof user.preferences] !== false : true;
                return (
                  <div key={key as string} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium">{l}</p>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                    <Switch 
                      checked={isEnabled} 
                      onCheckedChange={(checked) => {
                        updatePreferences({ [key]: checked });
                      }} 
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card id="section-Subscription" className="p-6 border-gold/60 shadow-luxe bg-gradient-cream scroll-m-24">
            <Badge className="rounded-full bg-foreground text-background text-[10px] uppercase tracking-wider">Freemium</Badge>
            <h3 className="font-display text-2xl mt-3">You're on the Starter plan</h3>
            <p className="text-sm text-muted-foreground mt-1">Free forever · ₹0/mo</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              {["Unlimited orders", "Accept all order types", "Basic CRM"].map((f) => (
                <div key={f} className="bg-background/70 rounded-xl p-3 text-sm font-medium text-navy">✓ {f}</div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="rounded-full border-gold/70 text-navy" onClick={() => window.location.href='/billing'}>View Invoices</Button>
            </div>
          </Card>
        </div>
      </div>

      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gold/40 flex flex-col h-[500px]">
            <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-gradient-cream">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-luxe flex items-center justify-center shadow-sm">
                  <span className="font-display text-primary-foreground text-xs">TA</span>
                </div>
                <div>
                  <h3 className="font-display text-base text-navy">Support Assistant</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Online</p>
                </div>
              </div>
              <button onClick={() => setIsSupportOpen(false)} className="text-navy/50 hover:text-navy transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-background/30 flex flex-col justify-end">
              {chatStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none w-11/12 text-sm text-mocha shadow-sm border border-gold/20">
                    Hello! I am the Tailor Arena Support Assistant. What detail would you like to update?
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                     {["Shop Name", "Phone Number", "GSTIN", "Email", "Address", "Other"].map(opt => (
                       <Button key={opt} variant="outline" size="sm" className="rounded-full bg-white hover:bg-gold/10 border-gold/40 text-navy" onClick={() => { setRequestType(opt); setChatStep(1); }}>
                         {opt}
                       </Button>
                     ))}
                  </div>
                </div>
              )}

              {chatStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white p-4 rounded-2xl rounded-tr-none w-fit ml-auto text-sm text-background bg-foreground shadow-sm mb-6">
                    {requestType}
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none w-11/12 text-sm text-mocha shadow-sm border border-gold/20 space-y-3">
                    {requestType === "Address" && (
                      <p>To change your Address, please drop a pin at your current location inside the shop to validate, and upload a valid proof of address (like an electricity bill).</p>
                    )}
                    {requestType === "Other" && (
                      <p>Please describe what you want to change, and upload a valid proof document.</p>
                    )}
                    {requestType !== "Address" && requestType !== "Other" && (
                      <p>To change your {requestType}, please upload a valid business document or proof for verification.</p>
                    )}
                  </div>
                  
                  <div className="w-11/12 ml-auto space-y-3">
                    {requestType === "Address" && (
                      <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-gold/60 text-navy gap-2 bg-white hover:bg-gold/10">
                        <MapPin className="h-4 w-4 text-terracotta" /> Drop pin at current location
                      </Button>
                    )}
                    {requestType === "Other" && (
                      <Input 
                        placeholder="What do you want to change?" 
                        value={otherText} onChange={e => setOtherText(e.target.value)}
                        className="bg-white rounded-xl border-gold/40"
                      />
                    )}
                    
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gold/40 rounded-xl bg-white hover:bg-gold/10 transition cursor-pointer text-muted-foreground group relative shadow-sm">
                       <Upload className="h-5 w-5 mb-2 opacity-50 group-hover:opacity-100 transition" />
                       <span className="text-xs">Upload valid proof document</span>
                       <input type="file" className="hidden" onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                           setChatStep(2);
                         }
                       }} />
                    </label>
                  </div>
                </div>
              )}

              {chatStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none w-11/12 text-sm text-mocha shadow-sm border border-gold/20">
                    Thank you! Your request and proof have been submitted to our Admin team. Once approved, your profile will be updated and you will receive an email confirmation.
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsSupportOpen(false)} className="rounded-full bg-foreground text-background">Close Chat</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Subscription Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gold/40 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gold/20 bg-gradient-cream">
              <div>
                <h3 className="font-display text-2xl text-navy">Manage Subscription</h3>
                <p className="text-sm text-muted-foreground mt-1">Upgrade or change your Tailor Arena plan.</p>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-navy/50 hover:text-navy transition rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/30">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Free Plan */}
                <Card className="p-6 border-gold shadow-luxe relative flex flex-col bg-gradient-cream transform md:-translate-y-2">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Current Plan
                  </div>
                  <h4 className="font-display text-xl text-navy">Starter</h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Freemium</p>
                  <p className="text-3xl font-display mt-4">₹0<span className="text-sm text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-mocha mt-4 min-h-[40px]">Perfect for individuals starting out.</p>
                  
                  <div className="space-y-3 mt-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-navy font-medium"><Check className="h-4 w-4 text-emerald-600" /> Unlimited orders</div>
                    <div className="flex items-center gap-2 text-sm text-navy font-medium"><Check className="h-4 w-4 text-emerald-600" /> Accept all order types (Normal, High, VIP)</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Standard Customer Profiles</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Basic CRM</div>
                  </div>
                  <Button className="w-full mt-8 rounded-full bg-navy text-white cursor-default opacity-90 hover:bg-navy">Active Plan</Button>
                </Card>

                {/* Pro Plan */}
                <Card className="p-6 border-gold/40 shadow-sm relative flex flex-col bg-white">
                  <h4 className="font-display text-xl text-navy">Atelier Pro</h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Most popular</p>
                  <p className="text-3xl font-display mt-4">₹2,499<span className="text-sm text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-mocha mt-4 min-h-[40px]">Everything you need to grow your boutique.</p>
                  
                  <div className="space-y-3 mt-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> AI fittings (beta)</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Multi-branch support</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Advanced analytics</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Priority Support</div>
                  </div>
                  <Button className="w-full mt-8 rounded-full bg-foreground text-background hover:bg-foreground/90">Upgrade</Button>
                </Card>

                {/* Elite Plan */}
                <Card className="p-6 border-gold/40 shadow-sm relative flex flex-col bg-white">
                  <h4 className="font-display text-xl text-navy">Enterprise</h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Custom operations</p>
                  <p className="text-3xl font-display mt-4">₹7,999<span className="text-sm text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-mocha mt-4 min-h-[40px]">For large retail chains and high-volume tailors.</p>
                  
                  <div className="space-y-3 mt-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Custom Customer Memberships</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> White-labeled VIP Booking App</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> API access & Custom Integrations</div>
                    <div className="flex items-center gap-2 text-sm text-navy"><Check className="h-4 w-4 text-emerald-600" /> Dedicated account manager</div>
                  </div>
                  <Button className="w-full mt-8 rounded-full bg-foreground text-background hover:bg-foreground/90">Upgrade</Button>
                </Card>

              </div>
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Need a custom plan? <a href="#" className="text-navy font-medium underline">Contact Sales</a>
              </div>
            </div>
          </div>
        </div>
      )}
          <Dialog open={changeReqModal} onOpenChange={setChangeReqModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Profile Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Shop Name (optional)</label>
              <Input placeholder="Enter new shop name" value={crForm.shopName} onChange={e => setCrForm({...crForm, shopName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New City/Address (optional)</label>
              <Input placeholder="Enter new city" value={crForm.address} onChange={e => setCrForm({...crForm, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for change</label>
              <Input placeholder="Why are you making this change?" value={crForm.reason} onChange={e => setCrForm({...crForm, reason: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proof Document URL (optional)</label>
              <Input placeholder="URL to new GST or shop photo" value={crForm.documentUrl} onChange={e => setCrForm({...crForm, documentUrl: e.target.value})} />
            </div>
            {crStatus.msg && (
              <p className="text-sm text-center font-medium mt-2 text-rose-600">{crStatus.msg}</p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button disabled={crStatus.loading} onClick={submitChangeRequest} className="w-full bg-gradient-navy text-cream">
              {crStatus.loading ? "Submitting..." : "Submit to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}












