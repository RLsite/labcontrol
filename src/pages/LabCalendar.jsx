import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ExternalLink, Inbox, ChevronDown } from "lucide-react";
import { formatDate, googleCalendarUrl, outlookCalendarUrl, dayKey, formatTime } from "@/lib/labUtils";

export default function LabCalendar() {
  const labUser = useLabUser();
  const { t, lang } = useLang();
  const isMainAdmin = labUser.isMainAdmin;

  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // For main admin: load all labs. For others: their lab.
  useEffect(() => {
    if (labUser.loading) return;
    if (isMainAdmin) {
      base44.entities.Lab.list().then((l) => {
        setLabs(l);
        if (l[0]) setSelectedLabId(l[0].id);
        else setLoading(false);
      });
    } else {
      const id = labUser.profile?.lab_id;
      if (id) setSelectedLabId(id);
      else setLoading(false);
    }
  }, [labUser.loading, isMainAdmin, labUser.profile?.lab_id]);

  const loadData = useCallback(async () => {
    if (!selectedLabId) return;
    setLoading(true);
    try {
      const res = await base44.entities.Reservation.filter({ lab_id: selectedLabId });
      setReservations(res.filter((r) => r.status !== "cancelled").sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    } finally {
      setLoading(false);
    }
  }, [selectedLabId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // group by day
  const grouped = (() => {
    const map = new Map();
    reservations.forEach((r) => {
      const k = dayKey(r.start_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return [...map.entries()];
  })();

  const selectedLab = labs.find((l) => l.id === selectedLabId) || labUser.lab;

  return (
    <Layout user={labUser.user} role={labUser.role} lab={selectedLab}>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl aestro-gradient flex items-center justify-center shadow-lg shadow-primary/30">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{t("lab.labCalendar")}</h1>
            <p className="text-sm text-slate-400">{selectedLab?.name || t("lab.labCalendarSub")}</p>
          </div>
        </div>

        {isMainAdmin && labs.length > 0 && (
          <div className="relative">
            <select
              value={selectedLabId || ""}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="appearance-none rounded-xl bg-white/5 border border-white/10 pl-4 pr-9 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {labs.map((l) => <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-3xl glass animate-pulse" />)}</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-3xl glass border-dashed border-white/15 py-16 text-center">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{t("lab.labCalendarSub")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-heading font-bold text-slate-200">{formatDate(items[0].start_time, lang)}</h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const ev = {
                    title: `Reservation: ${r.device_name}`,
                    startISO: r.start_time, endISO: r.end_time,
                    details: r.purpose ? `Purpose: ${r.purpose}` : "", location: ""
                  };
                  const gcal = googleCalendarUrl(ev);
                  const outlook = outlookCalendarUrl(ev);
                  return (
                    <div key={r.id} className="rounded-2xl glass p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">{r.device_name}</div>
                          <div className="text-xs text-slate-400">
                            {formatTime(r.start_time, lang)} — {formatTime(r.end_time, lang)}
                            {r.user_name ? ` · ${r.user_name}` : ""}
                            {r.purpose ? ` · ${r.purpose}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={gcal} target="_blank" rel="noreferrer" title="Google">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-sky-400 hover:bg-white/10"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                        <a href={outlook} target="_blank" rel="noreferrer" title="Outlook">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-400 hover:bg-white/10"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                      </div>
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