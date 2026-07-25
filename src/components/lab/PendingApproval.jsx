import React from "react";
import { Clock3, ShieldCheck, Ban } from "lucide-react";
import { USER_STATUS } from "@/lib/labUtils";

export default function PendingApproval({ profile }) {
  const blocked = profile?.status === "blocked";
  const pending = !profile || profile?.status === "pending";

  if (blocked) {
    return (
      <CenterCard
        icon={<Ban className="w-8 h-8 text-rose-600" />}
        title="הגישה נחסמה"
        desc="מנהל המעבדה חסם את החשבון שלך. לבירור נא פנה למנהל המעבדה."
        tone="rose"
      />
    );
  }

  return (
    <CenterCard
      icon={<Clock3 className="w-8 h-8 text-amber-600" />}
      title="הרשמה התקבלה — ממתין לאישור"
      desc={profile
        ? "חשבונך נרשם בהצלחה וממתין לאישור מנהל המעבדה. תקבל גישה מלאה לאחר האישור."
        : "חשבונך נרשם בהצלחה וממתין לאישור מנהל המעבדה. תקבל גישה מלאה לאחר האישור."}
      tone="amber"
    />
  );
}

function CenterCard({ icon, title, desc, tone }) {
  const tones = {
    amber: "bg-amber-50 border-amber-200",
    rose: "bg-rose-50 border-rose-200"
  };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`max-w-md w-full rounded-2xl border ${tones[tone]} p-8 text-center`}>
        <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          סטטוס: {USER_STATUS[pendingOrBlocked(tone)].label}
        </div>
      </div>
    </div>
  );
}

function pendingOrBlocked(tone) {
  return tone === "rose" ? "blocked" : "pending";
}