"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { logError } from "@/lib/utils/logger";
import { logger } from "@/lib/utils/logger";
import type { Incident } from "@/types/extended-domain";
import { getUid } from "@/lib/utils/dev";

// NYC Borough to County mapping
const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
};

interface IncidentUpdate {
  id: string;
  message: string;
  title: string;
  address: string;
  stage: string;
  ts: string;
  lat?: number;
  lng?: number;
}

export function useIncident(incidentId: string) {
  const [data, setData] = useState<Incident | undefined>();
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(!incidentId ? false : true);
  const [error, setError] = useState<string | undefined>(!incidentId ? "missing-id" : undefined);

  useEffect(() => {
    if (!incidentId) {
      // Early return if no incident ID - state already set above
      return;
    }

    logger.debug(`Loading incident and updates subcollection: "${incidentId}"`, {
      code: 'useIncident',
      incidentId,
    });

    // Load the incident document
    const incidentDocRef = doc(db, "incidents", incidentId);

    // Load updates from subcollection (Cloud Function stores updates here!)
    const updatesCollectionRef = collection(
      db,
      "incidents",
      incidentId,
      "updates"
    );
    const updatesQuery = query(
      updatesCollectionRef,
      orderBy("ts", "desc"),
      limit(50) // Limit updates to prevent high costs
    );

    // Subscribe to incident document
    const unsubIncident = onSnapshot(
      incidentDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          logger.error(`Document "${incidentId}" does not exist`, undefined, {
            code: 'useIncident',
            incidentId,
          });
          setError("not-found");
          setData(undefined);
          setIsLoading(false);
          return;
        }

        const latestData = docSnap.data();
        logger.debug(`Loaded incident`, {
          code: 'useIncident',
          incidentId,
          lastType: latestData.lastType,
          updateCount: latestData.updateCount,
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
        } as Incident);

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
        logger.debug(`Found ${snapshot.docs.length} update docs`, {
          code: 'useIncident',
          incidentId,
          updateCount: snapshot.docs.length,
        });

        // Map and AGGRESSIVELY deduplicate updates by message content
        const seenMessages = new Map<string, IncidentUpdate>();
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
            // AGGRESSIVE deduplication: Use only MESSAGE as key (ignoring tiny timestamp diffs)
            // Normalize message: trim, lowercase, remove extra whitespace
            const normalizedMsg = update.message.trim().toLowerCase().replace(/\s+/g, ' ');
            
            if (seenMessages.has(normalizedMsg)) {
              const existing = seenMessages.get(normalizedMsg);
              logger.debug(`Skipping duplicate message`, {
                code: 'useIncident',
                duplicate: update.ts.substring(0, 19),
                original: existing.ts.substring(0, 19),
              });
              return false;
            }
            
            seenMessages.set(normalizedMsg, update);
            return true;
          });

        logger.debug(`Processed ${updatesData.length} unique updates`, {
          code: 'useIncident',
          incidentId,
          uniqueCount: updatesData.length,
          filteredCount: snapshot.docs.length - updatesData.length,
        });
        setUpdates(updatesData);
      },
      (e) => {
        logger.error(`Error loading updates`, e, {
          code: 'useIncident',
          incidentId,
        });
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
  logger.debug("Saving note", {
    code: 'useIncident',
    incidentId,
    noteLength: note.length,
  });
  
  try {
    const incidentRef = doc(db, "incidents", incidentId);
    const incidentSnap = await getDoc(incidentRef);
    
    if (!incidentSnap.exists()) {
      logger.error("Incident not found", undefined, {
        code: 'useIncident',
        incidentId,
      });
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
    
    logger.info("Note saved successfully", {
      code: 'useIncident',
      incidentId,
    });
  } catch (error) {
    logger.error("Error saving note", error, {
      code: 'useIncident',
      incidentId,
    });
  }
}

export function updateStatus(incidentId: string, status: string): void {
  logger.debug("updateStatus", {
    code: 'useIncident',
    incidentId,
    status,
  });
  // TODO: Update Firestore: incidents/{incidentId} set status field
}
