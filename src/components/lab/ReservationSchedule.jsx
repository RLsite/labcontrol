import React, { useMemo } from "react";
import { CalendarDays, Clock, Trash2, ExternalLink, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { formatDate, googleCalendarUrl, dayKey, formatTime } from "@/lib/labUtils";

export default function ReservationSchedule({ reservations, onChanged }) {
  const { t, lang } = useLang();

  const grouped = useMemo(() => {
    const map = new Map();
    [...reservations].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).forEach((r) => {
      const k = dayKey(r.start_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return [...map.entries()];
  }, [reservations]);

  const handleDelete = async (r) => {
    await base44.entities.Reservation.update(r.id, { status: "cancelled" });
    onChanged && onChanged();
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-heading font-bold text-white">{t("home.myReservations")}</h2>
      </div>
      {grouped.length === 0 ? (
        <div className="rounded-3xl glass border-dashed border-white/15 py-12 text-center">
          <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{t("home.noReservations")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-white/10" />
                {formatDate(items[0].start_time, lang)}
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-2">
                {items.map((r) => (
                  <ReservationRow key={r.id} r={r} lang={lang} onDelete={() => handleDelete(r)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReservationRow({ r, lang, onDelete }) {
  const { t } = useLang();
  const cancelled = r.status === "cancelled";
  const gcal = googleCalendarUrl({
    title: `Reservation: ${r.device_name}`,
    startISO: r.start_time, endISO: r.end_time,
    details: r.purpose ? `Purpose: ${r.purpose}` : ""
  });
  return (
    <div className={`rounded-2xl glass p-3 flex items-center justify-between gap-3 ${cancelled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white text-sm truncate">{r.device_name}</div>
          <div className="text-[11px] text-slate-400">
            {formatTime(r.start_time, lang)} — {formatTime(r.end_time, lang)}
            {r.purpose ? ` · ${r.purpose}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {cancelled ? (
          <span className="text-[11px] text-rose-400 px-2">{t("status.blocked")}</span>
        ) : (
          <>
            <a href={gcal} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-white/10">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}