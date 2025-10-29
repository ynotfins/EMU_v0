"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
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

    console.log(`[useIncident] Loading document by ID: "${incidentId}"`);

    // NEW STRATEGY: Just load the single document directly by ID
    // (BNN data is inconsistent - some docs have firestoreDocId field, some don't)
    // Each alert is its own document, so we can just fetch it directly
    const directDocRef = doc(db, "incidents", incidentId);
    
    const unsub = onSnapshot(
      directDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          console.error(`[useIncident] ❌ Document "${incidentId}" does not exist`);
          setError("not-found");
          setData(undefined);
          setUpdates([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        const latestData = docSnap.data();
        console.log(`[useIncident] Latest data:`, {
          incidentId,
          lastType: latestData.lastType,
          lastMessage: latestData.lastMessage,
          updatesText: latestData.updatesText?.substring(0, 100),
          updateCount: latestData.updateCount,
        });

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

        // Since we're loading a single document, updates come from the parsedUpdates
        setUpdates(parsedUpdates as any);
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
