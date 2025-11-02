"use client";

import { useIncident } from "@/hooks/use-incident";

import { useEffect, useMemo } from "react";

import { LiveMap } from "@/components/live-map";

export default function IncidentDetailClient({ id }: { id: string }) {

  const { data: incident, isLoading, error } = useIncident(id);

  useEffect(()=>{ if (error) console.error("[IncidentDetail]", error) }, [error]);

  const addr = useMemo(() => {

    if (!incident) return "";

    return [incident.address, incident.city, incident.county, incident.state].filter(Boolean).join(", ");

  }, [incident]);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading incident…</div>;

  if (error)     return <div className="p-6 text-sm text-destructive">Error loading incident.</div>;

  if (!incident) return <div className="p-6 text-sm">Not found.</div>;

  return (

    <div className="p-4 space-y-4">

      <div>

        <h1 className="text-2xl font-bold">Incident #{incident.incidentNumber || id}</h1>

        <p className="text-muted-foreground">{addr}</p>

      </div>

      <div className="rounded-xl border">

        <LiveMap markers={(typeof incident.lat === "number" && typeof incident.lng === "number")

          ? [{ uid: id, name: incident.type || "Alert", lat: incident.lat, lng: incident.lng }]

          : []} />

      </div>

      <div className="rounded-xl border p-4">

        <h2 className="font-semibold mb-2">Details</h2>

        <div className="space-y-2 text-sm">

          <div><span className="font-medium">Type:</span> {incident.type || "Unknown"}</div>

          <div><span className="font-medium">Location:</span> {addr || "—"}</div>

          <div><span className="font-medium">Message:</span> {incident.message || "—"}</div>

          <div><span className="font-medium">Updated:</span> {incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : "—"}</div>

        </div>

      </div>

      {Array.isArray(incident.updates) && incident.updates.length > 0 && (

        <div className="rounded-xl border">

          <div className="p-4 pb-0 font-semibold">Updates</div>

          <ul className="p-4 pt-2 space-y-2 text-sm">

            {incident.updates.map((u, i) => (

              <li key={i} className="border rounded-md p-2">

                <div className="text-xs text-muted-foreground">{u?.ts ? new Date(u.ts).toLocaleString() : ""}</div>

                <div>{u?.message || ""}</div>

              </li>

            ))}

          </ul>

        </div>

      )}

    </div>

  );

}
