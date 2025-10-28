"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { getUid } from "@/lib/dev";
import type { IncidentLite } from "@/types/domain";
import { useFavoritesContext } from "@/lib/context/favorites-context";

// Normalize inconsistent Firestore data into IncidentLite type
function normalize(docId: string, data: any): IncidentLite {
  // Handle timestamp variations - try multiple fields and handle Firestore Timestamp objects
  let updatedAt =
    data.updatedAt ||
    data.lastSeenAt ||
    data.lastTs ||
    data.timestamp ||
    data.ts ||
    new Date().toISOString();
  if (typeof updatedAt === "object" && updatedAt.seconds) {
    updatedAt = new Date(updatedAt.seconds * 1000).toISOString();
  }

  const state = data.state || "";
  const county = data.county || "";
  const city = data.city || "";
  const address = data.address || data.addr || data.street || "";
  const type = data.type || data.lastType || data.alertType || "Unknown";
  const message = data.message || data.lastMessage || data.alertMessage || "";

  return {
    id: docId,
    incidentNumber:
      data.incidentNumber || data.incidentId || parseInt(docId) || 0,
    updatedAt,
    state,
    county,
    city,
    address,
    type,
    message,
    highAlert: data.highAlert || false,
    isFavorited: false, // Will be computed by withUserFlags()
    isBookmarked: false, // Will be computed by withUserFlags()
    isSilenced: data.isSilenced || false,
    distanceMi: data.distanceMi,
    updates: data.updates || [],
    // Store raw arrays for favorite/bookmark logic
    favoritedBy: data.favoritedBy || [],
    bookmarkedBy: data.bookmarkedBy || [],
  };
}

/**
 * Format incident list lines for consistent mobile display
 * Returns standardized strings for the 3-line layout
 */
export function formatListLines(incident: IncidentLite) {
  const line1Date = new Date(incident.updatedAt);
  const dateStr = line1Date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = line1Date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const distance =
    incident.distanceMi != null ? `${Math.round(incident.distanceMi)} mi` : "";
  const header = `${dateStr} ${timeStr}`;
  const metaRight = distance ? ` · ${distance}` : "";
  const l1 = `${header}${metaRight}`;

  const l2Left =
    `${incident.state} | ${incident.county} | ${incident.city} | ${incident.address}`.replace(
      /\s+\|\s+\|/g,
      " |"
    );
  const l2 = l2Left;

  const l3 = `${incident.type} | ${incident.message}`.replace(
    /\s+\|\s+\|/g,
    " |"
  );

  return { l1, l2, l3 };
}

/**
 * Derive per-user flags (isFavorited, isBookmarked) based on current user
 * This is the single source of truth for computing user-specific flags
 */
function withUserFlags(incident: IncidentLite): IncidentLite {
  const uid = auth.currentUser?.uid;
  return {
    ...incident,
    isFavorited: uid ? (incident.favoritedBy ?? []).includes(uid) : false,
    isBookmarked: uid ? (incident.bookmarkedBy ?? []).includes(uid) : false,
  };
}

export interface IncidentFilters {
  distanceMi?: number;
  types: string[];
  keyword: string;
  highAlertOnly: boolean;
  minUpdates?: number;
  showSilenced?: boolean;
}

export function useIncidents(filters?: Partial<IncidentFilters>) {
  const [incidents, setIncidents] = useState<IncidentLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { silenced } = useFavoritesContext();

  // Real-time Firestore listener
  useEffect(() => {
    const incidentsRef = collection(db, "incidents");
    const q = query(incidentsRef, orderBy("updatedAt", "desc"), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Normalize Firestore data and apply per-user flags
        const data = snapshot.docs
          .map((doc) => withUserFlags(normalize(doc.id, doc.data())))
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        setIncidents(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useIncidents] Firestore error:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Client-side filtering
  const data = useMemo<IncidentLite[]>(() => {
    let filtered = incidents;

    if (!filters) return filtered;

    if (!filters.showSilenced) {
      filtered = filtered.filter((inc) => !silenced.has(inc.id));
    }

    if (filters.distanceMi !== undefined) {
      filtered = filtered.filter(
        (inc) =>
          inc.distanceMi !== undefined && inc.distanceMi <= filters.distanceMi!
      );
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((inc) => filters.types!.includes(inc.type));
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.address.toLowerCase().includes(keyword) ||
          inc.type.toLowerCase().includes(keyword) ||
          inc.message.toLowerCase().includes(keyword)
      );
    }

    if (filters.highAlertOnly) {
      filtered = filtered.filter((inc) => inc.highAlert);
    }

    if (filters.minUpdates !== undefined) {
      filtered = filtered.filter(
        (inc) => inc.updates && inc.updates.length >= filters.minUpdates!
      );
    }

    return filtered;
  }, [incidents, silenced, filters]);

  return { data, isLoading, error };
}

// Firestore actions for favorites and bookmarks
export async function toggleFavorite(incidentId: string): Promise<void> {
  const userId = getUid(auth.currentUser?.uid);
  if (!userId) {
    console.warn("[toggleFavorite] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      favoritedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error("[toggleFavorite] Error:", error);
  }
}

export async function unfavorite(incidentId: string): Promise<void> {
  const userId = getUid(auth.currentUser?.uid);
  if (!userId) {
    console.warn("[unfavorite] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      favoritedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error("[unfavorite] Error:", error);
  }
}

export async function toggleBookmark(incidentId: string): Promise<void> {
  const userId = getUid(auth.currentUser?.uid);
  if (!userId) {
    console.warn("[toggleBookmark] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error("[toggleBookmark] Error:", error);
  }
}

export async function unbookmark(incidentId: string): Promise<void> {
  const userId = getUid(auth.currentUser?.uid);
  if (!userId) {
    console.warn("[unbookmark] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayRemove(userId),
    });
  } catch (error) {
    console.error("[unbookmark] Error:", error);
  }
}

// Action stubs - ready for Firebase implementation
export function respondToAlert(incidentId: string): void {
  console.debug("[useIncidents] respondToAlert:", incidentId);
  // TODO: Update Firestore: incidents/{incidentId} set status='responding', assignedTo=currentUserId
}
