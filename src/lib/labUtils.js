// עזרים למערכת ניהול המעבדה

export const DEVICE_STATUS = {
  available: { label: "פנוי לשימוש", color: "emerald", dot: "bg-emerald-500" },
  in_use: { label: "בשימוש כעת", color: "amber", dot: "bg-amber-500" },
  maintenance: { label: "תקול / בבדיקה", color: "rose", dot: "bg-rose-500" }
};

export const USER_STATUS = {
  pending: { label: "ממתין לאישור", color: "amber" },
  approved: { label: "מאושר", color: "emerald" },
  blocked: { label: "חסום", color: "rose" }
};

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

export function formatDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("he-IL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("he-IL", { weekday: "long", day: "2-digit", month: "long" });
  } catch {
    return iso;
  }
}

// בונה קישור "הוסף ל-Google Calendar" ללא צורך ב-OAuth
export function googleCalendarUrl({ title, startISO, endISO, details, location }) {
  const fmt = (iso) => {
    const d = new Date(iso);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
    details: details || "",
    location: location || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// לוקליזציה של שם חודש לקיבוץ
export function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}