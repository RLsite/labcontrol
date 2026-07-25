import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ExternalLink, Inbox } from "lucide-react";
import { formatDate, googleCalendarUrl, dayKey, formatTime } from "@/lib/labUtils";

export default function Schedule() {
  const labUser = useLabUser();
  const { t, lang } = useLang();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!labUser.user) return;
    setLoading(true);
    try {
      const res = await base44.entities.Reservation.filter({ user_email: labUser.user.email });
      setReservations(res.filter((r) => r.status !== "cancelled"));
    } finally {
      setLoading(false);
    }
  }, [labUser.user]);

  useEffect(() => {
    if (labUser.user) loadData();
  }, [labUser.user, loadData]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const grouped = (() => {
    const map = new Map();
    [...reservations]
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .forEach((r) => {
        const k = dayKey(r.start_time);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(r);
      });
    return [...map.entries()];
  })();

  return (
    <Layout user={labUser.user} isAdmin={labUser.isAdmin} profile={labUser.profile}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("schedule.title")}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{t("schedule.subtitle")}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">{t("schedule.noTitle")}</h3>
          <p className="text-sm text-slate-500 mt-1">{t("schedule.noDesc")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-700">{formatDate(items[0].start_time, lang)}</h2>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const gcal = googleCalendarUrl({
                    title: `${t("reserve.title")}: ${r.device_name}`,
                    startISO: r.start_time,
                    endISO: r.end_time,
                    details: r.purpose ? `${t("reserve.purpose")}: ${r.purpose}` : ""
                  });
                  return (
                    <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{r.device_name}</div>
                          <div className="text-xs text-slate-500">
                            {formatTime(r.start_time, lang)} — {formatTime(r.end_time, lang)}
                            {r.purpose ? ` · ${r.purpose}` : ""}
                          </div>
                        </div>
                      </div>
                      <a href={gcal} target="_blank" rel="noreferrer">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                          <ExternalLink className="w-4 h-4" />
                          <span className="hidden sm:inline">{t("schedule.googleBtn")}</span>
                        </Button>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}