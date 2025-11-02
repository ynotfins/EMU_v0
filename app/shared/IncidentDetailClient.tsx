"use client"

import { useIncident } from "../../hooks/use-incident";
import { useEffect, useMemo } from "react";

export default function IncidentDetailClient({ id }: { id: string }) {
  const { data: incident, isLoading, error } = useIncident(id);
  const addr = useMemo(()=> {
    if (!incident) return "";
    const city = incident.city || "";
    const county = incident.county || "";
    const state = incident.state || "";
    const address = incident.address || "";
    return [address, city, county, state].filter(Boolean).join(", ");
  }, [incident]);

  useEffect(()=>{ if (error) console.error("[IncidentDetail]", error) }, [error]);
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading incident…</div>;
  if (!incident) return <div className="p-6 text-red-600">Incident not found.</div>;

  return (
    <div className="space-y-4 p-4">
      <section className="rounded-2xl border bg-card">
        <div className="p-4 border-b font-medium">Details</div>
        <div className="p-4 space-y-3 text-sm">
          {/* Map top third: use Maps Embed as a no-API fallback, switches to JS API if window.google present */}
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-muted">
            <iframe
              title="map"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(addr || "fire station")}`}
            />
          </div>
          <div><span className="font-semibold">Type:</span> {incident.type || "Unknown"}</div>
          <div><span className="font-semibold">Location:</span> {addr || "—"}</div>
          <div><span className="font-semibold">Message:</span> {incident.message || "—"}</div>
          <div><span className="font-semibold">Updated:</span> {incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : "—"}</div>
        </div>
      </section>
    </div>
  );
}

