import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { Cpu, Users, Plus, ChevronLeft, CalendarDays, MapPin, Trash2, FlaskConical } from "lucide-react";
import { DEVICE_STATUS } from "@/lib/labUtils";
import LocalCalendar from "@/components/lab/LocalCalendar";
import AddDeviceModal from "@/components/lab/AddDeviceModal";
import InviteUserModal from "@/components/lab/InviteUserModal";

export default function LabManage() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const labUser = useLabUser();
  const { t, lang } = useLang();
  const [lab, setLab] = useState(null);
  const [devices, setDevices] = useState([]);
  const [members, setMembers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const loadData = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const [labObj, devs, profiles, res] = await Promise.all([
        base44.entities.Lab.get(labId).catch(() => null),
        base44.entities.Device.filter({ lab_id: labId }),
        base44.entities.UserProfile.filter({ lab_id: labId }),
        base44.entities.Reservation.filter({ lab_id: labId })
      ]);
      setLab(labObj);
      setDevices(devs);
      setMembers(profiles);
      setReservations(res.filter((r) => r.status !== "cancelled"));
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteDevice = async (d) => {
    if (!confirm(t("labManage.confirmDeleteDevice"))) return;
    await base44.entities.Device.delete(d.id);
    loadData();
  };
  const removeMember = async (p) => {
    if (!confirm(t("labManage.confirmRemoveMember"))) return;
    await base44.entities.UserProfile.update(p.id, { lab_id: null });
    loadData();
  };
  const deleteLab = async () => {
    if (!confirm(t("labManage.confirmDeleteLab"))) return;
    // Clean up: detach members, delete devices of this lab.
    await Promise.all(members.map((p) => base44.entities.UserProfile.update(p.id, { lab_id: null }).catch(() => {})));
    await base44.entities.Device.deleteMany({ lab_id: labId }).catch(() => {});
    await base44.entities.Reservation.deleteMany({ lab_id: labId }).catch(() => {});
    await base44.entities.Lab.delete(labId);
    navigate("/");
  };

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isMainAdmin = labUser.isMainAdmin;

  return (
    <Layout user={labUser.user} role={labUser.role} lab={lab}>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3">
          <ChevronLeft className={`w-3.5 h-3.5 ${lang === "he" ? "rotate-180" : ""}`} />
          {t("labManage.backToLabs")}
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl aestro-gradient flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">{lab?.name || "—"}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                {lab?.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{lab.location}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/calendar?lab=${labId}`}>
              <Button variant="outline" className="gap-2 border-white/10 text-slate-200 hover:bg-white/5">
                <CalendarDays className="w-4 h-4" /><span className="hidden sm:inline">{t("nav.calendar")}</span>
              </Button>
            </Link>
            {isMainAdmin && (
              <Button variant="ghost" className="gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={deleteLab}>
                <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">{t("labManage.deleteLab")}</span>
              </Button>
            )}
          </div>
        </div>
        {lab?.description && <p className="text-sm text-slate-400 mt-3">{lab.description}</p>}
      </div>

      {/* Devices */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-primary" />{t("labManage.devices")}</h2>
          <Button onClick={() => setShowAddDevice(true)} size="sm" className="gap-1.5 aestro-gradient hover:opacity-90 text-white">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">{t("labManage.addDevice")}</span>
          </Button>
        </div>
        {loading ? (
          <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl glass animate-pulse" />)}</div>
        ) : devices.length === 0 ? (
          <EmptyBlock icon={<Cpu className="w-8 h-8" />} title={t("labManage.noDevices")} desc={t("labManage.noDevicesDesc")} cta={t("labManage.addDevice")} onCta={() => setShowAddDevice(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {devices.map((d) => {
              const st = DEVICE_STATUS[d.status] || DEVICE_STATUS.available;
              return (
                <div key={d.id} className="rounded-2xl glass p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                    {d.image_url ? <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" /> : <Cpu className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white text-sm truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{[d.category, d.location].filter(Boolean).join(" · ") || "—"}</div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] mt-1">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />{t(`status.${d.status}`)}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 shrink-0" onClick={() => deleteDevice(d)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Members */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" />{t("labManage.members")}</h2>
          <Button onClick={() => setShowInvite(true)} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">{t("labManage.inviteUser")}</span>
          </Button>
        </div>
        {loading ? (
          <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl glass animate-pulse" />)}</div>
        ) : members.length === 0 ? (
          <EmptyBlock icon={<Users className="w-8 h-8" />} title={t("labManage.noMembers")} desc={t("labManage.noMembersDesc")} cta={t("labManage.inviteUser")} onCta={() => setShowInvite(true)} />
        ) : (
          <div className="space-y-2">
            {members.map((p) => (
              <div key={p.id} className="rounded-2xl glass p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full aestro-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(p.full_name || p.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-sm truncate">{p.full_name || p.email}</div>
                    <div className="text-[11px] text-slate-400 truncate">{p.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{t(`role.${p.role === "lab_admin" ? "labAdmin" : p.role === "senior_user" ? "seniorUser" : "user"}`)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => removeMember(p)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section>
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2 mb-3"><CalendarDays className="w-5 h-5 text-primary" />{t("lab.labCalendar")}</h2>
        <LocalCalendar reservations={reservations} lang={lang} />
      </section>

      {showAddDevice && <AddDeviceModal labId={labId} onClose={() => setShowAddDevice(false)} onSaved={loadData} />}
      {showInvite && <InviteUserModal labId={labId} onClose={() => setShowInvite(false)} onSaved={loadData} />}
    </Layout>
  );
}

function EmptyBlock({ icon, title, desc, cta, onCta }) {
  return (
    <div className="rounded-3xl glass border-dashed border-white/15 py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">{icon}</div>
      <h3 className="font-heading font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 mb-4">{desc}</p>
      <Button onClick={onCta} size="sm" className="gap-1.5 aestro-gradient hover:opacity-90 text-white"><Plus className="w-4 h-4" />{cta}</Button>
    </div>
  );
}