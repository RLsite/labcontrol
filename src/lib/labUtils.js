// עזרים למערכת ניהול המעבדה (Aestro)

export const DEVICE_STATUS = {
  available: { dot: "bg-emerald-400", glow: "shadow-emerald-500/30" },
  in_use: { dot: "bg-amber-400", glow: "shadow-amber-500/30" },
  maintenance: { dot: "bg-rose-400", glow: "shadow-rose-500/30" }
};

export const USER_STATUS = {
  pending: { color: "amber" },
  approved: { color: "emerald" },
  blocked: { color: "rose" }
};

export const ROLE_RANK = { main_admin: 4, lab_admin: 3, senior_user: 2, user: 1 };

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

export function formatDateTime(iso, lang = "en") {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(lang === "he" ? "he-IL" : "en-US", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch { return iso; }
}

export function formatDate(iso, lang = "en") {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { weekday: "long", day: "2-digit", month: "long" });
  } catch { return iso; }
}

export function formatTime(iso, lang = "en") {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export function googleCalendarUrl({ title, startISO, endISO, details, location }) {
  const fmt = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE", text: title,
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
    details: details || "", location: location || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}