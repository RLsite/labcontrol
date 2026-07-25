import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const LAB_ROLES = ["lab_admin", "senior_user", "user"];

export default function InviteUserModal({ labId, onClose, onSaved }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSaving(true);
    setError("");
    try {
      // Create a UserProfile pre-assigned to this lab so the user is ready when they log in.
      await base44.entities.UserProfile.create({
        email, full_name: fullName, role, status: "approved", lab_id: labId, certifications: []
      });
      // Invite the user to the platform so they can register and log in.
      try { await base44.users.inviteUser(email, "user"); } catch { /* may already exist */ }
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
      <form onSubmit={submit} className="relative glass-strong rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-white">{t("labManage.inviteUser")}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.email")} *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} placeholder="name@example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.fullName")}</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t("labManage.role")}</label>
          <div className="grid grid-cols-3 gap-2">
            {LAB_ROLES.map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`rounded-xl px-2 py-2 text-xs font-medium border transition-colors ${role === r ? "aestro-gradient text-white border-transparent" : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"}`}>
                {t(`role.${r === "lab_admin" ? "labAdmin" : r === "senior_user" ? "seniorUser" : "user"}`)}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full aestro-gradient hover:opacity-90 text-white">{saving ? t("labManage.inviting") : t("labManage.inviteUser")}</Button>
      </form>
    </div>
  );
}