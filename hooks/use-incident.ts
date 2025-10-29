"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
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
import { getUid } from "@/lib/dev";

// NYC Borough to County mapping
const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
};

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
      `[useIncident] Loading incident and updates subcollection: "${incidentId}"`
    );

    // Load the incident document
    const incidentDocRef = doc(db, "incidents", incidentId);

    // Load updates from subcollection (Cloud Function stores updates here!)
    const updatesCollectionRef = collection(
      db,
      "incidents",
      incidentId,
      "updates"
    );
    const updatesQuery = query(updatesCollectionRef, orderBy("ts", "desc"));

    // Subscribe to incident document
    const unsubIncident = onSnapshot(
      incidentDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          console.error(
            `[useIncident] ❌ Document "${incidentId}" does not exist`
          );
          setError("not-found");
          setData(undefined);
          setIsLoading(false);
          return;
        }

        const latestData = docSnap.data();
        console.log(`[useIncident] ✅ Loaded incident:`, {
          incidentId,
          lastType: latestData.lastType,
          lastMessage: latestData.lastMessage,
          updateCount: latestData.updateCount,
          stage: latestData.stage,
        });

        // Compute user flags
        const userId = getUid(auth.currentUser?.uid);
        const favoritedBy = latestData.favoritedBy || [];
        const bookmarkedBy = latestData.bookmarkedBy || [];
        const isFavorited = favoritedBy.includes(userId);
        const isBookmarked = bookmarkedBy.includes(userId);

        // Map NYC boroughs to official county names
        const rawCounty = latestData.county || "";
        const county = BOROUGH_TO_COUNTY[rawCounty] || rawCounty;

        setError(undefined);
        setData({
          id: incidentId,
          incidentNumber: parseInt(incidentId) || 0,
          type: latestData.lastType || latestData.type || "Unknown",
          message: latestData.lastMessage || latestData.message || "",
          address: latestData.address || "",
          city: latestData.city || "",
          county,
          state: latestData.state || "",
          updatedAt:
            latestData.lastTs?.toDate?.()?.toISOString() ||
            latestData.lastSeenAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          updates: [], // Will be populated by updates subscription
          updateCount: latestData.updateCount || 0,
          notes: latestData.notes || [],
          isFavorited,
          isBookmarked,
        } as any);

        setIsLoading(false);
      },
      (e) => {
        setIsLoading(false);
        setError(logError(e, "incident-snapshot", { incidentId }).code);
      }
    );

    // Subscribe to updates subcollection
    const unsubUpdates = onSnapshot(
      updatesQuery,
      (snapshot) => {
        console.log(
          `[useIncident] ✅ Loaded ${snapshot.docs.length} updates from subcollection`
        );

        const updatesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          message: doc.data().message || "",
          title: doc.data().title || "",
          address: doc.data().address || "",
          stage: doc.data().stage || "update",
          ts:
            doc.data().ts?.toDate?.()?.toISOString() ||
            doc.data().reportedAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          lat: doc.data().lat,
          lng: doc.data().lng,
        }));

        setUpdates(updatesData);
      },
      (e) => {
        console.error(`[useIncident] ❌ Error loading updates:`, e);
        logError(e, "updates-snapshot", { incidentId });
      }
    );

    // Cleanup both subscriptions
    return () => {
      unsubIncident();
      unsubUpdates();
    };
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
