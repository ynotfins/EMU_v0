"use client";

import { IncidentDetailPage } from "@/components/features/incident-detail-page";

export default function Client({ id }: { id: string }) {
  return <IncidentDetailPage id={id} role="chaser" />;
}
