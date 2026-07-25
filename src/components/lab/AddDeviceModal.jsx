import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function AddDeviceModal({ labId, onClose, onSaved }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "", description: "", category: "", location: "", requires_training: false, training_name: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    setError("");
    try {
      await base44.entities.Device.create({
        ...form,
        status: "available",
        lab_id: labId
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative glass-strong rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-white">{t("labManage.addDevice")}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.deviceName")} *</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={field} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.category")}</label>
          <input value={form.category} onChange={(e) => set("category", e.target.value)} className={field} placeholder={t("labManage.categoryPh")} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.location")}</label>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.description")}</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={`${field} resize-none`} />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.requires_training} onChange={(e) => set("requires_training", e.target.checked)} className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm text-slate-200">{t("labManage.requiresTraining")}</span>
        </label>
        {form.requires_training && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.trainingName")}</label>
            <input value={form.training_name} onChange={(e) => set("training_name", e.target.value)} className={field} />
          </div>
        )}
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full aestro-gradient hover:opacity-90 text-white">{saving ? t("common.loading") : t("common.create")}</Button>
      </form>
    </div>
  );
}