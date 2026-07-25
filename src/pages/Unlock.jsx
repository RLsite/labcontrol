import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { CheckCircle2, XCircle, Loader2, Home } from "lucide-react";

// Reached after scanning a device QR. Calls the backend approval function and shows the result.
export default function Unlock() {
  const { t } = useLang();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceId = params.get("d");
    const ts = Number(params.get("t"));

    if (!deviceId || !ts) {
      setState({ status: "error", reason: "Invalid QR code." });
      return;
    }

    (async () => {
      try {
        const res = await base44.functions.invoke("requestDeviceAccess", { device_id: deviceId, ts });
        const data = res.data || res;
        if (data.approved) {
          setState({ status: "approved", device: data.device, session: data.session });
        } else {
          setState({ status: "denied", reason: data.reason || "Access denied." });
        }
      } catch (e) {
        setState({ status: "denied", reason: e?.message || "Request failed." });
      }
    })();
  }, []);

  return (
    <div dir={document.documentElement.dir} className="fixed inset-0 flex items-center justify-center p-6"
      style={{ backgroundImage: "radial-gradient(60rem 60rem at 110% -10%, hsl(240 80% 64% / 0.18), transparent 60%), radial-gradient(50rem 50rem at -10% 0%, hsl(263 78% 62% / 0.14), transparent 55%)" }}>
      <div className="max-w-md w-full glass-strong rounded-3xl p-8 text-center shadow-2xl">
        {state.status === "loading" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-heading font-bold text-white">{t("common.loading")}</h2>
            <p className="text-sm text-slate-400 mt-1">Approving device access…</p>
          </>
        )}

        {state.status === "approved" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Access Approved</h2>
            <p className="text-sm text-slate-300 mt-2">{state.device?.name}</p>
            <p className="text-xs text-slate-400 mt-1">Session active — the device is now unlocked.</p>
            <Link to="/"><button className="mt-6 w-full aestro-gradient hover:opacity-90 text-white font-medium py-2.5 rounded-xl inline-flex items-center justify-center gap-2"><Home className="w-4 h-4" />{t("nav.dashboard")}</button></Link>
          </>
        )}

        {state.status === "denied" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mb-4">
              <XCircle className="w-9 h-9 text-rose-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Access Denied</h2>
            <p className="text-sm text-rose-300 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{state.reason}</p>
            <Link to="/"><button className="mt-6 w-full border border-white/10 text-slate-200 hover:bg-white/5 font-medium py-2.5 rounded-xl inline-flex items-center justify-center gap-2"><Home className="w-4 h-4" />{t("nav.dashboard")}</button></Link>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mb-4">
              <XCircle className="w-9 h-9 text-rose-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Error</h2>
            <p className="text-sm text-slate-400 mt-2">{state.reason}</p>
          </>
        )}
      </div>
    </div>
  );
}