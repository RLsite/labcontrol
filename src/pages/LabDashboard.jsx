import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import DeviceCard from "@/components/lab/DeviceCard";
import ActiveSessionBanner from "@/components/lab/ActiveSessionBanner";
import ReservationModal from "@/components/lab/ReservationModal";
import ReservationSchedule from "@/components/lab/ReservationSchedule";
import { CalendarPlus, RefreshCw, AlertCircle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LabDashboard({ labUser }) {
  const { t } = useLang();
  const { user, profile, role } = labUser;
  const labId = profile?.lab_id;

  const [devices, setDevices] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReserve, setShowReserve] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadData = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const [devs, sessions, res, labObj] = await Promise.all([
        base44.entities.Device.filter({ lab_id: labId }),
        base44.entities.LabSession.filter({ user_email: user.email, status: "active" }),
        base44.entities.Reservation.filter({ user_email: user.email }),
        base44.entities.Lab.get(labId).catch(() => null)
      ]);
      setDevices(devs);
      setActiveSession(sessions[0] || null);
      setReservations(res.filter((r) => r.status !== "cancelled"));
      setLab(labObj);
    } finally {
      setLoading(false);
    }
  }, [labId, user.email]);

  useEffect(() => { if (labId) loadData(); }, [labId, loadData]);

  if (!labId) {
    return (
      <div className="rounded-3xl glass p-10 text-center">
        <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">{t("lab.noLab")}</p>
      </div>
    );
  }

  // Roles with broad access: main_admin, lab_admin, senior_user bypass certification.
  const bypassTraining = role === "main_admin" || role === "lab_admin" || role === "senior_user";
  const certifiedIds = new Set(profile?.certifications || []);
  const canActivate = (device) => {
    if (bypassTraining) return { ok: true };
    if (device.requires_training && !certifiedIds.has(device.id)) {
      return { ok: false, reason: `${t("device.trainingPrefix")} ${device.training_name || device.name}` };
    }
    return { ok: true };
  };

  const handleActivate = async (device) => {
    const check = canActivate(device);
    if (!check.ok) { showToast(check.reason); return; }
    if (activeSession) { showToast(t("toast.activeExists")); return; }
    await base44.entities.LabSession.create({
      device_id: device.id, device_name: device.name,
      user_email: user.email, user_name: user.full_name || user.email,
      start_time: new Date().toISOString(), status: "active", lab_id: labId
    });
    await base44.entities.Device.update(device.id, { status: "in_use" });
    loadData();
  };

  const handleCheckout = async () => {
    if (!activeSession) return;
    await base44.entities.LabSession.update(activeSession.id, { end_time: new Date().toISOString(), status: "ended" });
    await base44.entities.Device.update(activeSession.device_id, { status: "available" });
    setActiveSession(null);
    loadData();
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-destructive text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">
            {lab?.name || t("home.yourLab")}
          </h1>
          <p className="text-sm text-slate-400">{t("device.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={loadData} className="text-slate-300 hover:bg-white/10"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowReserve(true)} className="gap-2 aestro-gradient hover:opacity-90 text-white">
            <CalendarPlus className="w-4 h-4" /><span className="hidden sm:inline">{t("home.reserveBtn")}</span>
          </Button>
        </div>
      </div>

      {activeSession && <div className="mb-6"><ActiveSessionBanner session={activeSession} onCheckout={handleCheckout} /></div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-3xl glass animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} canActivate={canActivate} hasActiveSession={!!activeSession} onActivate={handleActivate} />
          ))}
        </div>
      )}

      <ReservationSchedule reservations={reservations} onChanged={loadData} />

      {showReserve && (
        <ReservationModal
          devices={devices.filter((d) => d.status !== "maintenance")}
          user={user}
          labId={labId}
          onClose={() => setShowReserve(false)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}