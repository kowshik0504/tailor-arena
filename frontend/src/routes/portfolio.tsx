import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings2, Plus, X, ImagePlus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const [services, setServices] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newService, setNewService] = useState({ name: "", description: "", featured: false, image: "", id: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/tailors/profile');
        if (res.data) {
          setServices(res.data.services || []);
          setDesigns(res.data.designs || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveToBackend = async (updatedServices: any[]) => {
    try {
      await api.put('/tailors/profile', { services: updatedServices });
    } catch (err) {
      console.error("Failed to save services to backend", err);
    }
  };

  const handleSave = () => {
    if (newService.name) {
      let updated;
      if (editingIndex !== null) {
        updated = [...services];
        updated[editingIndex] = newService;
      } else {
        updated = [...services, newService];
      }
      setServices(updated);
      saveToBackend(updated);
      setNewService({ id: "", name: "", description: "", featured: false, image: "" });
      setEditingIndex(null);
      setIsModalOpen(false);
    }
  };

  const handleEdit = (idx: number) => {
    setNewService(services[idx]);
    setEditingIndex(idx);
    setIsModalOpen(true);
  };

  const handleDelete = (idx: number) => {
    const updated = services.filter((_, i) => i !== idx);
    setServices(updated);
    saveToBackend(updated);
  };

  return (
    <PageShell title="Services & Portfolio" subtitle="Manage your specialized services and showcase your work.">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-display text-navy">Your Offerings</h2>
          <p className="text-sm text-mocha">Organize your portfolio into specific services to help customers discover your skills.</p>
        </div>
        <Button onClick={() => { setNewService({ id: "", name: "", description: "", featured: false, image: "" }); setEditingIndex(null); setIsModalOpen(true); }} className="bg-navy hover:bg-navy-deep text-cream gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="border-dashed border-2 border-gold/40 bg-gradient-cream rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-none">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Settings2 className="h-6 w-6 text-navy/60" />
          </div>
          <h3 className="font-display text-xl text-navy mb-2">No services defined</h3>
          <p className="text-mocha max-w-md mx-auto mb-6">
            Create your first service category (e.g. Bridal Wear, Alterations) to start uploading portfolio images.
          </p>
          <Button onClick={() => { setNewService({ id: "", name: "", description: "", featured: false, image: "" }); setEditingIndex(null); setIsModalOpen(true); }} variant="outline" className="border-gold text-navy hover:bg-gold/20 rounded-full px-6">
            Create First Service
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <Card key={idx} className="overflow-hidden border-gold/60 shadow-luxe bg-white rounded-2xl flex flex-col group relative">
              <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(idx)} className="h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-navy hover:bg-white transition">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(idx)} className="h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-rose-500 hover:bg-white transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {service.image ? (
                <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}>
                  <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-cream flex items-center justify-center text-navy/40">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-lg text-navy">{service.name}</h3>
                  {service.featured && (
                    <span className="text-[10px] uppercase tracking-wider bg-gold/20 text-navy-deep px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-mocha mb-6 flex-1">{service.description}</p>
                <Button onClick={() => handleEdit(idx)} variant="outline" className="w-full text-navy border-navy/20 hover:bg-navy/5 rounded-xl gap-2">
                  <Settings2 className="h-4 w-4" /> Manage Service
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gold/40 m-4">
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="font-display text-xl text-navy">{editingIndex !== null ? 'Manage Service' : 'Add Service from Catalog'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-navy/50 hover:text-navy transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 pt-0">
              {editingIndex === null ? (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">
                    Select a Design <span className="text-rose-500">*</span>
                  </label>
                  <Select value={newService.id} onValueChange={(val) => {
                    const d = designs.find(x => x.id === val);
                    if (d) {
                      setNewService({ ...newService, id: d.id, name: d.name, description: d.description, image: d.image, featured: false });
                    }
                  }}>
                    <SelectTrigger className="w-full p-3 h-12 rounded-xl border border-gold/60 bg-transparent text-navy">
                      <SelectValue placeholder="Choose from your design catalog..." />
                    </SelectTrigger>
                    <SelectContent>
                      {designs.length === 0 ? (
                        <div className="p-4 text-center text-sm text-mocha">Your catalog is empty. Upload designs first.</div>
                      ) : (
                        designs.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {newService.name && (
                <div className="flex items-center gap-4 p-3 border border-gold/20 bg-white/50 rounded-xl">
                  {newService.image ? (
                     <img src={newService.image} className="h-16 w-16 object-cover rounded-lg shadow-sm" />
                  ) : (
                     <div className="h-16 w-16 bg-gradient-cream rounded-lg flex items-center justify-center text-navy/40"><ImagePlus className="h-5 w-5"/></div>
                  )}
                  <div>
                     <p className="font-display text-navy">{newService.name}</p>
                     <p className="text-xs text-mocha line-clamp-1">{newService.description}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Featured Service</label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    checked={newService.featured}
                    onCheckedChange={(checked) => setNewService({ ...newService, featured: checked })}
                  />
                  <span className="text-sm text-mocha">Show prominently on your profile</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex flex-col gap-3">
              <Button onClick={handleSave} disabled={!newService.name} className="w-full bg-[#E5D5B5] hover:bg-[#D5C5A5] text-navy font-medium rounded-xl h-11">
                Save Service
              </Button>
              {editingIndex !== null && (
                <Button onClick={() => { handleDelete(editingIndex); setIsModalOpen(false); }} variant="outline" className="w-full border-rose-500 text-rose-500 hover:bg-rose-50 rounded-xl h-11">
                  Remove from Services
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
