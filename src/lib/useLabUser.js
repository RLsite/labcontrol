import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// טוען את המשתמש הנוכחי + פרופיל המעבדה שלו.
// משתמש חדש (ללא פרופיל וללא הרשאות מנהל) נוצר אוטומטית בסטטוס "ממתין לאישור".
export function useLabUser() {
  const [state, setState] = useState({ loading: true });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        const isAdmin = user.role === "admin";
        const profiles = await base44.entities.UserProfile.filter({ email: user.email });
        let profile = profiles[0];

        if (!profile && !isAdmin) {
          profile = await base44.entities.UserProfile.create({
            full_name: user.full_name || user.email,
            email: user.email,
            role: "user",
            status: "pending",
            certifications: []
          });
        }
        if (!cancelled) setState({ loading: false, user, isAdmin, profile });
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e });
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  return { ...state, reload };
}