import { use } from "react"
// Import the client component - it dynamically handles both roles
import Client from "../../chaser/incident/[id]/page.client"

type Params = { id: string }

/**
 * Shared Incident Detail Page
 * 
 * This route is accessible by both chaser and supe roles.
 * The Client component uses RoleLayout to handle role-specific UI.
 */
export default function SharedIncidentPage(p: { params: Promise<Params> }) {
  const { id } = use(p.params)
  return <Client id={id} />
}

