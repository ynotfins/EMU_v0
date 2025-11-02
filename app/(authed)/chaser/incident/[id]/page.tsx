import { use } from "react";

import IncidentDetailClient from "../../../../shared/IncidentDetailClient";

type Params = { id: string };

export default function Page(p: { params: Promise<Params> }) {

  const { id } = use(p.params);

  return <IncidentDetailClient id={id} />;

}

