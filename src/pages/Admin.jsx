import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLabUser } from "@/lib/useLabUser";
import Layout from "@/components/lab/Layout";
import { Button } from "@/components/ui/button";
import { UserCheck, Ban, Check, Wrench, ShieldCheck, RefreshCw, Users, Cpu } from "lucide-react";
import { DEVICE_STATUS, USER_STATUS, formatDateTime } from "@/lib/labUtils";

export default function Admin() {
  const labUser = useLabUser();
  const [profiles, setProfiles] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Device.list()
      ]);
      setProfiles(p);
      setDevices(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (labUser.user) loadData();
  }, [labUser.user, loadData]);

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!labUser.isAdmin) {
    return (
      <Layout user={labUser.user} isAdmin={false} profile={labUser.profile}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-700">אין הרשאה</h2>
          <p className="text-sm text-slate-500">פאנל הניהול זמין למנהלי המעבדה בלבד.</p>
        </div>
      </Layout>
    );
  }

  const pendingUsers = profiles.filter((p) => p.status === "pending");
  const otherUsers = profiles.filter((p) => p.status !== "pending");

  const setStatus = async (profile, status) => {
    await base44.entities.UserProfile.update(profile.id, { status });
    loadData();
  };

  const setDeviceStatus = async (device, status) => {
    await base44.entities.Device.update(device.id, { status });
    loadData();
  };

  return (
    <Layout user={labUser.user} isAdmin={true} profile={labUser.profile}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">פאנל ניהול</h1>
          <p className="text-sm text-slate-500 mt-0.5">ניהול משתמשים וסטטוס מכשירים</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadData} title="רענן">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat icon={<Users className="w-4 h-4" />} label="ממתינים לאישור" value={pendingUsers.length} tone="amber" />
        <Stat icon={<UserCheck className="w-4 h-4" />} label="משתמשים מאושרים" value={profiles.filter(p => p.status === "approved").length} tone="emerald" />
        <Stat icon={<Cpu className="w-4 h-4" />} label="מכשירים פנויים" value={devices.filter(d => d.status === "available").length} tone="indigo" />
        <Stat icon={<Wrench className="w-4 h-4" />} label="בבדיקה/תקול" value={devices.filter(d => d.status === "maintenance").length} tone="rose" />
      </div>

      {/* משתמשים ממתינים */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          משתמשים הממתינים לאישור
        </h2>
        {loading ? (
          <SkeletonRows />
        ) : pendingUsers.length === 0 ? (
          <Empty text="אין משתמשים הממתינים לאישור." />
        ) : (
          <div className="space-y-2">
            {pendingUsers.map((p) => (
              <UserRow key={p.id} profile={p} onApprove={() => setStatus(p, "approved")} onBlock={() => setStatus(p, "blocked")} pending />
            ))}
          </div>
        )}
      </section>

      {/* משתמשים אחרים */}
      {otherUsers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">משתמשים פעילים</h2>
          <div className="space-y-2">
            {otherUsers.map((p) => (
              <UserRow key={p.id} profile={p}
                onApprove={() => setStatus(p, "approved")}
                onBlock={() => setStatus(p, "blocked")} />
            ))}
          </div>
        </section>
      )}

      {/* ניהול מכשירים */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          ניהול סטטוס מכשירים
        </h2>
        {loading ? (
          <SkeletonRows />
        ) : (
          <div className="space-y-2">
            {devices.map((d) => (
              <DeviceAdminRow key={d.id} device={d} onSet={(s) => setDeviceStatus(d, s)} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function Stat({ icon, label, value, tone }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    rose: "bg-rose-50 text-rose-700"
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tones[tone]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function UserRow({ profile, onApprove, onBlock, pending }) {
  const us = USER_STATUS[profile.status] || USER_STATUS.pending;
  const tones = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200"
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
          {(profile.full_name || profile.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">
            {profile.full_name || profile.email}
          </div>
          <div className="text-[11px] text-slate-500 truncate">{profile.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tones[us.color]}`}>{us.label}</span>
        {profile.status !== "approved" && (
          <Button size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onApprove}>
            <Check className="w-3.5 h-3.5" /> אשר
          </Button>
        )}
        {profile.status !== "blocked" && (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={onBlock}>
            <Ban className="w-3.5 h-3.5" /> חסום
          </Button>
        )}
      </div>
    </div>
  );
}

function DeviceAdminRow({ device, onSet }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <div className="font-semibold text-sm text-slate-900">{device.name}</div>
          <div className="text-[11px] text-slate-500">{device.location || device.category}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {Object.entries(DEVICE_STATUS).map(([key, val]) => (
          <Button
            key={key}
            size="sm"
            variant={device.status === key ? "default" : "outline"}
            className={`h-8 gap-1 ${device.status === key ? `bg-slate-900 text-white` : ""}`}
            onClick={() => onSet(key)}
          >
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            {val.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-white border border-slate-200 animate-pulse" />
      ))}
    </div>
  );
}