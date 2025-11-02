"use client";

import { useIncident } from "@/hooks/use-incident";
import { useEffect, useMemo } from "react";
import { MapCard } from "@/components/map-card"; // existing map card used by chaser
import { UpdatesList } from "@/components/updates-list"; // existing updates list
import { toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents";
import { useRouter } from "next/navigation";

export default function IncidentDetailClient({ id }: { id: string }) {
  const { data: incident, isLoading, error, updates } = useIncident(id);
  const router = useRouter();

  useEffect(() => { if (error) console.error("[IncidentDetail]", error); }, [error]);

  const addr = useMemo(() => {
    if (!incident) return "";
    const parts = [incident.address, incident.city, incident.county, incident.state].filter(Boolean);
    return parts.join(", ");
  }, [incident]);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading incident…</div>;
  if (error) return <div className="p-6 text-sm text-destructive">Error loading incident.</div>;
  if (!incident) return <div className="p-6 text-sm">Incident not found.</div>;

  const onFav = async () => {
    if (incident.isFavorited) await unfavorite(incident.id);
    else await toggleFavorite(incident.id);
  };
  const onBm = async () => {
    if (incident.isBookmarked) await unbookmark(incident.id);
    else await toggleBookmark(incident.id);
  };

  const handleOpenMaps = () => {
    if (incident.lat && incident.lng) {
      const url = `https://www.google.com/maps?q=${incident.lat},${incident.lng}`;
      window.open(url, '_blank');
    } else if (addr) {
      const url = `https://www.google.com/maps?q=${encodeURIComponent(addr)}`;
      window.open(url, '_blank');
    }
  };

  // Map updates to UpdatesList format
  const updatesRows = (updates || []).map((update: any) => ({
    ts: update.ts || update.timestamp || incident.updatedAt || new Date().toISOString(),
    state: update.state || incident.state || "",
    county: update.county || incident.county || "",
    city: update.city || incident.city || "",
    address: update.address || incident.address || "",
    type: update.type || update.title || incident.type || "Alert",
    message: update.message || "",
    showIncidentId: true,
    incidentNumber: incident.incidentNumber,
  }));

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="h-72 rounded-xl overflow-hidden border">
        <MapCard address={addr} lat={incident.lat} lng={incident.lng} onOpenMaps={handleOpenMaps} />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{incident.type || "Alert"}</h1>
          <p className="text-muted-foreground">{addr}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onFav} className="rounded-full px-3 py-1 border">{incident.isFavorited ? "★" : "☆"}</button>
          <button onClick={onBm} className="rounded-full px-3 py-1 border">🔖</button>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Updates ({updatesRows.length})</h2>
        <UpdatesList rows={updatesRows} />
      </section>
    </div>
  );
}
