import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import Layout from "@/components/lab/Layout";
import DeviceCard from "@/components/lab/DeviceCard";
import ActiveSessionBanner from "@/components/lab/ActiveSessionBanner";
import ReservationModal from "@/components/lab/ReservationModal";
import ReservationSchedule from "@/components/lab/ReservationSchedule";
import PendingApproval from "@/components/lab/PendingApproval";
import { CalendarPlus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const labUser = useLabUser();
  const [devices, setDevices] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReserve, setShowReserve] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (!labUser.user) return;
    setLoading(true);
    try {
      const [devs, sessions, res] = await Promise.all([
        base44.entities.Device.list(),
        base44.entities.LabSession.filter({ user_email: labUser.user.email, status: "active" }),
        base44.entities.Reservation.filter({ user_email: labUser.user.email })
      ]);
      setDevices(devs);
      setActiveSession(sessions[0] || null);
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

  const { user, isAdmin, profile } = labUser;
  const approved = isAdmin || (profile && profile.status === "approved");
  const blocked = profile && profile.status === "blocked";
  const pending = !isAdmin && (!profile || profile.status === "pending");

  const certifiedIds = new Set(profile?.certifications || []);
  const canActivate = (device) => {
    if (isAdmin) return { ok: true };
    if (device.requires_training && !certifiedIds.has(device.id)) {
      return { ok: false, reason: `נדרשת הדרכה: ${device.training_name || device.name}` };
    }
    return { ok: true };
  };

  const handleActivate = async (device) => {
    const check = canActivate(device);
    if (!check.ok) { showToast(check.reason); return; }
    if (activeSession) { showToast("יש כבר סשן פעיל. סיים אותו לפני הפעלת מכשיר נוסף."); return; }
    await base44.entities.LabSession.create({
      device_id: device.id,
      device_name: device.name,
      user_email: user.email,
      user_name: user.full_name || user.email,
      start_time: new Date().toISOString(),
      status: "active"
    });
    await base44.entities.Device.update(device.id, { status: "in_use" });
    loadData();
  };

  const handleCheckout = async () => {
    if (!activeSession) return;
    await base44.entities.LabSession.update(activeSession.id, {
      end_time: new Date().toISOString(),
      status: "ended"
    });
    await base44.entities.Device.update(activeSession.device_id, { status: "available" });
    setActiveSession(null);
    loadData();
  };

  if (pending || blocked) {
    return (
      <Layout user={user} isAdmin={isAdmin} profile={profile}>
        <PendingApproval profile={profile} />
      </Layout>
    );
  }

  return (
    <Layout user={user} isAdmin={isAdmin} profile={profile}>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          {toast}
        </div>
      )}

      {activeSession && (
        <div className="mb-6">
          <ActiveSessionBanner session={activeSession} onCheckout={handleCheckout} />
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">מכשירי המעבדה</h1>
            <p className="text-sm text-slate-500 mt-0.5">בחר מכשיר להפעלה או הזמן מראש</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadData} title="רענן">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowReserve(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">הזמן מכשיר</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                canActivate={canActivate}
                hasActiveSession={!!activeSession}
                onActivate={handleActivate}
              />
            ))}
          </div>
        )}
      </section>

      <ReservationSchedule reservations={reservations} user={user} onChanged={loadData} />

      {showReserve && (
        <ReservationModal
          devices={devices.filter((d) => d.status !== "maintenance")}
          user={user}
          onClose={() => setShowReserve(false)}
          onSaved={loadData}
        />
      )}
    </Layout>
  );
}