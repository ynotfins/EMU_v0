"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
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
    // CRITICAL: Store the actual incidentId field for routing/querying
    incidentId: data.incidentId,
  } as any;
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
  const uid = getUid(auth.currentUser?.uid); // Use getUid() to handle dev fallback
  const favoritedBy = incident.favoritedBy ?? [];
  const bookmarkedBy = incident.bookmarkedBy ?? [];
  const isFavorited = favoritedBy.includes(uid);
  const isBookmarked = bookmarkedBy.includes(uid);
  
  // Only log if it's favorited or bookmarked (reduce noise)
  if (isFavorited || isBookmarked) {
    console.log(`[withUserFlags] ⭐ Incident ${incident.incidentNumber} for uid ${uid}:`, {
      isFavorited,
      isBookmarked,
      favoritedBy: favoritedBy.length > 0 ? favoritedBy : '(empty)',
      bookmarkedBy: bookmarkedBy.length > 0 ? bookmarkedBy : '(empty)'
    });
  }
  
  return {
    ...incident,
    isFavorited,
    isBookmarked,
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
    const q = query(incidentsRef, orderBy("updatedAt", "desc"), limit(500));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Group by incidentId and keep only the most recent for each
        const groupedMap = new Map<string, any>();

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const incidentId = data.incidentId || doc.id;
          const existing = groupedMap.get(incidentId);

          if (
            !existing ||
            (data.lastSeenAt?.seconds || 0) >
              (existing.lastSeenAt?.seconds || 0)
          ) {
            groupedMap.set(incidentId, { ...data, firestoreDocId: doc.id });
          }
        });

        // Convert to array, normalize, and sort by most recent
        const data = Array.from(groupedMap.values())
          .map((docData) =>
            withUserFlags(normalize(docData.firestoreDocId, docData))
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        console.log(
          "[useIncidents] Loaded",
          data.length,
          "unique incidents from",
          snapshot.docs.length,
          "documents"
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

    // NOTE: Do NOT filter out silenced incidents - they should remain visible
    // The UI will show them with visual indicators
    // if (!filters.showSilenced) {
    //   filtered = filtered.filter((inc) => !silenced.has(inc.id));
    // }

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
  console.log("============================================");
  console.log("[toggleFavorite] Starting - userId:", userId, "incidentId:", incidentId);

  if (!userId) {
    console.warn("[toggleFavorite] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    
    // Read current state to determine action
    const snap = await getDoc(incidentRef);
    if (!snap.exists()) {
      console.error("[toggleFavorite] ❌ Document not found:", incidentId);
      return;
    }
    
    const data = snap.data();
    const favoritedBy = data.favoritedBy || [];
    const isFavorited = favoritedBy.includes(userId);
    
    console.log("[toggleFavorite] Current state:");
    console.log("  - favoritedBy:", favoritedBy);
    console.log("  - isFavorited:", isFavorited);
    console.log("  - Action:", isFavorited ? "REMOVE" : "ADD");
    
    if (isFavorited) {
      // Remove from favorites
      await updateDoc(incidentRef, {
        favoritedBy: arrayRemove(userId),
      });
      console.log("[toggleFavorite] ✅ REMOVED", userId, "from favoritedBy");
    } else {
      // Add to favorites
      await updateDoc(incidentRef, {
        favoritedBy: arrayUnion(userId),
      });
      console.log("[toggleFavorite] ✅ ADDED", userId, "to favoritedBy");
    }
    
    // Verify
    const verifySnap = await getDoc(incidentRef);
    console.log("[toggleFavorite] 🔍 VERIFICATION - favoritedBy after:", verifySnap.data()?.favoritedBy);
    console.log("============================================");
  } catch (error) {
    console.error("[toggleFavorite] ❌ Error:", error);
    throw error;
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
  console.log("============================================");
  console.log("[toggleBookmark] Starting - userId:", userId, "incidentId:", incidentId);

  if (!userId) {
    console.warn("[toggleBookmark] No user logged in");
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    
    // Read current state to determine action
    const snap = await getDoc(incidentRef);
    if (!snap.exists()) {
      console.error("[toggleBookmark] ❌ Document not found:", incidentId);
      return;
    }
    
    const data = snap.data();
    const bookmarkedBy = data.bookmarkedBy || [];
    const isBookmarked = bookmarkedBy.includes(userId);
    
    console.log("[toggleBookmark] Current state:");
    console.log("  - bookmarkedBy:", bookmarkedBy);
    console.log("  - isBookmarked:", isBookmarked);
    console.log("  - Action:", isBookmarked ? "REMOVE" : "ADD");
    
    if (isBookmarked) {
      // Remove from bookmarks
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayRemove(userId),
      });
      console.log("[toggleBookmark] ✅ REMOVED", userId, "from bookmarkedBy");
    } else {
      // Add to bookmarks
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayUnion(userId),
      });
      console.log("[toggleBookmark] ✅ ADDED", userId, "to bookmarkedBy");
    }
    
    // Verify
    const verifySnap = await getDoc(incidentRef);
    console.log("[toggleBookmark] 🔍 VERIFICATION - bookmarkedBy after:", verifySnap.data()?.bookmarkedBy);
    console.log("============================================");
  } catch (error) {
    console.error("[toggleBookmark] ❌ Error:", error);
    throw error;
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
