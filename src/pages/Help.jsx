import React from "react";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { BookOpen, Info, LogIn, LayoutDashboard, Activity, ShieldCheck, CalendarClock, Settings2 } from "lucide-react";

export default function Help() {
  const labUser = useLabUser();
  const { t } = useLang();

  const sections = [
    { icon: LogIn, key: "login" },
    { icon: LayoutDashboard, key: "dashboard" },
    { icon: Activity, key: "session" },
    { icon: ShieldCheck, key: "permissions" },
    { icon: CalendarClock, key: "reservations" },
    { icon: Settings2, key: "admin" }
  ];

  return (
    <Layout user={labUser.user} isAdmin={labUser.isAdmin} profile={labUser.profile}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("help.title")}</h1>
            <p className="text-sm text-slate-500">{t("help.subtitle")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 flex gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-slate-900 mb-1">{t("help.overview.title")}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t("help.overview.body")}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sections.map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t(`help.sections.${key}.title`)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">{t(`help.sections.${key}.body`)}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">{t("help.contact")}</p>
      </div>
    </Layout>
  );
}