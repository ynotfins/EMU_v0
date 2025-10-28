import { use } from "react"
import SupeIncidentClient from "./page.client"

type Params = { id: string }

export default function Page(props: { params: Promise<Params> }) {
  const { id } = use(props.params)
  return <SupeIncidentClient id={id} />
}
