import React from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { FlaskConical, LayoutDashboard, ShieldCheck, LogOut, CalendarDays, HelpCircle, Settings as SettingsIcon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ user, isAdmin, profile, children }) {
  const location = useLocation();
  const { t, lang, setLang } = useLang();

  const handleLogout = async () => { await base44.auth.logout(); };

  const navItem = (to, label, Icon) => {
    const active = location.pathname === to;
    return (
      <Link to={to}>
        <Button
          variant={active ? "default" : "ghost"}
          className={`w-full justify-start gap-2 ${active ? "" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      </Link>
    );
  };

  const displayName = user?.full_name || user?.email || t("role.user");
  const roleLabel = isAdmin ? t("role.admin") : profile?.status === "approved" ? t("role.researcher") : t("role.user");

  return (
    <div dir={lang === "he" ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 text-slate-900 font-body">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{t("app.title")}</div>
              <div className="text-[11px] text-slate-500">{t("app.subtitle")}</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItem("/", t("nav.dashboard"), LayoutDashboard)}
            {navItem("/schedule", t("nav.schedule"), CalendarDays)}
            {navItem("/help", t("nav.help"), HelpCircle)}
            {navItem("/settings", t("nav.settings"), SettingsIcon)}
            {isAdmin && navItem("/admin", t("nav.admin"), ShieldCheck)}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              title={lang === "he" ? "English" : "עברית"}
            >
              <Languages className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium text-slate-900">{displayName}</span>
              <span className="text-[11px] text-slate-500">{roleLabel}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t("common.logout")}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItem("/", t("nav.dashboard"), LayoutDashboard)}
          {navItem("/schedule", t("nav.schedule"), CalendarDays)}
          {navItem("/help", t("nav.help"), HelpCircle)}
          {navItem("/settings", t("nav.settings"), SettingsIcon)}
          {isAdmin && navItem("/admin", t("nav.admin"), ShieldCheck)}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-[11px] text-slate-400">
        {t("app.footer")}
      </footer>
    </div>
  );
}