import React from "react";
import { MapPin, Lock, Play, Wrench, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { DEVICE_STATUS } from "@/lib/labUtils";

export default function DeviceCard({ device, canActivate, hasActiveSession, onActivate }) {
  const { t } = useLang();
  const status = DEVICE_STATUS[device.status] || DEVICE_STATUS.available;
  const access = canActivate(device);
  const blocked = !access.ok;
  const busy = device.status === "in_use";
  const maintenance = device.status === "maintenance";

  return (
    <div className="group rounded-3xl glass overflow-hidden transition-all hover:bg-white/[0.07] hover:border-white/20 flex flex-col">
      <div className="relative h-28 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-12 h-12 text-slate-600 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <span className={`w-2 h-2 rounded-full ${status.dot} ${busy || maintenance ? "animate-pulse" : ""}`} />
          <span className="text-slate-200">{t(`status.${device.status}`)}</span>
        </div>
        {device.requires_training && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/15 text-primary px-2 py-1 rounded-full text-[10px] font-medium border border-primary/20">
            <Lock className="w-2.5 h-2.5" />
            {t("device.requiresTraining")}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-white leading-tight">{device.name}</h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">{device.description}</p>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 flex-wrap">
          {device.category && <span className="inline-flex items-center gap-1"><Cpu className="w-3 h-3" /> {device.category}</span>}
          {device.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {device.location}</span>}
        </div>

        {blocked && access.reason && (
          <div className="mt-3 flex items-start gap-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-2.5 py-2">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{access.reason}</span>
          </div>
        )}

        <div className="mt-4">
          {maintenance ? (
            <Button disabled className="w-full gap-2 bg-white/5 text-slate-500">
              <Wrench className="w-4 h-4" /> {t("device.notAvailable")}
            </Button>
          ) : busy ? (
            <Button disabled className="w-full gap-2 bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> {t("device.busy")}
            </Button>
          ) : blocked ? (
            <Button disabled className="w-full gap-2 bg-white/5 text-slate-500">
              <Lock className="w-4 h-4" /> {t("device.missingCert")}
            </Button>
          ) : (
            <Button
              onClick={() => onActivate(device)}
              disabled={hasActiveSession}
              className="w-full gap-2 aestro-gradient hover:opacity-90 text-white shadow-lg shadow-primary/20"
            >
              <Play className="w-4 h-4 fill-current" />
              {hasActiveSession ? t("device.finishSessionFirst") : t("device.activate")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}