import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import ReportCharts from "@/components/lab/ReportCharts";
import { BarChart3, CalendarDays, Clock, Cpu, ShieldCheck, Users } from "lucide-react";

export default function Reports() {
  const labUser = useLabUser();
  const { t } = useLang();
  const canManage = labUser.isMainAdmin || labUser.role === "lab_admin";
  const [data, setData] = useState(null);

  useEffect(() => {
    if (labUser.loading || !canManage) return;
    const labId = labUser.isMainAdmin ? null : labUser.profile?.lab_id;
    (async () => {
      const [reservations, sessions, devices] = await Promise.all([
        labId ? base44.entities.Reservation.filter({ lab_id: labId }) : base44.entities.Reservation.list(),
        labId ? base44.entities.LabSession.filter({ lab_id: labId }) : base44.entities.LabSession.list(),
        labId ? base44.entities.Device.filter({ lab_id: labId }) : base44.entities.Device.list()
      ]);
      setData({ reservations: reservations.filter((r) => r.status !== "cancelled"), sessions, devices });
    })();
  }, [labUser.loading, canManage, labUser.isMainAdmin, labUser.profile?.lab_id]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-600 mb-3" />
          <h2 className="text-lg font-heading font-bold text-white">{t("manage.noAccess")}</h2>
          <p className="text-sm text-slate-400">{t("manage.noAccessDesc")}</p>
        </div>
      </Layout>
    );
  }

  const reservations = data?.reservations || [];
  const sessions = data?.sessions || [];
  const devices = data?.devices || [];

  const bookedHours = reservations.reduce((sum, r) => {
    if (!r.end_time) return sum;
    return sum + Math.max(0, (new Date(r.end_time) - new Date(r.start_time)) / 3600000);
  }, 0);

  const byDevice = Object.entries(
    reservations.reduce((acc, r) => { acc[r.device_name] = (acc[r.device_name] || 0) + 1; return acc; }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const topUsers = Object.entries(
    sessions.reduce((acc, s) => {
      const name = s.user_name || s.user_email;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const hasData = reservations.length > 0 || sessions.length > 0;

  return (
    <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl aestro-gradient flex items-center justify-center shadow-lg shadow-primary/30">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{t("reports.title")}</h1>
          <p className="text-sm text-slate-400">{t("reports.subtitle")}</p>
        </div>
      </div>

      {!data ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-32 rounded-3xl glass animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<CalendarDays className="w-4 h-4" />} label={t("reports.totalReservations")} value={reservations.length} tone="indigo" />
            <StatCard icon={<Clock className="w-4 h-4" />} label={t("reports.bookedHours")} value={bookedHours.toFixed(1)} tone="violet" />
            <StatCard icon={<Users className="w-4 h-4" />} label={t("reports.totalSessions")} value={sessions.length} tone="emerald" />
            <StatCard icon={<Cpu className="w-4 h-4" />} label={t("reports.devices")} value={devices.length} tone="amber" />
          </div>

          {hasData ? (
            <ReportCharts byDevice={byDevice} topUsers={topUsers} t={t} />
          ) : (
            <div className="rounded-3xl glass border-dashed border-white/15 py-14 text-center">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">{t("reports.noData")}</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function StatCard({ icon, label, value, tone }) {
  const tones = {
    indigo: "bg-primary/15 text-primary",
    violet: "bg-accent/15 text-accent",
    emerald: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400"
  };
  return (
    <div className="rounded-2xl glass p-4">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tones[tone]} mb-2`}>{icon}</div>
      <div className="text-2xl font-heading font-bold text-white">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}