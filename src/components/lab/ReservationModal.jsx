import React, { useState } from "react";
import { X, CalendarPlus, CheckCircle2, ExternalLink, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { googleCalendarUrl, outlookCalendarUrl, formatDateTime } from "@/lib/labUtils";

export default function ReservationModal({ devices, user, labId, onClose, onSaved, initialStart = "" }) {
  const { t, lang } = useLang();
  const [deviceId, setDeviceId] = useState(devices[0]?.id || "");
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const selectedDevice = devices.find((d) => d.id === deviceId);

  const submit = async (e) => {
    e.preventDefault();
    if (!deviceId || !start || !end || !labId) return;
    setSaving(true);
    try {
      const startISO = new Date(start).toISOString();
      const endISO = new Date(end).toISOString();
      await base44.entities.Reservation.create({
        device_id: deviceId,
        device_name: selectedDevice?.name || "",
        user_email: user.email,
        user_name: user.full_name || user.email,
        start_time: startISO,
        end_time: endISO,
        purpose,
        status: "upcoming",
        lab_id: labId
      });
      setDone({ startISO, endISO });
      onSaved && onSaved();
    } finally {
      setSaving(false);
    }
  };

  const ev = done ? {
    title: `Reservation: ${selectedDevice?.name || ""}`,
    startISO: done.startISO,
    endISO: done.endISO,
    details: purpose ? `Purpose: ${purpose}` : "",
    location: selectedDevice?.location || ""
  } : null;
  const gcalLink = ev ? googleCalendarUrl(ev) : "";
  const outlookLink = ev ? outlookCalendarUrl(ev) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" dir={lang === "he" ? "rtl" : "ltr"}>
        <div className="sticky top-0 glass-strong flex items-center justify-between p-5 border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl aestro-gradient flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading font-bold text-white">{t("reserve.title")}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-heading font-bold text-white text-lg">{t("reserve.saved")}</h4>
            <p className="text-sm text-slate-400 mt-1">{selectedDevice?.name} · {formatDateTime(done.startISO, lang)}</p>
            <div className="mt-5 space-y-2">
              <a href={gcalLink} target="_blank" rel="noreferrer">
                <Button className="w-full gap-2 aestro-gradient hover:opacity-90 text-white">
                  <ExternalLink className="w-4 h-4" /> {t("reserve.syncGoogle")}
                </Button>
              </a>
              <a href={outlookLink} target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full gap-2 text-slate-200 border-white/10 hover:bg-white/5">
                  <ExternalLink className="w-4 h-4" /> {t("reserve.syncOutlook")}
                </Button>
              </a>
              <Link to="/calendar" onClick={onClose}>
                <Button variant="ghost" className="w-full gap-2 text-slate-300 hover:bg-white/5">
                  <CalendarDays className="w-4 h-4" /> {t("reserve.viewLocal")}
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{t("reserve.syncNote")}</p>
            <Button variant="ghost" className="mt-1 w-full text-slate-400" onClick={onClose}>{t("common.close")}</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <Field label={t("reserve.device")}>
              <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary">
                {devices.map((d) => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("reserve.start")}>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]" />
              </Field>
              <Field label={t("reserve.end")}>
                <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]" />
              </Field>
            </div>
            <Field label={t("reserve.purpose")}>
              <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} placeholder={t("reserve.purposePlaceholder")} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </Field>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving} className="flex-1 gap-2 aestro-gradient hover:opacity-90 text-white">
                <CalendarPlus className="w-4 h-4" /> {saving ? t("reserve.creating") : t("reserve.create")}
              </Button>
              <Button type="button" variant="ghost" className="text-slate-300" onClick={onClose}>{t("common.cancel")}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}