"use client"

import { useParams } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import IncidentDetailClient from "@/app/shared/IncidentDetailClient"

export default function SupeIncidentDetailPage() {
  const params = useParams()
  const incidentId = params.id as string

  return (
    <RoleLayout role="supe">
      <IncidentDetailClient incidentId={incidentId} userRole="supe" />
    </RoleLayout>
  )
}
