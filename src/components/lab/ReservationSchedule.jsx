import React, { useMemo } from "react";
import { CalendarDays, Clock, Trash2, ExternalLink, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { formatDate, formatDateTime, googleCalendarUrl, dayKey } from "@/lib/labUtils";

export default function ReservationSchedule({ reservations, user, onChanged }) {
  const grouped = useMemo(() => {
    const map = new Map();
    [...reservations]
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .forEach((r) => {
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
        <CalendarDays className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">לוח הזמנות שלי</h2>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">אין הזמנות עתידיות. הזמן מכשיר כדי להתחיל.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-slate-200" />
                {formatDate(items[0].start_time)}
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-2">
                {items.map((r) => (
                  <ReservationRow key={r.id} r={r} user={user} onDelete={() => handleDelete(r)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReservationRow({ r, user, onDelete }) {
  const cancelled = r.status === "cancelled";
  const gcal = googleCalendarUrl({
    title: `הזמנה: ${r.device_name}`,
    startISO: r.start_time,
    endISO: r.end_time,
    details: r.purpose ? `מטרה: ${r.purpose}` : "",
    location: ""
  });
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 ${cancelled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{r.device_name}</div>
          <div className="text-[11px] text-slate-500">
            {new Date(r.start_time).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
            {" — "}
            {new Date(r.end_time).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
            {r.purpose ? ` · ${r.purpose}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {r.status === "cancelled" ? (
          <span className="text-[11px] text-rose-600 px-2">בוטלה</span>
        ) : (
          <>
            <a href={gcal} target="_blank" rel="noreferrer" title="הוסף ל-Google Calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={onDelete} title="בטל הזמנה">
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}