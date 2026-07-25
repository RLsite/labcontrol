import React from "react";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { BookOpen, Info, ShieldCheck, LogIn, LayoutDashboard, Activity, CalendarClock, Settings2 } from "lucide-react";

export default function Help() {
  const labUser = useLabUser();
  const { t } = useLang();

  const sections = [
    { icon: ShieldCheck, key: "roles" },
    { icon: LogIn, key: "login" },
    { icon: LayoutDashboard, key: "dashboard" },
    { icon: Activity, key: "session" },
    { icon: ShieldCheck, key: "permissions" },
    { icon: CalendarClock, key: "reservations" }
  ];

  return (
    <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl aestro-gradient flex items-center justify-center shadow-lg shadow-primary/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{t("help.title")}</h1>
            <p className="text-sm text-slate-400">{t("help.subtitle")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl glass p-5 flex gap-3 border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading font-bold text-white mb-1">{t("help.overview.title")}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{t("help.overview.body")}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sections.map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-3xl glass p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white">{t(`help.sections.${key}.title`)}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-1">{t(`help.sections.${key}.body`)}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">{t("help.contact")}</p>
      </div>
    </Layout>
  );
}