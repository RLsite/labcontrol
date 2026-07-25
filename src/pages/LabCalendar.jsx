import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Inbox, ChevronDown, CalendarPlus } from "lucide-react";
import { formatDate, dayKey, formatTime } from "@/lib/labUtils";
import LocalCalendar from "@/components/lab/LocalCalendar";
import ReservationModal from "@/components/lab/ReservationModal";

export default function LabCalendar() {
  const labUser = useLabUser();
  const { t, lang } = useLang();
  const isMainAdmin = labUser.isMainAdmin;

  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [showReserve, setShowReserve] = useState(false);
  const [prefillStart, setPrefillStart] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("all");

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
      const [res, devs] = await Promise.all([
        base44.entities.Reservation.filter({ lab_id: selectedLabId }),
        base44.entities.Device.filter({ lab_id: selectedLabId })
      ]);
      setReservations(res.filter((r) => r.status !== "cancelled").sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
      setDevices(devs);
    } finally {
      setLoading(false);
    }
  }, [selectedLabId]);

  useEffect(() => { loadData(); setSelectedDeviceId("all"); }, [loadData]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const visibleReservations = selectedDeviceId === "all"
    ? reservations
    : reservations.filter((r) => r.device_id === selectedDeviceId);
  const modalDevices = selectedDeviceId === "all"
    ? devices
    : devices.filter((d) => d.id === selectedDeviceId);

  // group by day
  const grouped = (() => {
    const map = new Map();
    visibleReservations.forEach((r) => {
      const k = dayKey(r.start_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return [...map.entries()];
  })();

  const selectedLab = labs.find((l) => l.id === selectedLabId) || labUser.lab;

  const handleDayClick = (date) => {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setPrefillStart(`${yyyy}-${mm}-${dd}T09:00`);
    setShowReserve(true);
  };

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

        <Button onClick={() => { setPrefillStart(""); setShowReserve(true); }} disabled={devices.length === 0}
          className="gap-2 aestro-gradient hover:opacity-90 text-white">
          <CalendarPlus className="w-4 h-4" /><span className="hidden sm:inline">{t("reserve.newBtn")}</span>
        </Button>

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
      ) : (
        <div className="space-y-6">
          {devices.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <DeviceTab active={selectedDeviceId === "all"} onClick={() => setSelectedDeviceId("all")} label={t("lab.allDevices")} />
              {devices.map((d) => (
                <DeviceTab key={d.id} active={selectedDeviceId === d.id} onClick={() => setSelectedDeviceId(d.id)} label={d.name} />
              ))}
            </div>
          )}

          <LocalCalendar reservations={visibleReservations} lang={lang} onDayClick={handleDayClick} />

          {devices.length === 0 && (
            <div className="rounded-3xl glass border-dashed border-white/15 py-6 text-center">
              <p className="text-sm text-slate-400">{t("reserve.noDevices")}</p>
            </div>
          )}

          {grouped.length === 0 && devices.length > 0 && (
            <div className="rounded-3xl glass border-dashed border-white/15 py-10 text-center">
              <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">{t("lab.calendarEmpty")}</p>
            </div>
          )}

          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-heading font-bold text-slate-200">{formatDate(items[0].start_time, lang)}</h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-2">
                {items.map((r) => (
                  <div key={r.id} className="rounded-2xl glass p-4 flex items-center gap-3">
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showReserve && (
        <ReservationModal devices={modalDevices.length > 0 ? modalDevices : devices} user={labUser.user} labId={selectedLabId} initialStart={prefillStart}
          onClose={() => setShowReserve(false)} onSaved={loadData} />
      )}
    </Layout>
  );
}

function DeviceTab({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 h-8 px-3.5 rounded-full text-xs font-medium transition-colors border ${
        active
          ? "aestro-gradient text-white border-transparent shadow-md shadow-primary/20"
          : "text-slate-300 border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
      }`}>
      {label}
    </button>
  );
}