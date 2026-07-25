import React from "react";
import { MapPin, Lock, Play, Wrench, CheckCircle2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEVICE_STATUS } from "@/lib/labUtils";

export default function DeviceCard({ device, canActivate, hasActiveSession, onActivate }) {
  const status = DEVICE_STATUS[device.status] || DEVICE_STATUS.available;
  const access = canActivate(device);
  const blocked = !access.ok;
  const busy = device.status === "in_use";
  const maintenance = device.status === "maintenance";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-slate-300 flex flex-col">
      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform" />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm">
          <span className={`w-2 h-2 rounded-full ${status.dot} ${device.status === "in_use" || device.status === "maintenance" ? "animate-pulse" : ""}`} />
          <span className="text-slate-700">{status.label}</span>
        </div>
        {device.requires_training && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-[10px] font-medium border border-indigo-100">
            <Lock className="w-2.5 h-2.5" />
            נדרשת הדרכה
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 leading-tight">{device.name}</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{device.description}</p>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
          {device.category && (
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3 h-3" /> {device.category}
            </span>
          )}
          {device.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {device.location}
            </span>
          )}
        </div>

        {blocked && access.reason && (
          <div className="mt-3 flex items-start gap-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-2">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{access.reason}</span>
          </div>
        )}

        <div className="mt-4">
          {maintenance ? (
            <Button disabled className="w-full gap-2 bg-slate-100 text-slate-400">
              <Wrench className="w-4 h-4" /> לא זמין לשימוש
            </Button>
          ) : busy ? (
            <Button disabled className="w-full gap-2 bg-amber-50 text-amber-700 border border-amber-200">
              <Activity /> בשימוש כעת
            </Button>
          ) : blocked ? (
            <Button disabled className="w-full gap-2 bg-slate-100 text-slate-400">
              <Lock className="w-4 h-4" /> חסרה הסמכה
            </Button>
          ) : (
            <Button
              onClick={() => onActivate(device)}
              disabled={hasActiveSession}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Play className="w-4 h-4 fill-current" />
              {hasActiveSession ? "סיים סשן נוכחי תחילה" : "הפעל מכשיר"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Activity() {
  return <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
}