import React, { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { formatTime } from "@/lib/labUtils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function LocalCalendar({ reservations, lang, onDayClick }) {
  const { t } = useLang();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const locale = lang === "he" ? "he-IL" : "en-US";

  const monthName = useMemo(
    () => new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, { month: "long", year: "numeric" }),
    [viewYear, viewMonth, locale]
  );

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });
  }, [locale]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const resByDay = useMemo(() => {
    const map = new Map();
    reservations.forEach((r) => {
      const d = new Date(r.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return map;
  }, [reservations]);

  const isToday = (d) =>
    d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

  return (
    <div className="rounded-3xl glass p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-heading font-bold text-white">{monthName}</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-slate-200 border-white/10 hover:bg-white/5" onClick={goToday}>{lang === "he" ? "היום" : "Today"}</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:bg-white/10" onClick={goPrev}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:bg-white/10" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-slate-400 py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="min-h-[72px] sm:min-h-[96px] rounded-xl bg-transparent" />;
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const items = resByDay.get(key) || [];
          const todayCls = isToday(d);
          return (
            <div key={i} onClick={() => onDayClick?.(d)} className={`min-h-[72px] sm:min-h-[96px] rounded-xl p-1.5 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-white/[0.06] ${todayCls ? "bg-primary/10 border border-primary/30" : "bg-white/[0.02] border border-white/5"}`}>
              <span className={`text-xs font-medium ${todayCls ? "text-primary" : "text-slate-400"}`}>{d.getDate()}</span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {items.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center gap-1 rounded-md bg-primary/15 text-primary px-1 py-0.5 text-[10px] truncate">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{formatTime(r.start_time, lang)} {r.device_name}</span>
                  </div>
                ))}
                {items.length > 3 && <span className="text-[10px] text-slate-500 px-1">+{items.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}