import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { FlaskConical, LayoutDashboard, ShieldCheck, LogOut, CalendarDays, HelpCircle, Settings as SettingsIcon, Languages, Menu, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ user, role, lab, children }) {
  const location = useLocation();
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await base44.auth.logout(); };
  const isMainAdmin = role === "main_admin";
  const canManage = isMainAdmin || role === "lab_admin";

  const navItems = [
    { to: "/", label: t("nav.dashboard"), Icon: LayoutDashboard, show: !isMainAdmin },
    { to: "/", label: t("nav.labs"), Icon: Layers, show: isMainAdmin },
    { to: "/calendar", label: t("nav.calendar"), Icon: CalendarDays, show: true },
    { to: "/manage", label: t("nav.manage"), Icon: ShieldCheck, show: canManage },
    { to: "/help", label: t("nav.help"), Icon: HelpCircle, show: true },
    { to: "/settings", label: t("nav.settings"), Icon: SettingsIcon, show: true }
  ].filter((i) => i.show);

  const roleLabel = t(`role.${role || "unknown"}`);
  const displayName = user?.full_name || user?.email || t("role.unknown");
  const active = (to) => location.pathname === to;

  const NavBtn = ({ to, label, Icon, onClick }) => (
    <Link to={to} onClick={onClick}>
      <Button
        variant={active(to) ? "default" : "ghost"}
        className={`w-full justify-start gap-2.5 h-10 ${active(to) ? "aestro-gradient text-white shadow-lg shadow-primary/20" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    </Link>
  );

  return (
    <div dir={lang === "he" ? "rtl" : "ltr"} className="min-h-screen text-foreground font-body">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl aestro-gradient flex items-center justify-center shadow-lg shadow-primary/30">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-heading font-bold tracking-tight text-gradient">{t("app.title")}</div>
              <div className="hidden sm:block text-[11px] text-slate-400">{t("app.subtitle")}</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((i) => <NavBtn key={i.label} {...i} />)}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => setLang(lang === "he" ? "en" : "he")} title={lang === "he" ? "English" : "עברית"} className="text-slate-300 hover:text-white">
              <Languages className="w-4 h-4" />
            </Button>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium text-white max-w-[140px] truncate">{displayName}</span>
              <span className="text-[11px] text-slate-400">{roleLabel}</span>
            </div>
            <div className="w-9 h-9 rounded-full aestro-gradient flex items-center justify-center text-sm font-bold text-white shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t("common.logout")} className="text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-300" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 px-4 py-3 space-y-1 glass">
            {navItems.map((i) => <NavBtn key={i.label} {...i} onClick={() => setMenuOpen(false)} />)}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {navItems.slice(0, 5).map(({ to, label, Icon }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg">
            <Icon className={`w-5 h-5 ${active(to) ? "text-primary" : "text-slate-400"}`} />
            <span className={`text-[10px] ${active(to) ? "text-primary font-medium" : "text-slate-500"}`}>{label}</span>
          </Link>
        ))}
      </nav>

      <footer className="hidden lg:block max-w-7xl mx-auto px-6 py-6 text-center text-[11px] text-slate-500">
        {t("app.footer")}
      </footer>
    </div>
  );
}