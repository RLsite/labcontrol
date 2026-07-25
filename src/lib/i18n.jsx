import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Aestro i18n — English default, Hebrew available
const DICT = {
  en: {
    app: { title: "Aestro Lab", subtitle: "Device management & access control", footer: "Aestro Lab Management System · All rights reserved" },
    nav: { dashboard: "Dashboard", calendar: "Lab Calendar", manage: "Manage", help: "Help", settings: "Settings", labs: "Labs" },
    role: { mainAdmin: "Main Admin", labAdmin: "Lab Admin", seniorUser: "Senior User", user: "User", unknown: "User" },
    common: { logout: "Logout", close: "Close", loading: "Loading...", cancel: "Cancel", refresh: "Refresh", save: "Save", create: "Create", back: "Back" },
    status: { available: "Available", in_use: "In Use", maintenance: "Under Maintenance", pending: "Pending", approved: "Approved", blocked: "Blocked" },
    pending: {
      title: "Registration Received — Pending Approval",
      desc: "Your account is awaiting approval. A lab admin will assign you to a lab and grant access.",
      blockedTitle: "Access Blocked",
      blockedDesc: "Your account has been blocked. Please contact the lab admin.",
      statusLabel: "Status:"
    },
    session: { active: "Active Work Session", elapsed: "Elapsed", checkout: "Check-out", checkingOut: "Ending...", startedAt: "Started at " },
    device: { title: "Lab Devices", subtitle: "Activate a device or reserve in advance", requiresTraining: "Training required", activate: "Activate", busy: "In use", notAvailable: "Not available", missingCert: "Certification required", finishSessionFirst: "End current session first", trainingPrefix: "Training required:" },
    toast: { activeExists: "An active session already exists. End it before activating another device." },
    reserve: { title: "Reserve a Device", device: "Device", start: "Start", end: "End", purpose: "Purpose (optional)", purposePlaceholder: "Brief description of the experiment...", create: "Create Reservation", creating: "Saving...", saved: "Reservation saved", syncGoogle: "Add to Google Calendar", syncOutlook: "Add to Outlook Calendar", viewLocal: "View in local calendar", syncNote: "Add this reservation to your external calendar via a direct link." },
    home: { welcome: "Welcome back", yourLab: "Your Lab", allLabs: "All Labs", reserveBtn: "Reserve", myReservations: "My Reservations", noReservations: "No reservations yet. Reserve a device to start." },
    lab: { title: "Labs", overview: "Labs Overview", overviewSub: "Manage all labs in the system", createLab: "Create Lab", labName: "Lab name", description: "Description", location: "Location", create: "Create Lab", noLabs: "No labs yet", noLabsDesc: "Create your first lab to get started.", members: "Members", devices: "Devices", calendar: "Calendar", localCalendar: "Local Calendar", labCalendar: "Lab Calendar", labCalendarSub: "Reservations for this lab", selectLab: "Select a lab", noLab: "Not assigned to a lab", open: "Open", totalDevices: "devices", activeNow: "active now" },
    manage: { title: "Management", subtitle: "Manage users, devices and labs", pending: "Pending Approval", users: "Users", devices: "Device Status", labs: "Labs", noPending: "No users pending approval.", approve: "Approve", block: "Block", assignLab: "Assign lab", assignRole: "Role", noAccess: "No Access", noAccessDesc: "Management is available to admins only.", unassigned: "Unassigned", role: "Role", save: "Save" },
    admin: { stats: { pending: "Pending", approved: "Approved users", available: "Available devices", maintenance: "Under maintenance", labs: "Labs" } },
    help: { title: "Help & Documentation", subtitle: "Everything you need to know about Aestro Lab", overview: { title: "Overview", body: "Aestro Lab is a multi-lab device management system. Each lab has its own devices, members and a local calendar. Main Admin oversees all labs; Lab Admins run their lab; Senior Users get broad device access; Users need per-device certification." }, sections: { roles: { title: "Roles & Permissions", body: "Main Admin: full control over all labs, users and devices. Lab Admin: manages their lab's devices, members and approvals. Senior User: can use any device in their lab without training. User: needs certification for trained devices." }, login: { title: "Login & Registration", body: "New users register and await approval. A Lab Admin or Main Admin assigns them to a lab and a role, then approves access." }, dashboard: { title: "Dashboard", body: "Shows your lab's devices with live status: available, in use, or under maintenance. Activate a device to start a session." }, session: { title: "Active Session", body: "Activating a device opens a timed session. One session at a time. Click Check-out to release the device." }, permissions: { title: "Access Control", body: "Devices requiring training block activation for uncertified users. Lab admins can grant certifications." }, reservations: { title: "Reservations & Calendar", body: "Each lab has a local calendar of reservations. Reserve a device in advance and optionally sync to Google Calendar." } }, contact: "For further questions, contact your lab admin." },
    settings: { title: "Settings", subtitle: "Manage connections and language", language: { title: "Language", desc: "Choose the display language", he: "עברית", en: "English" }, connections: { title: "Calendars", desc: "Choose where reservations appear", localCalendar: "Aestro Local Calendar", localCalendarDesc: "The built-in calendar for each lab. Always active — no setup needed.", googleCalendar: "Google Calendar", googleCalendarDesc: "Add reservations to Google Calendar via direct links.", outlookCalendar: "Outlook Calendar", outlookCalendarDesc: "Add reservations to Outlook Calendar via direct links.", active: "Active", available: "Available", openBtn: "Open", viewBtn: "View", manageNote: "When no external calendar is connected, the Aestro local calendar is used. Each lab has its own local calendar." } }
  },
  he: {
    app: { title: "Aestro Lab", subtitle: "ניהול מכשירים ובקרת גישה", footer: "מערכת Aestro לניהול מעבדה · כל הזכויות שמורות" },
    nav: { dashboard: "לוח בקרה", calendar: "יומן מעבדה", manage: "ניהול", help: "עזרה", settings: "הגדרות", labs: "מעבדות" },
    role: { mainAdmin: "מנהל ראשי", labAdmin: "מנהל מעבדה", seniorUser: "משתמש בכיר", user: "משתמש", unknown: "משתמש" },
    common: { logout: "התנתק", close: "סגור", loading: "טוען...", cancel: "ביטול", refresh: "רענן", save: "שמור", create: "צור", back: "חזור" },
    status: { available: "פנוי", in_use: "בשימוש", maintenance: "בבדיקה", pending: "ממתין", approved: "מאושר", blocked: "חסום" },
    pending: { title: "ההרשמה התקבלה — ממתין לאישור", desc: "חשבונך ממתין לאישור. מנהל מעבדה ישייך אותך למעבדה ויעניק גישה.", blockedTitle: "הגישה נחסמה", blockedDesc: "חשבונך נחסם. צור קשר עם מנהל המעבדה.", statusLabel: "סטטוס:" },
    session: { active: "סשן עבודה פעיל", elapsed: "זמן שחלף", checkout: "סיום עבודה", checkingOut: "מסיים...", startedAt: "התחיל ב-" },
    device: { title: "מכשירי המעבדה", subtitle: "הפעל מכשיר או הזמן מראש", requiresTraining: "נדרשת הדרכה", activate: "הפעל", busy: "בשימוש", notAvailable: "לא זמין", missingCert: "נדרשת הסמכה", finishSessionFirst: "סיים סשן נוכחי", trainingPrefix: "נדרשת הדרכה:" },
    toast: { activeExists: "יש סשן פעיל. סיים אותו לפני הפעלת מכשיר נוסף." },
    reserve: { title: "הזמן מכשיר", device: "מכשיר", start: "התחלה", end: "סיום", purpose: "מטרה (לא חובה)", purposePlaceholder: "תיאור קצר...", create: "צור הזמנה", creating: "שומר...", saved: "ההזמנה נשמרה", syncGoogle: "הוסף ל-Google Calendar", syncOutlook: "הוסף ל-Outlook Calendar", viewLocal: "צפה ביומן המקומי", syncNote: "הוסף הזמנה זו ליומן החיצוני שלך בקישור ישיר." },
    home: { welcome: "ברוך שובך", yourLab: "המעבדה שלך", allLabs: "כל המעבדות", reserveBtn: "הזמן", myReservations: "ההזמנות שלי", noReservations: "אין הזמנות. הזמן מכשיר כדי להתחיל." },
    lab: { title: "מעבדות", overview: "סקירת מעבדות", overviewSub: "נהל את כל המעבדות במערכת", createLab: "צור מעבדה", labName: "שם מעבדה", description: "תיאור", location: "מיקום", create: "צור מעבדה", noLabs: "אין מעבדות", noLabsDesc: "צור את המעבדה הראשונה.", members: "חברים", devices: "מכשירים", calendar: "יומן", localCalendar: "יומן מקומי", labCalendar: "יומן מעבדה", labCalendarSub: "הזמנות למעבדה זו", selectLab: "בחר מעבדה", noLab: "לא משויך למעבדה", open: "פתח", totalDevices: "מכשירים", activeNow: "פעילים כעת" },
    manage: { title: "ניהול", subtitle: "נהל משתמשים, מכשירים ומעבדות", pending: "ממתינים לאישור", users: "משתמשים", devices: "סטטוס מכשירים", labs: "מעבדות", noPending: "אין משתמשים הממתינים לאישור.", approve: "אשר", block: "חסום", assignLab: "שייך למעבדה", assignRole: "תפקיד", noAccess: "אין הרשאה", noAccessDesc: "הניהול זמין למנהלים בלבד.", unassigned: "לא משויך", role: "תפקיד", save: "שמור" },
    admin: { stats: { pending: "ממתינים", approved: "משתמשים מאושרים", available: "מכשירים פנויים", maintenance: "בבדיקה", labs: "מעבדות" } },
    help: { title: "עזרה ותיעוד", subtitle: "כל מה שצריך לדעת על Aestro Lab", overview: { title: "סקירה", body: "Aestro Lab היא מערכת ניהול מכשירים רב-מעבדתית. לכל מעבדה מכשירים, חברים ויומן מקומי משלה. מנהל ראשי מפקח על הכל; מנהלי מעבדה מנהלים את המעבדה; משתמשים בכירים מקבלים גישה רחבה; משתמשים זקוקים להסמכה למכשיר." }, sections: { roles: { title: "תפקידים והרשאות", body: "מנהל ראשי: שליטה מלאה. מנהל מעבדה: מנהל מכשירים, חברים ואישורים במעבדה. משתמש בכיר: יכול להפעיל כל מכשיר ללא הדרכה. משתמש: זקוק להסמכה למכשירים מודרכים." }, login: { title: "כניסה והרשמה", body: "משתמשים חדשים נרשמים וממתינים לאישור. מנהל מעבדה או מנהל ראשי משייך אותם למעבדה ולתפקיד ומאשר גישה." }, dashboard: { title: "לוח בקרה", body: "מציג את מכשירי המעבדה עם סטטוס חי: פנוי, בשימוש, או בבדיקה." }, session: { title: "סשן פעיל", body: "הפעלת מכשיר פותחת סשן מתוזמן. סשן אחד בכל פעם. לחץ סיום כדי לשחרר." }, permissions: { title: "בקרת גישה", body: "מכשירים הדורשים הדרכה חוסמים הפעלה למשתמשים ללא הסמכה. מנהל מעבדה יכול להעניק הסמכות." }, reservations: { title: "הזמנות ויומן", body: "לכל מעבדה יומן מקומי של הזמנות. ניתן להזמין מראש ולסנכרן ל-Google Calendar." } }, contact: "לשאלות נוספות, פנה למנהל המעבדה." },
    settings: { title: "הגדרות", subtitle: "נהל חיבורים ושפה", language: { title: "שפה", desc: "בחר את שפת התצוגה", he: "עברית", en: "English" }, connections: { title: "יומנים", desc: "בחר היכן יופיעו ההזמנות", localCalendar: "היומן המקומי Aestro", localCalendarDesc: "היומן המובנה לכל מעבדה. פעיל תמיד — ללא הגדרה.", googleCalendar: "Google Calendar", googleCalendarDesc: "הוספת הזמנות ל-Google Calendar בקישורים ישירים.", outlookCalendar: "Outlook Calendar", outlookCalendarDesc: "הוספת הזמנות ל-Outlook Calendar בקישורים ישירים.", active: "פעיל", available: "זמין", openBtn: "פתח", viewBtn: "צפה", manageNote: "כשאין יומן חיצוני מחובר, נעשה שימוש ביומן המקומי של Aestro. לכל מעבדה יומן מקומי משלה." } }
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("aestro_lang") || "en");
  const setLang = useCallback((l) => { setLangState(l); localStorage.setItem("aestro_lang", l); }, []);
  useEffect(() => {
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);
  const t = useCallback((key) => {
    const parts = key.split(".");
    let val = DICT[lang];
    for (const p of parts) { val = val?.[p]; if (val === undefined) return key; }
    return val ?? key;
  }, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === "he" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: "en", setLang: () => {}, t: (k) => k, dir: "ltr" };
  return ctx;
}