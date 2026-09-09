import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/tailor/verification")({
  component: TailorVerificationResubmit,
});

function TailorVerificationResubmit() {
  const [aadharDoc, setAadharDoc] = useState<File | null>(null);
  const [machinePhoto, setMachinePhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadharDoc && !machinePhoto) {
      alert("Please select at least one document to re-submit.");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (aadharDoc) formData.append("aadharDoc", aadharDoc);
      if (machinePhoto) formData.append("machinePhoto", machinePhoto);

      await api.post("/tailor/resubmit-verification", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      alert("Documents re-submitted successfully!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      alert("Failed to submit documents");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Resubmit Verification Documents" subtitle="Please upload the requested clear copies of your proofs.">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-8 border-gold/40 shadow-luxe bg-cream">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">Government ID (Aadhar)</label>
              <div className="border-2 border-dashed border-gold/40 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-gold/5 transition cursor-pointer">
                <FileText className="h-10 w-10 text-gold-deep mb-3 opacity-60" />
                <p className="text-sm text-mocha font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="aadhar-upload" 
                  accept=".pdf,image/*" 
                  onChange={(e) => setAadharDoc(e.target.files?.[0] || null)}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  className="mt-4 border-gold/60 text-navy"
                  onClick={() => document.getElementById('aadhar-upload')?.click()}
                >
                  {aadharDoc ? aadharDoc.name : "Select File"}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">Workspace / Machine Photo</label>
              <div className="border-2 border-dashed border-gold/40 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-gold/5 transition cursor-pointer">
                <UploadCloud className="h-10 w-10 text-gold-deep mb-3 opacity-60" />
                <p className="text-sm text-mocha font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="machine-upload" 
                  accept="image/*" 
                  onChange={(e) => setMachinePhoto(e.target.files?.[0] || null)}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  className="mt-4 border-gold/60 text-navy"
                  onClick={() => document.getElementById('machine-upload')?.click()}
                >
                  {machinePhoto ? machinePhoto.name : "Select Image"}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-navy text-cream h-12 text-base rounded-xl shadow-md hover:shadow-lg">
              {submitting ? "Uploading..." : "Submit for Verification"}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
