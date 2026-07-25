import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { Plus, Layers, Cpu, Users, ChevronLeft, X, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LabsOverview({ labUser }) {
  const { t, lang } = useLang();
  const [labs, setLabs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [l, d, p] = await Promise.all([
        base44.entities.Lab.list(),
        base44.entities.Device.list(),
        base44.entities.UserProfile.list()
      ]);
      setLabs(l);
      setDevices(d);
      setProfiles(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = (labId) => ({
    devices: devices.filter((d) => d.lab_id === labId).length,
    members: profiles.filter((p) => p.lab_id === labId).length,
    active: devices.filter((d) => d.lab_id === labId && d.status === "in_use").length
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl aestro-gradient flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">{t("lab.overview")}</h1>
            <p className="text-sm text-slate-400">{t("lab.overviewSub")}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 aestro-gradient hover:opacity-90 text-white shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("lab.createLab")}</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-44 rounded-3xl glass animate-pulse" />)}
        </div>
      ) : labs.length === 0 ? (
        <div className="rounded-3xl glass border-dashed border-white/15 py-16 text-center">
          <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-white">{t("lab.noLabs")}</h3>
          <p className="text-sm text-slate-400 mt-1">{t("lab.noLabsDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => {
            const s = stats(lab.id);
            return (
              <Link key={lab.id} to={`/calendar?lab=${lab.id}`} className="group rounded-3xl glass hover:bg-white/[0.07] hover:border-white/20 transition-all p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl aestro-gradient flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <ChevronLeft className={`w-5 h-5 text-slate-500 group-hover:text-primary transition-colors ${lang === "he" ? "" : "rotate-180"}`} />
                </div>
                <h3 className="font-heading font-bold text-white mt-3">{lab.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">{lab.description || lab.location || "—"}</p>
                <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><Cpu className="w-3 h-3" /> {s.devices} {t("lab.devices")}</span>
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {s.members}</span>
                  {s.active > 0 && <span className="inline-flex items-center gap-1 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{s.active}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && <CreateLabModal onClose={() => setShowCreate(false)} onCreated={loadData} />}
    </div>
  );
}

function CreateLabModal({ onClose, onCreated }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await base44.entities.Lab.create({ name, description, location, calendar_color: "violet" });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative glass-strong rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-white">{t("lab.createLab")}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("lab.labName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("lab.description")}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("lab.location")}</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <Button type="submit" disabled={saving} className="w-full aestro-gradient hover:opacity-90 text-white">{saving ? t("common.loading") : t("lab.create")}</Button>
      </form>
    </div>
  );
}