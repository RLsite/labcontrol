import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// מערכת תרגום דו-לשונית: עברית (ברירת מחדל, RTL) ואנגלית (LTR)
const DICT = {
  he: {
    app: { title: "מעבדת חומרים מתקדמים", subtitle: "ניהול מכשירים ובקרת גישה", footer: "מערכת ניהול מכשירי מעבדה · כל הזכויות שמורות" },
    nav: { dashboard: "לוח בקרה", schedule: "לוח זמנים", admin: "ניהול", help: "עזרה", settings: "הגדרות" },
    role: { admin: "מנהל מעבדה", researcher: "חוקר מאושר", user: "משתמש" },
    common: { logout: "התנתק", close: "סגור", loading: "טוען...", cancel: "ביטול", refresh: "רענן", save: "שמור" },
    status: { available: "פנוי לשימוש", in_use: "בשימוש כעת", maintenance: "תקול / בבדיקה", pending: "ממתין לאישור", approved: "מאושר", blocked: "חסום" },
    pending: {
      title: "הרשמה התקבלה — ממתין לאישור",
      desc: "חשבונך נרשם בהצלחה וממתין לאישור מנהל המעבדה. תקבל גישה מלאה לאחר האישור.",
      blockedTitle: "הגישה נחסמה",
      blockedDesc: "מנהל המעבדה חסם את החשבון שלך. לבירור נא פנה למנהל המעבדה.",
      statusLabel: "סטטוס:"
    },
    session: {
      active: "סשן עבודה פעיל",
      elapsed: "זמן שחלף",
      checkout: "סיום עבודה / Check-out",
      checkingOut: "מסיים...",
      startedAt: "התחיל ב-"
    },
    device: {
      title: "מכשירי המעבדה",
      subtitle: "בחר מכשיר להפעלה או הזמן מראש",
      requiresTraining: "נדרשת הדרכה",
      activate: "הפעל מכשיר",
      busy: "בשימוש כעת",
      notAvailable: "לא זמין לשימוש",
      missingCert: "חסרה הסמכה",
      finishSessionFirst: "סיים סשן נוכחי תחילה",
      trainingPrefix: "נדרשת הדרכה:"
    },
    toast: {
      activeExists: "יש כבר סשן פעיל. סיים אותו לפני הפעלת מכשיר נוסף."
    },
    reserve: {
      title: "הזמנת מכשיר",
      device: "מכשיר",
      start: "התחלה",
      end: "סיום",
      purpose: "מטרת השימוש (לא חובה)",
      purposePlaceholder: "תיאור קצר של הניסוי...",
      create: "צור הזמנה",
      creating: "שומר...",
      saved: "ההזמנה נשמרה",
      syncGoogle: "סנכרן ל-Google Calendar",
      syncNote: "הקישור יפתח את היומן עם פרטי ההזמנה — ניתן לשמור כאירוע ביומן האישי.",
      addToCalendar: "נוסף אוטומטית ליומן המעבדה המשותף."
    },
    schedule: {
      title: "לוח זמנים",
      subtitle: "ההזמנות שלך וסנכרון ל-Google Calendar",
      noTitle: "אין הזמנות מתוכננות",
      noDesc: "חזור ללוח הבקרה כדי להזמין מכשיר.",
      googleBtn: "Google Calendar"
    },
    home: {
      myReservations: "לוח הזמנות שלי",
      noReservations: "אין הזמנות עתידיות. הזמן מכשיר כדי להתחיל.",
      reserveBtn: "הזמן מכשיר"
    },
    admin: {
      title: "פאנל ניהול",
      subtitle: "ניהול משתמשים וסטטוס מכשירים",
      pending: "משתמשים הממתינים לאישור",
      active: "משתמשים פעילים",
      devices: "ניהול סטטוס מכשירים",
      noPending: "אין משתמשים הממתינים לאישור.",
      approve: "אשר",
      block: "חסום",
      noAccess: "אין הרשאה",
      noAccessDesc: "פאנל הניהול זמין למנהלי המעבדה בלבד.",
      stats: { pending: "ממתינים לאישור", approved: "משתמשים מאושרים", available: "מכשירים פנויים", maintenance: "בבדיקה/תקול" }
    },
    help: {
      title: "עזרה ותיעוד",
      subtitle: "כל מה שצריך לדעת על מערכת ניהול המעבדה",
      overview: { title: "סקירה כללית", body: "המערכת מאפשרת ניהול מלא של מכשירי המעבדה: מעקב אחר זמינות, הפעלת מכשירים עם סשן עבודה פעיל, הזמנה מראש, בקרת גישה על בסיס הסמכות, וסנכרון הזמנות ל-Google Calendar. מנהל המעבדה מאשר משתמשים חדשים ומנהל את סטטוס המכשירים." },
      sections: {
        login: { title: "כניסה והרשמה", body: "משתמשים חדשים נרשמים דרך מסך ההרשמה. לאחר הרשמה, החשבון ממתין לאישור מנהל המעבדה. רק לאחר אישור תקבל גישה למכשירים." },
        dashboard: { title: "לוח הבקרה", body: "מציג את כל מכשירי המעבדה בכרטיסיות עם סטטוס צבעוני: פנוי (ירוק), בשימוש (צהוב), או תקול/בבדיקה (אדום). ניתן להפעיל מכשיר פנוי או להזמין מראש." },
        session: { title: "סשן עבודה פעיל", body: "בעת הפעלת מכשיר נפתח סשן פעיל עם טיימר חי. ניתן להחזיק סשן אחד בכל פעם. לסיום, לחץ 'סיום עבודה' — המכשיר ישוחרר ויהפוך לפנוי." },
        permissions: { title: "בקרת גישה והסמכות", body: "מכשירים מסוימים דורשים הדרכה. אם לא עברת הדרכה למכשיר, כפתור ההפעלה יהיה חסום ותוצג התראה. מנהל המעבדה יכול להוסיף הסמכות למשתמש." },
        reservations: { title: "הזמנות ו-Google Calendar", body: "ניתן להזמין מכשיר מראש עם תאריך, שעות ומטרה. ההזמנות מסונכרנות אוטומטית ליומן Google Calendar המשותף של המעבדה (כשמחובר), וניתן גם להוסיף ידנית ליומן האישי." },
        admin: { title: "פאנל ניהול", body: "זמין למנהלי המעבדה בלבד. מאפשר אישור/חסימת משתמשים, צפייה במשתמשים הממתינים, ושינוי סטטוס מכשירים (פנוי/בשימוש/תקול)." }
      },
      contact: "לשאלות נוספות, פנה למנהל המעבדה."
    },
    settings: {
      title: "הגדרות",
      subtitle: "נהל חיבורים ושפה",
      language: { title: "שפה", desc: "בחר את שפת התצוגה של המערכת", he: "עברית", en: "English" },
      connections: { title: "חיבורים", desc: "נהל אינטגרציות עם שירותים חיצוניים", googleCalendar: "Google Calendar", googleCalendarDesc: "סנכרון הזמנות מכשירים ליומן Google Calendar המשותף של המעבדה.", connected: "מחובר", notConnected: "לא מחובר", checking: "בודק חיבור...", manageNote: "החיבור מנוהל על ידי מנהל המעבדה.", checkBtn: "בדוק חיבור", openBtn: "פתח ב-Google Calendar" }
    }
  },
  en: {
    app: { title: "Advanced Materials Lab", subtitle: "Device management & access control", footer: "Lab Device Management System · All rights reserved" },
    nav: { dashboard: "Dashboard", schedule: "Schedule", admin: "Admin", help: "Help", settings: "Settings" },
    role: { admin: "Lab Admin", researcher: "Approved Researcher", user: "User" },
    common: { logout: "Logout", close: "Close", loading: "Loading...", cancel: "Cancel", refresh: "Refresh", save: "Save" },
    status: { available: "Available", in_use: "In Use", maintenance: "Under Maintenance", pending: "Pending Approval", approved: "Approved", blocked: "Blocked" },
    pending: {
      title: "Registration Received — Pending Approval",
      desc: "Your account has been registered and is awaiting approval from the lab admin. You'll get full access once approved.",
      blockedTitle: "Access Blocked",
      blockedDesc: "The lab admin has blocked your account. Please contact the lab admin for clarification.",
      statusLabel: "Status:"
    },
    session: {
      active: "Active Work Session",
      elapsed: "Elapsed",
      checkout: "Check-out / End Work",
      checkingOut: "Ending...",
      startedAt: "Started at "
    },
    device: {
      title: "Lab Devices",
      subtitle: "Activate a device or reserve in advance",
      requiresTraining: "Training required",
      activate: "Activate Device",
      busy: "In use now",
      notAvailable: "Not available",
      missingCert: "Missing certification",
      finishSessionFirst: "End current session first",
      trainingPrefix: "Training required:"
    },
    toast: {
      activeExists: "An active session already exists. End it before activating another device."
    },
    reserve: {
      title: "Reserve a Device",
      device: "Device",
      start: "Start",
      end: "End",
      purpose: "Purpose (optional)",
      purposePlaceholder: "Brief description of the experiment...",
      create: "Create Reservation",
      creating: "Saving...",
      saved: "Reservation saved",
      syncGoogle: "Sync to Google Calendar",
      syncNote: "The link opens Google Calendar with the reservation details — save it as a personal event.",
      addToCalendar: "Automatically added to the shared lab calendar."
    },
    schedule: {
      title: "Schedule",
      subtitle: "Your reservations & Google Calendar sync",
      noTitle: "No upcoming reservations",
      noDesc: "Go back to the dashboard to reserve a device.",
      googleBtn: "Google Calendar"
    },
    home: {
      myReservations: "My Reservations",
      noReservations: "No upcoming reservations. Reserve a device to start.",
      reserveBtn: "Reserve Device"
    },
    admin: {
      title: "Admin Panel",
      subtitle: "Manage users and device status",
      pending: "Users Pending Approval",
      active: "Active Users",
      devices: "Device Status Management",
      noPending: "No users pending approval.",
      approve: "Approve",
      block: "Block",
      noAccess: "No Access",
      noAccessDesc: "The admin panel is available to lab admins only.",
      stats: { pending: "Pending approval", approved: "Approved users", available: "Available devices", maintenance: "Under maintenance" }
    },
    help: {
      title: "Help & Documentation",
      subtitle: "Everything you need to know about the lab management system",
      overview: { title: "Overview", body: "The system provides full management of lab devices: availability tracking, device activation with active work sessions, advance reservations, certification-based access control, and reservation syncing to Google Calendar. The lab admin approves new users and manages device status." },
      sections: {
        login: { title: "Login & Registration", body: "New users register through the registration screen. After registering, the account awaits approval from the lab admin. Only after approval will you gain access to devices." },
        dashboard: { title: "Dashboard", body: "Displays all lab devices as cards with color-coded status: available (green), in use (yellow), or under maintenance (red). You can activate an available device or reserve one in advance." },
        session: { title: "Active Work Session", body: "Activating a device opens an active session with a live timer. You can hold one session at a time. To finish, click 'Check-out' — the device is released and becomes available." },
        permissions: { title: "Access Control & Certifications", body: "Some devices require training. If you haven't completed training for a device, the activate button is blocked and a notice is shown. The lab admin can add certifications to a user." },
        reservations: { title: "Reservations & Google Calendar", body: "You can reserve a device in advance with date, times, and purpose. Reservations sync automatically to the lab's shared Google Calendar (when connected), and can also be added manually to your personal calendar." },
        admin: { title: "Admin Panel", body: "Available to lab admins only. Allows approving/blocking users, viewing pending users, and changing device status (available/in use/maintenance)." }
      },
      contact: "For further questions, contact the lab admin."
    },
    settings: {
      title: "Settings",
      subtitle: "Manage connections and language",
      language: { title: "Language", desc: "Choose the display language of the system", he: "עברית", en: "English" },
      connections: { title: "Connections", desc: "Manage integrations with external services", googleCalendar: "Google Calendar", googleCalendarDesc: "Sync device reservations to the lab's shared Google Calendar.", connected: "Connected", notConnected: "Not connected", checking: "Checking connection...", manageNote: "Connection is managed by the lab admin.", checkBtn: "Check connection", openBtn: "Open in Google Calendar" }
    }
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("lab_lang") || "he";
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem("lab_lang", l);
  }, []);

  useEffect(() => {
    const dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key) => {
      const parts = key.split(".");
      let val = DICT[lang];
      for (const p of parts) {
        val = val?.[p];
        if (val === undefined) return key;
      }
      return val ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === "he" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: "he", setLang: () => {}, t: (k) => k, dir: "rtl" };
  return ctx;
}