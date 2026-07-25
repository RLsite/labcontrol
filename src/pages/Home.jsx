import React from "react";
import { useLabUser } from "@/lib/useLabUser";
import { useLang } from "@/lib/i18n";
import Layout from "@/components/lab/Layout";
import LabsOverview from "@/pages/LabsOverview";
import LabDashboard from "@/pages/LabDashboard";
import PendingApproval from "@/components/lab/PendingApproval";

// Role router: main_admin → labs overview; lab members → lab dashboard; pending/blocked → approval screen.
export default function Home() {
  const labUser = useLabUser();
  const { t } = useLang();

  if (labUser.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { user, isMainAdmin, role, profile, lab } = labUser;

  if (isMainAdmin) {
    return (
      <Layout user={user} role={role} lab={lab}>
        <LabsOverview labUser={labUser} />
      </Layout>
    );
  }

  const blocked = profile?.status === "blocked";
  const pending = !profile || profile.status === "pending";

  if (pending || blocked) {
    return (
      <Layout user={user} role={role} lab={lab}>
        <PendingApproval profile={profile} />
      </Layout>
    );
  }

  return (
    <Layout user={user} role={role} lab={lab}>
      <LabDashboard labUser={labUser} />
    </Layout>
  );
}