import React, { useEffect, useState } from "react";
import { Activity, Square, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { formatDuration, formatTime } from "@/lib/labUtils";

export default function ActiveSessionBanner({ session, onCheckout }) {
  const { t, lang } = useLang();
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const start = new Date(session.start_time).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.start_time]);

  const handleCheckout = async () => {
    setEnding(true);
    try { await onCheckout(); } finally { setEnding(false); }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl aestro-gradient text-white shadow-xl shadow-primary/30">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-white/80">
              <Activity className="w-3.5 h-3.5" />
              {t("session.active")}
            </div>
            <div className="text-lg font-heading font-bold mt-0.5 truncate">{session.device_name}</div>
            <div className="text-xs text-white/70 mt-0.5">{t("session.startedAt")}{formatTime(session.start_time, lang)}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <div className="text-center">
            <div className="text-[11px] text-white/70 mb-1">{t("session.elapsed")}</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums tracking-tight">{formatDuration(elapsed)}</div>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={ending}
            className="bg-white text-primary hover:bg-white/90 gap-2 font-semibold shadow-lg"
          >
            <Square className="w-4 h-4 fill-current" />
            {ending ? t("session.checkingOut") : t("session.checkout")}
          </Button>
        </div>
      </div>
    </div>
  );
}