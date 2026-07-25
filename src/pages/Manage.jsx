import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { UserCheck, Ban, Check, Wrench, ShieldCheck, RefreshCw, Users, Cpu, ChevronDown } from "lucide-react";
import { DEVICE_STATUS, USER_STATUS } from "@/lib/labUtils";

const ROLES = ["lab_admin", "senior_user", "user"];

export default function Manage() {
  const labUser = useLabUser();
  const { t } = useLang();
  const isMainAdmin = labUser.isMainAdmin;
  const canManage = isMainAdmin || labUser.role === "lab_admin";

  const [labs, setLabs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [l, p, d] = await Promise.all([
        base44.entities.Lab.list(),
        base44.entities.UserProfile.list(),
        base44.entities.Device.list()
      ]);
      setLabs(l);
      setProfiles(isMainAdmin ? p : p.filter((x) => x.lab_id === labUser.profile?.lab_id));
      setDevices(isMainAdmin ? d : d.filter((x) => x.lab_id === labUser.profile?.lab_id));
    } finally {
      setLoading(false);
    }
  }, [isMainAdmin, labUser.profile?.lab_id]);

  useEffect(() => { if (!labUser.loading) loadData(); }, [labUser.loading, loadData]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-600 mb-3" />
          <h2 className="text-lg font-heading font-bold text-white">{t("manage.noAccess")}</h2>
          <p className="text-sm text-slate-400">{t("manage.noAccessDesc")}</p>
        </div>
      </Layout>
    );
  }

  const pendingUsers = profiles.filter((p) => p.status === "pending");
  const activeUsers = profiles.filter((p) => p.status !== "pending");

  const setStatus = async (profile, status) => { await base44.entities.UserProfile.update(profile.id, { status }); loadData(); };
  const setRole = async (profile, role) => { await base44.entities.UserProfile.update(profile.id, { role }); loadData(); };
  const setLab = async (profile, labId) => { await base44.entities.UserProfile.update(profile.id, { lab_id: labId || null }); loadData(); };
  const setDeviceStatus = async (device, status) => { await base44.entities.Device.update(device.id, { status }); loadData(); };

  const labName = (id) => labs.find((l) => l.id === id)?.name || t("manage.unassigned");

  return (
    <Layout user={labUser.user} role={labUser.role} lab={labUser.lab}>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{t("manage.title")}</h1>
          <p className="text-sm text-slate-400">{t("manage.subtitle")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={loadData} className="text-slate-300 hover:bg-white/10"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat icon={<Users className="w-4 h-4" />} label={t("admin.stats.pending")} value={pendingUsers.length} tone="amber" />
        <Stat icon={<UserCheck className="w-4 h-4" />} label={t("admin.stats.approved")} value={profiles.filter(p => p.status === "approved").length} tone="emerald" />
        <Stat icon={<Cpu className="w-4 h-4" />} label={t("admin.stats.available")} value={devices.filter(d => d.status === "available").length} tone="indigo" />
        <Stat icon={<Wrench className="w-4 h-4" />} label={t("admin.stats.maintenance")} value={devices.filter(d => d.status === "maintenance").length} tone="rose" />
      </div>

      <Section title={t("manage.pending")} icon={<Users className="w-5 h-5 text-amber-400" />}>
        {loading ? <SkeletonRows /> : pendingUsers.length === 0 ? <Empty text={t("manage.noPending")} /> : (
          <div className="space-y-2">
            {pendingUsers.map((p) => (
              <UserRow key={p.id} profile={p} labs={labs} isMainAdmin={isMainAdmin}
                onApprove={() => setStatus(p, "approved")} onBlock={() => setStatus(p, "blocked")}
                onRole={(r) => setRole(p, r)} onLab={(l) => setLab(p, l)} t={t} />
            ))}
          </div>
        )}
      </Section>

      {activeUsers.length > 0 && (
        <Section title={t("manage.users")} icon={<UserCheck className="w-5 h-5 text-emerald-400" />} className="mt-6">
          <div className="space-y-2">
            {activeUsers.map((p) => (
              <UserRow key={p.id} profile={p} labs={labs} isMainAdmin={isMainAdmin}
                onApprove={() => setStatus(p, "approved")} onBlock={() => setStatus(p, "blocked")}
                onRole={(r) => setRole(p, r)} onLab={(l) => setLab(p, l)} t={t} />
            ))}
          </div>
        </Section>
      )}

      <Section title={t("manage.devices")} icon={<Cpu className="w-5 h-5 text-primary" />} className="mt-6">
        {loading ? <SkeletonRows /> : (
          <div className="space-y-2">
            {devices.map((d) => (
              <DeviceAdminRow key={d.id} device={d} onSet={(s) => setDeviceStatus(d, s)} t={t} labName={labName(d.lab_id)} />
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}

function Section({ title, icon, children, className = "" }) {
  return (
    <section className={className}>
      <h2 className="text-lg font-heading font-bold text-white mb-3 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </section>
  );
}

function Stat({ icon, label, value, tone }) {
  const tones = {
    amber: "bg-amber-500/15 text-amber-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
    indigo: "bg-primary/15 text-primary",
    rose: "bg-rose-500/15 text-rose-400"
  };
  return (
    <div className="rounded-2xl glass p-4">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tones[tone]} mb-2`}>{icon}</div>
      <div className="text-2xl font-heading font-bold text-white">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

function UserRow({ profile, labs, isMainAdmin, onApprove, onBlock, onRole, onLab, t }) {
  const us = USER_STATUS[profile.status] || USER_STATUS.pending;
  const tones = {
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/20"
  };
  const roleOptions = ROLES.map((r) => ({ value: r, label: t("role." + r) }));
  const labOptions = [{ value: "", label: t("manage.unassigned") }, ...labs.map((l) => ({ value: l.id, label: l.name }))];

  return (
    <div className="rounded-2xl glass p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full aestro-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
          {(profile.full_name || profile.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white text-sm truncate">{profile.full_name || profile.email}</div>
          <div className="text-[11px] text-slate-400 truncate">{profile.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tones[us.color]}`}>{t("status." + profile.status)}</span>
        {isMainAdmin && <SelectChip value={profile.lab_id || ""} onChange={onLab} options={labOptions} />}
        <SelectChip value={profile.role} onChange={onRole} options={roleOptions} />
        {profile.status !== "approved" && (
          <Button size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={onApprove}><Check className="w-3.5 h-3.5" />{t("manage.approve")}</Button>
        )}
        {profile.status !== "blocked" && (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-rose-400 border-rose-500/20 hover:bg-rose-500/10" onClick={onBlock}><Ban className="w-3.5 h-3.5" />{t("manage.block")}</Button>
        )}
      </div>
    </div>
  );
}

function SelectChip({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg bg-white/5 border border-white/10 h-8 pl-2 pr-7 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-primary max-w-[120px]">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>)}
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function DeviceAdminRow({ device, onSet, t, labName }) {
  return (
    <div className="rounded-2xl glass p-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Cpu className="w-5 h-5 text-slate-400" /></div>
        <div>
          <div className="font-medium text-white text-sm">{device.name}</div>
          <div className="text-[11px] text-slate-400">{device.location || device.category} · {labName}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {Object.entries(DEVICE_STATUS).map(([key, val]) => (
          <Button key={key} size="sm" variant={device.status === key ? "default" : "outline"}
            className={`h-8 gap-1 ${device.status === key ? "aestro-gradient text-white" : "text-slate-300 border-white/10 hover:bg-white/5"}`}
            onClick={() => onSet(key)}>
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            {t("status." + key)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-3xl glass border-dashed border-white/15 py-10 text-center text-sm text-slate-400">{text}</div>;
}
function SkeletonRows() {
  return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl glass animate-pulse" />)}</div>;
}