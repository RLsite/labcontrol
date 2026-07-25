import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { formatDuration } from "@/lib/labUtils";
import { Lock, Unlock as UnlockIcon, QrCode, X, RefreshCw, Cpu } from "lucide-react";

// Device kiosk terminal: shows a rotating QR; unlocks when an active session appears for this device.
export default function DeviceTerminal() {
  const { deviceId } = useParams();
  const { t, lang } = useLang();
  const [device, setDevice] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrTs, setQrTs] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef(null);

  // Load device + active session, then poll.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const dev = await base44.entities.Device.get(deviceId);
        const sessions = await base44.entities.LabSession.filter({ device_id: deviceId, status: "active" });
        if (!active) return;
        setDevice(dev);
        setSession(sessions[0] || null);
      } catch (e) {
        if (active) setDevice(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    tick();
    pollRef.current = setInterval(tick, 2000);
    return () => { active = false; clearInterval(pollRef.current); };
  }, [deviceId]);

  // Rotate QR timestamp every 60s (window is 120s).
  useEffect(() => {
    const id = setInterval(() => setQrTs(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Elapsed timer when active.
  useEffect(() => {
    if (!session) { setElapsed(0); return; }
    const start = new Date(session.start_time).getTime();
    const upd = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, [session]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!device) {
    return (
      <KioskShell>
        <div className="text-center text-slate-400">
          <Cpu className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Device not found.</p>
          <Link to="/" className="text-primary text-sm mt-4 inline-block">← Back</Link>
        </div>
      </KioskShell>
    );
  }

  const unlocked = !!session;
  const qrUrl = `${window.location.origin}/unlock?d=${deviceId}&t=${qrTs}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(qrUrl)}`;

  return (
    <KioskShell>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Cpu className="w-3.5 h-3.5" /> {device.category || "Device"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">{device.name}</h1>
        <p className="text-sm text-slate-400 mt-1">{device.location}</p>
      </div>

      <div className="mt-8 sm:mt-10">
        {unlocked ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <UnlockIcon className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400" />
              </div>
              <span className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-400 border-2 border-background" />
              </span>
            </div>
            <div className="mt-5 text-emerald-400 font-heading font-bold text-xl tracking-wide">UNLOCKED</div>
            <div className="mt-1 text-sm text-slate-300">{session.user_name}</div>
            <div className="mt-4 font-mono text-3xl sm:text-4xl font-bold tabular-nums text-white">{formatDuration(elapsed)}</div>
            <div className="mt-1 text-[11px] text-slate-500">{t("session.startedAt")}{new Date(session.start_time).toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <Lock className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400" />
            </div>
            <div className="mt-5 text-amber-400 font-heading font-bold text-xl tracking-wide">LOCKED</div>

            <div className="mt-6 glass rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3">
                <QrCode className="w-4 h-4" /> Scan to activate
              </div>
              <div className="bg-white p-3 rounded-2xl">
                <img src={qrImg} alt="QR" className="w-56 h-56 sm:w-64 sm:h-64" />
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-500">
                <RefreshCw className="w-3 h-3" /> Auto-refreshes every 60s
              </div>
            </div>
          </div>
        )}
      </div>
    </KioskShell>
  );
}

function KioskShell({ children }) {
  return (
    <div dir={document.documentElement.dir} className="fixed inset-0 flex flex-col items-center justify-center bg-background p-6 overflow-auto"
      style={{ backgroundImage: "radial-gradient(60rem 60rem at 110% -10%, hsl(240 80% 64% / 0.18), transparent 60%), radial-gradient(50rem 50rem at -10% 0%, hsl(263 78% 62% / 0.14), transparent 55%)" }}>
      <Link to="/" className="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X className="w-6 h-6" />
      </Link>
      {children}
    </div>
  );
}