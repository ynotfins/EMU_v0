"use client";

import { IncidentDetailTabs } from "@/components/incident-detail-tabs";

interface IncidentDetailClientProps {
  incidentId: string;
  userRole: "chaser" | "supe" | "admin" | "super_admin";
}

export default function IncidentDetailClient({ incidentId, userRole }: IncidentDetailClientProps) {
  return <IncidentDetailTabs incidentId={incidentId} userRole={userRole} />;
}
