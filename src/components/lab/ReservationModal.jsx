import React, { useState } from "react";
import { X, CalendarPlus, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { googleCalendarUrl, formatDateTime } from "@/lib/labUtils";

export default function ReservationModal({ devices, user, onClose, onSaved }) {
  const [deviceId, setDeviceId] = useState(devices[0]?.id || "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const selectedDevice = devices.find((d) => d.id === deviceId);

  const submit = async (e) => {
    e.preventDefault();
    if (!deviceId || !start || !end) return;
    setSaving(true);
    try {
      const startISO = new Date(start).toISOString();
      const endISO = new Date(end).toISOString();
      const created = await base44.entities.Reservation.create({
        device_id: deviceId,
        device_name: selectedDevice?.name || "",
        user_email: user.email,
        user_name: user.full_name || user.email,
        start_time: startISO,
        end_time: endISO,
        purpose,
        status: "upcoming"
      });
      setDone({ reservation: created, startISO, endISO });
      onSaved && onSaved();
    } finally {
      setSaving(false);
    }
  };

  const gcalLink = done
    ? googleCalendarUrl({
        title: `הזמנה: ${selectedDevice?.name || "מכשיר מעבדה"}`,
        startISO: done.startISO,
        endISO: done.endISO,
        details: purpose ? `מטרה: ${purpose}\nמשתמש: ${user.full_name || user.email}` : `משתמש: ${user.full_name || user.email}`,
        location: selectedDevice?.location || ""
      })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900">הזמנת מכשיר</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">ההזמנה נשמרה</h4>
            <p className="text-sm text-slate-500 mt-1">
              {selectedDevice?.name} · {formatDateTime(done.startISO)}
            </p>
            <a href={gcalLink} target="_blank" rel="noreferrer">
              <Button className="mt-5 w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <ExternalLink className="w-4 h-4" />
                סנכרן ל-Google Calendar
              </Button>
            </a>
            <p className="text-[11px] text-slate-400 mt-2">
              הקישור יפתח את היומן עם פרטי ההזמנה — ניתן לשמור כאירוע ביומן האישי.
            </p>
            <Button variant="ghost" className="mt-3 w-full" onClick={onClose}>סגור</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <Field label="מכשיר">
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="התחלה">
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
              <Field label="סיום">
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
            </div>
            <Field label="מטרת השימוש (לא חובה)">
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                placeholder="תיאור קצר של הניסוי..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <CalendarPlus className="w-4 h-4" />
                {saving ? "שומר..." : "צור הזמנה"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>ביטול</Button>
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
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}