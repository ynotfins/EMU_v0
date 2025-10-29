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

    console.log(
      `[useIncident] Querying for incidentId: "${incidentId}" (type: ${typeof incidentId})`
    );

    // Query ALL documents with this incidentId
    const incidentsRef = collection(db, "incidents");

    // Keep as STRING - Firebase stores incidentId as string
    console.log(`[useIncident] Querying with string: "${incidentId}"`);

    const q = query(
      incidentsRef,
      where("incidentId", "==", incidentId),
      orderBy("lastSeenAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          `[useIncident] Query returned ${snapshot.docs.length} documents for incidentId: "${incidentId}"`
        );
        
        // DEBUG: Show what fields exist in ALL documents
        console.log(`[useIncident] 🔍 SAMPLE DOCUMENT FIELDS (first 3 docs):`, 
          snapshot.docs.slice(0, 3).map((doc, i) => ({
            docIndex: i,
            docId: doc.id,
            incidentId: doc.data().incidentId,
            incidentNumber: doc.data().incidentNumber,
            typeof_incidentId: typeof doc.data().incidentId,
            allFieldNames: Object.keys(doc.data()),
          }))
        );

        if (snapshot.empty) {
          console.error(
            `[useIncident] ❌ No documents found for incidentId: "${incidentId}" (tried as STRING)`
          );
          console.error(
            `[useIncident] 🔍 DEBUG: Let me check if it exists with different type...`
          );

          // Try as number as fallback
          const incidentIdNum = parseInt(incidentId, 10);
          const qNum = query(
            incidentsRef,
            where("incidentId", "==", incidentIdNum),
            orderBy("lastSeenAt", "desc")
          );

          const unsubNum = onSnapshot(qNum, (snapshotNum) => {
            console.log(
              `[useIncident] 🔍 Tried as NUMBER: ${incidentIdNum}, found ${snapshotNum.docs.length} documents`
            );
            if (!snapshotNum.empty) {
              console.error(
                `[useIncident] ⚠️ FOUND AS NUMBER! Firebase stores incidentId as NUMBER, not STRING!`
              );
            }
            unsubNum();
          });

          setError("not-found");
          setData(undefined);
          setUpdates([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(false);

        // The first document has the most recent info
        const latestDoc = snapshot.docs[0];
        const latestData = latestDoc.data();
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
