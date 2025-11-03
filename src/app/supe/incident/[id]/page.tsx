import { use } from "react"
import Client from "./page.client"

type Params = { id: string }

export default function Page(p: { params: Promise<Params> }) {
  const { id } = use(p.params)
  return <Client id={id} />
}
