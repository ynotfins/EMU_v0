"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { logError } from "@/lib/logger";
import type { Incident } from "@/types/domain";

export function useIncident(incidentId: string) {
  const [data, setData] = useState<Incident | undefined>();
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!incidentId) {
      setError("missing-id");
      setIsLoading(false);
      return;
    }

    // Query ALL documents with this incidentId
    const incidentsRef = collection(db, "incidents");
    const q = query(
      incidentsRef,
      where("incidentId", "==", incidentId),
      orderBy("lastSeenAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setIsLoading(false);

        if (snapshot.empty) {
          setError("not-found");
          setData(undefined);
          setUpdates([]);
          return;
        }

        // The first document has the most recent info
        const latestDoc = snapshot.docs[0];
        const latestData = latestDoc.data();

        // Parse updatesText to extract individual updates
        const updatesText = latestData.updatesText || "";
        const parsedUpdates = updatesText
          .split("•")
          .map((u: string) => u.trim())
          .filter((u: string) => u.length > 0)
          .map((text: string, index: number) => ({
            ts: new Date(Date.now() - index * 60000).toISOString(), // Fake timestamps
            message: text,
          }));

        setError(undefined);
        setData({
          id: incidentId,
          incidentNumber: parseInt(incidentId) || 0,
          type: latestData.lastType || latestData.type || "Unknown",
          message: latestData.lastMessage || latestData.message || "",
          address: latestData.address || "",
          city: latestData.city || "",
          county: latestData.county || "",
          state: latestData.state || "",
          updatedAt:
            latestData.lastSeenAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          updates: parsedUpdates,
          updateCount: latestData.updateCount || parsedUpdates.length,
          notes: latestData.notes || [],
        } as any);

        setUpdates(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp:
              doc.data().lastSeenAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          }))
        );
      },
      (e) => {
        setIsLoading(false);
        setError(logError(e, "incident-snapshot", { incidentId }).code);
      }
    );

    return () => unsub();
  }, [incidentId]);

  return { data, updates, isLoading, error };
}

// Action stubs - ready for Firebase implementation
export function addNote(incidentId: string, note: string): void {
  console.debug("[useIncident] addNote:", { incidentId, note });
  // TODO: Update Firestore: incidents/{incidentId} append to notes field
}

export function updateStatus(incidentId: string, status: string): void {
  console.debug("[useIncident] updateStatus:", { incidentId, status });
  // TODO: Update Firestore: incidents/{incidentId} set status field
}
