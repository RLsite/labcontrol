import React from "react";
import { Link } from "react-router-dom";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Languages, CalendarDays, CheckCircle2, ExternalLink, Info, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const labUser = useLabUser();
  const { t, lang, setLang } = useLang();

  return (
    <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{t("settings.title")}</h1>
        <p className="text-sm text-slate-400 mt-0.5 mb-6">{t("settings.subtitle")}</p>

        <div className="rounded-3xl glass p-5">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-bold text-white">{t("settings.language.title")}</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1 mb-3">{t("settings.language.desc")}</p>
          <div className="grid grid-cols-2 gap-3">
            <LangOption active={lang === "he"} onClick={() => setLang("he")} label={t("settings.language.he")} />
            <LangOption active={lang === "en"} onClick={() => setLang("en")} label={t("settings.language.en")} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-heading font-bold text-white">{t("settings.connections.title")}</h2>
          </div>
          <p className="text-sm text-slate-400 mb-3">{t("settings.connections.desc")}</p>

          <div className="space-y-3">
            {/* Local — always active */}
            <CalendarCard
              badge={t("settings.connections.active")}
              badgeTone="emerald"
              title={t("settings.connections.localCalendar")}
              desc={t("settings.connections.localCalendarDesc")}
              icon={<CalendarCheck className="w-6 h-6 text-white" />}
              gradient="aestro-gradient"
              action={<Link to="/calendar"><Button variant="outline" className="gap-2 text-slate-200 border-white/10 hover:bg-white/5"><CalendarDays className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.connections.viewBtn")}</span></Button></Link>}
            />
            {/* Google */}
            <CalendarCard
              badge={t("settings.connections.available")}
              badgeTone="blue"
              title={t("settings.connections.googleCalendar")}
              desc={t("settings.connections.googleCalendarDesc")}
              icon={<GIcon />}
              gradient="bg-gradient-to-br from-blue-500 to-emerald-500"
              action={<a href="https://calendar.google.com/calendar" target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2 text-slate-200 border-white/10 hover:bg-white/5"><ExternalLink className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.connections.openBtn")}</span></Button></a>}
            />
            {/* Outlook */}
            <CalendarCard
              badge={t("settings.connections.available")}
              badgeTone="blue"
              title={t("settings.connections.outlookCalendar")}
              desc={t("settings.connections.outlookCalendarDesc")}
              icon={<OIcon />}
              gradient="bg-gradient-to-br from-sky-500 to-blue-600"
              action={<a href="https://outlook.live.com/calendar" target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2 text-slate-200 border-white/10 hover:bg-white/5"><ExternalLink className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.connections.openBtn")}</span></Button></a>}
            />
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{t("settings.connections.manageNote")}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CalendarCard({ badge, badgeTone, title, desc, icon, gradient, action }) {
  const tones = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    blue: "bg-sky-500/15 text-sky-400 border-sky-500/20"
  };
  return (
    <div className="rounded-3xl glass p-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${gradient}`}>{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-white">{title}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${tones[badgeTone]}`}>
              {badgeTone === "emerald" && <CheckCircle2 className="w-3 h-3 inline -mt-0.5 me-1" />}{badge}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function LangOption({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${active ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}>
      {label}
    </button>
  );
}

function GIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#fff" d="M21.35 11.1h-9.17v2.73h6.5c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.18-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.07 2C5.96 2 2.07 6.97 2.07 12c0 4.93 3.79 10 10.15 10 5.3 0 9.18-3.62 9.18-8.97 0-.95-.05-1.93-.05-1.93z" /></svg>
  );
}
function OIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#fff" d="M3 7.5 12 12l9-4.5v9L12 21l-9-4.5v-9zm9-1.8L18.5 3 12 6.3 5.5 3 12 5.7z" /></svg>
  );
}