import React from "react";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Languages, Plug, Calendar, CheckCircle2, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const labUser = useLabUser();
  const { t, lang, setLang } = useLang();

  return (
    <Layout user={labUser.user} isAdmin={labUser.isAdmin} profile={labUser.profile}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("settings.title")}</h1>
        <p className="text-sm text-slate-500 mt-0.5 mb-6">{t("settings.subtitle")}</p>

        {/* שפה */}
        <Section icon={<Languages className="w-5 h-5 text-indigo-600" />} title={t("settings.language.title")} desc={t("settings.language.desc")}>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <LangOption active={lang === "he"} onClick={() => setLang("he")} label={t("settings.language.he")} />
            <LangOption active={lang === "en"} onClick={() => setLang("en")} label={t("settings.language.en")} />
          </div>
        </Section>

        {/* חיבורים */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Plug className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">{t("settings.connections.title")}</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">{t("settings.connections.desc")}</p>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{t("settings.connections.googleCalendar")}</div>
                <p className="text-sm text-slate-500 mt-0.5 max-w-md">{t("settings.connections.googleCalendarDesc")}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("settings.connections.connected")}
                </div>
              </div>
            </div>
            <a href="https://calendar.google.com/calendar" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings.connections.openBtn")}</span>
              </Button>
            </a>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{t("settings.connections.manageNote")}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Section({ icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
      {children}
    </div>
  );
}

function LangOption({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}