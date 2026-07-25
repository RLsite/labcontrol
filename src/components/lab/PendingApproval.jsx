import React from "react";
import { Clock3, ShieldCheck, Ban } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function PendingApproval({ profile }) {
  const { t } = useLang();
  const blocked = profile?.status === "blocked";

  return (
    <div className="flex items-center justify-center py-10 sm:py-16">
      <div className={`max-w-md w-full rounded-3xl glass-strong p-8 text-center shadow-2xl ${blocked ? "border-rose-500/30" : "border-amber-500/30"}`}>
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${blocked ? "bg-rose-500/15 text-rose-400 shadow-rose-500/20" : "bg-amber-500/15 text-amber-400 shadow-amber-500/20"}`}>
          {blocked ? <Ban className="w-8 h-8" /> : <Clock3 className="w-8 h-8" />}
        </div>
        <h2 className="text-xl font-heading font-bold text-white mb-2">
          {blocked ? t("pending.blockedTitle") : t("pending.title")}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {blocked ? t("pending.blockedDesc") : t("pending.desc")}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t("pending.statusLabel")} {t(`status.${blocked ? "blocked" : "pending"}`)}
        </div>
      </div>
    </div>
  );
}