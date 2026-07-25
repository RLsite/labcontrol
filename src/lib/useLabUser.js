import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Aestro user context: resolves role + lab.
// main_admin = platform admin (Base44 User.role === 'admin').
// others need a UserProfile with role + lab_id.
export function useLabUser() {
  const [state, setState] = useState({ loading: true });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        const isMainAdmin = user.role === "admin";
        const profiles = await base44.entities.UserProfile.filter({ email: user.email });
        let profile = profiles[0];

        if (!profile && !isMainAdmin) {
          profile = await base44.entities.UserProfile.create({
            full_name: user.full_name || user.email,
            email: user.email,
            role: "user",
            status: "pending",
            certifications: []
          });
        }

        let lab = null;
        if (profile?.lab_id) {
          try { lab = await base44.entities.Lab.get(profile.lab_id); } catch { lab = null; }
        }

        const role = isMainAdmin ? "main_admin" : (profile?.role || "user");
        if (!cancelled) setState({ loading: false, user, isMainAdmin, role, profile, lab });
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e });
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  return { ...state, reload };
}