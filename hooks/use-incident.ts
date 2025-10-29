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
  updateDoc,
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
          `[useIncident] 🔍 UPDATES DEBUG for ${incidentId}:`,
          `Found ${snapshot.docs.length} update docs`
        );

        // Map and deduplicate updates by timestamp + message
        const seenKeys = new Set();
        const updatesData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const timestamp = data.ts?.toDate?.()?.toISOString() ||
              data.reportedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString();
            
            return {
              id: doc.id,
              message: data.message || "",
              title: data.title || data.stage || "",
              address: data.address || "",
              stage: data.stage || "update",
              ts: timestamp,
              lat: data.lat,
              lng: data.lng,
            };
          })
          .filter((update) => {
            // Create unique key from timestamp + message to catch true duplicates
            const uniqueKey = `${update.ts}|${update.message}|${update.stage}`;
            
            if (seenKeys.has(uniqueKey)) {
              console.log(`[useIncident] ⚠️ Skipping duplicate: ${update.ts} - ${update.message}`);
              return false;
            }
            seenKeys.add(uniqueKey);
            return true;
          });

        console.log(
          `[useIncident] ✅ Processed ${updatesData.length} unique updates (filtered ${snapshot.docs.length - updatesData.length} duplicates):`,
          updatesData.map((u) => ({ id: u.id, messageLength: u.message.length, ts: u.ts }))
        );
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

// Save note to Firestore
export async function addNote(incidentId: string, note: string): Promise<void> {
  console.log("[useIncident] 💾 Saving note:", { incidentId, note });
  
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    const incidentSnap = await getDoc(incidentRef);
    
    if (!incidentSnap.exists()) {
      console.error("[useIncident] ❌ Incident not found:", incidentId);
      return;
    }
    
    const currentNotes = incidentSnap.data().notes || [];
    const newNote = {
      text: note,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || "anonymous",
    };
    
    await updateDoc(incidentRef, {
      notes: [...currentNotes, newNote],
    });
    
    console.log("[useIncident] ✅ Note saved successfully");
  } catch (error) {
    console.error("[useIncident] ❌ Error saving note:", error);
  }
}

export function updateStatus(incidentId: string, status: string): void {
  console.debug("[useIncident] updateStatus:", { incidentId, status });
  // TODO: Update Firestore: incidents/{incidentId} set status field
}
