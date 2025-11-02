import { use } from "react";
import IncidentDetailClient from "../../../shared/IncidentDetailClient";

export default function Page({ params }: { params: Promise<{id:string}> }) {
  const { id } = use(params);
  return <IncidentDetailClient id={id} />;
}
