"use client";

import { useState, useEffect, useMemo } from "react";
import { logger } from "@/lib/utils/logger";
import type { IncidentLite, IncidentUpdate } from "@/types/extended-domain";
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
import { db, auth } from "@/lib/firebase-client";
import { useFavoritesContext } from "@/lib/context/favorites-context";

// NYC Borough to County mapping
const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
};

// Type for raw Firestore document data (before normalization)
interface FirestoreIncidentData {
  incidentId?: string | number;
  incidentNumber?: string | number;
  firestoreDocId?: string;
  updatedAt?: string | { seconds: number };
  lastSeenAt?: string | { seconds: number };
  lastTs?: string | { seconds: number };
  timestamp?: string | { seconds: number };
  ts?: string | { seconds: number };
  state?: string;
  county?: string;
  city?: string;
  address?: string;
  addr?: string;
  street?: string;
  type?: string;
  lastType?: string;
  alertType?: string;
  message?: string;
  lastMessage?: string;
  alertMessage?: string;
  highAlert?: boolean;
  isSilenced?: boolean;
  updates?: IncidentUpdate[];
  favoritedBy?: string[];
  bookmarkedBy?: string[];
  distanceMi?: number;
  lat?: number;
  lng?: number;
  geocodedAt?: string;
  notes?: Array<{
    text: string;
    createdAt: string;
    createdBy: string;
  }>;
  [key: string]: unknown; // Allow other fields
}

// Helper to convert IncidentLite timestamp to Date
function toDate(value: string | Date | { seconds: number }): Date {
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  } else if (value instanceof Date) {
    return value;
  } else {
    return new Date(value);
  }
}

// Normalize inconsistent Firestore data into IncidentLite type
function normalize(docId: string, data: FirestoreIncidentData): IncidentLite {
  // Handle timestamp variations - try multiple fields and handle Firestore Timestamp objects
  let updatedAtRaw =
    data.updatedAt ||
    data.lastSeenAt ||
    data.lastTs ||
    data.timestamp ||
    data.ts ||
    new Date().toISOString();
  let updatedAt: string | Date;
  if (typeof updatedAtRaw === "object" && updatedAtRaw !== null) {
    if ('seconds' in updatedAtRaw) {
      updatedAt = new Date((updatedAtRaw as { seconds: number }).seconds * 1000);
    } else if ((updatedAtRaw as any) instanceof Date) {
      updatedAt = updatedAtRaw as Date;
    } else {
      updatedAt = new Date().toISOString();
    }
  } else {
    updatedAt = typeof updatedAtRaw === 'string' ? updatedAtRaw : new Date().toISOString();
  }

  let createdAtRaw = data.createdAt || updatedAtRaw;
  let createdAt: string | Date;
  if (typeof createdAtRaw === "object" && createdAtRaw !== null) {
    if ('seconds' in createdAtRaw) {
      createdAt = new Date((createdAtRaw as { seconds: number }).seconds * 1000);
    } else if ((createdAtRaw as any) instanceof Date) {
      createdAt = createdAtRaw as Date;
    } else {
      createdAt = updatedAt;
    }
  } else {
    createdAt = typeof createdAtRaw === 'string' ? createdAtRaw : updatedAt;
  }

  const state = data.state || "";
  const rawCounty = data.county || "";
  // Map NYC boroughs to official county names
  const county = BOROUGH_TO_COUNTY[rawCounty] || rawCounty;
  const city = data.city || "";
  const address = data.address || data.addr || data.street || "";
  // Filter out "BNN" from type and message (case-insensitive)
  const rawType = data.type || data.lastType || data.alertType || "Unknown";
  const cleanedType = rawType.replace(/\bBNN\b/gi, "").trim().replace(/\s+/g, " ") || "Unknown";
  // Ensure type matches IncidentLite union type
  const validTypes: Array<'fire' | 'accident' | 'medical' | 'hazard' | 'other'> = ['fire', 'accident', 'medical', 'hazard', 'other'];
  const type = (validTypes.includes(cleanedType.toLowerCase() as any) 
    ? cleanedType.toLowerCase() 
    : 'other') as 'fire' | 'accident' | 'medical' | 'hazard' | 'other';
  const rawMessage = data.message || data.lastMessage || data.alertMessage || "";
  const message = rawMessage.replace(/\bBNN\b/gi, "").trim().replace(/\s+/g, " ");

  const normalized = {
    id: docId,
    incidentNumber:
      data.incidentNumber ||
      data.incidentId ||
      data.firestoreDocId ||
      parseInt(docId) ||
      0,
    title: (typeof data.title === 'string' ? data.title : null) || message.substring(0, 50) || 'Incident',
    description: message || (typeof data.description === 'string' ? data.description : '') || '',
    status: (data.status || 'active') as 'pending' | 'active' | 'resolved' | 'closed',
    priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
    location: {
      lat: data.lat || 0,
      lng: data.lng || 0,
      address: address || undefined,
    },
    createdAt: updatedAt,
    updatedAt,
    state,
    county,
    city,
    address,
    lat: data.lat,
    lng: data.lng,
    type,
    message,
    highAlert: data.highAlert || false,
    isFavorited: false, // Will be computed by withUserFlags()
    isBookmarked: false, // Will be computed by withUserFlags()
    distanceMi: data.distanceMi, // Legacy field, will be replaced by real-time calculation
    updates: data.updates || [],
    // Store raw arrays for favorite/bookmark logic
    favoritedBy: data.favoritedBy || [],
    bookmarkedBy: data.bookmarkedBy || [],
    // CRITICAL: Store the actual firestoreDocId field for routing/querying
    incidentId: data.firestoreDocId || String(data.incidentId || docId),
    // Include notes for the Notes tab
    notes: data.notes || [],
  } satisfies IncidentLite;

  // DEBUG: Log what we're storing for routing (only in development)
  if (
    process.env.NODE_ENV === 'development' &&
    (docId === "6xE4cVQPSqpjn88vC4kE" ||
    docId === "1834007" ||
    Math.random() < 0.02)
  ) {
    logger.debug(`Document ${docId} fields`, {
      code: 'normalize',
      docId,
      incidentId: data.incidentId,
      incidentNumber: data.incidentNumber,
      fieldNames: Object.keys(data),
    });
  }

  return normalized;
}

/**
 * Format incident list lines for consistent mobile display
 * Returns standardized strings for the 3-line layout
 */
export function formatListLines(incident: IncidentLite) {
  // Handle Firestore timestamp objects { seconds: number }
  let updatedAtValue: Date;
  if (typeof incident.updatedAt === 'object' && incident.updatedAt !== null && 'seconds' in incident.updatedAt) {
    updatedAtValue = new Date((incident.updatedAt as { seconds: number }).seconds * 1000);
  } else if (incident.updatedAt instanceof Date) {
    updatedAtValue = incident.updatedAt;
  } else {
    updatedAtValue = new Date(incident.updatedAt);
  }
  const line1Date = updatedAtValue;
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
  if (!uid) {
    // Not authenticated - no user flags
    return {
      ...incident,
      isFavorited: false,
      isBookmarked: false,
    };
  }

  const favoritedBy = incident.favoritedBy ?? [];
  const bookmarkedBy = incident.bookmarkedBy ?? [];
  const isFavorited = favoritedBy.includes(uid);
  const isBookmarked = bookmarkedBy.includes(uid);

  // Only log if it's favorited or bookmarked (reduce noise)
  if (isFavorited || isBookmarked) {
    logger.debug(`Incident ${incident.incidentNumber} user flags`, {
      code: 'withUserFlags',
      incidentNumber: incident.incidentNumber,
      uid,
      isFavorited,
      isBookmarked,
      favoritedByCount: favoritedBy.length,
      bookmarkedByCount: bookmarkedBy.length,
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
              toDate(b.updatedAt).getTime() - toDate(a.updatedAt).getTime()
          );

        logger.info(`Loaded ${data.length} unique incidents from ${snapshot.docs.length} documents`, {
          code: 'useIncidents',
          uniqueCount: data.length,
          documentCount: snapshot.docs.length,
        });
        setIncidents(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        logger.error("Firestore error", err, { code: 'useIncidents' });
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
      // Distance filter: show alerts within X miles from last 4 hours
      const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
      filtered = filtered.filter((inc) => {
        const incidentTime = new Date(inc.updatedAt).getTime();
        const isRecent = incidentTime >= fourHoursAgo;
        const withinDistance = inc.distanceMi !== undefined && inc.distanceMi <= filters.distanceMi!;
        return isRecent && withinDistance;
      });
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
  const userId = auth.currentUser?.uid;
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: 'toggleFavorite' });
    return;
  }

  logger.debug("Starting toggle favorite", {
    code: 'toggleFavorite',
    userId,
    incidentId,
  });

  try {
    const incidentRef = doc(db, "incidents", incidentId);

    // Read current state to determine action
    const snap = await getDoc(incidentRef);
    if (!snap.exists()) {
      logger.error("Document not found", undefined, {
        code: 'toggleFavorite',
        incidentId,
      });
      return;
    }

    const data = snap.data();
    const favoritedBy = data.favoritedBy || [];
    const isFavorited = favoritedBy.includes(userId);

    logger.debug("Current favorite state", {
      code: 'toggleFavorite',
      isFavorited,
      action: isFavorited ? "REMOVE" : "ADD",
      favoritedByCount: favoritedBy.length,
    });

    if (isFavorited) {
      // Remove from favorites
      await updateDoc(incidentRef, {
        favoritedBy: arrayRemove(userId),
      });
      logger.info("Removed from favorites", {
        code: 'toggleFavorite',
        userId,
        incidentId,
      });
    } else {
      // Add to favorites
      await updateDoc(incidentRef, {
        favoritedBy: arrayUnion(userId),
      });
      logger.info("Added to favorites", {
        code: 'toggleFavorite',
        userId,
        incidentId,
      });
    }
  } catch (error) {
    logger.error("Error toggling favorite", error, {
      code: 'toggleFavorite',
      incidentId,
      userId,
    });
    throw error;
  }
}

export async function unfavorite(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: 'unfavorite' });
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      favoritedBy: arrayRemove(userId),
    });
    logger.info("Unfavorited incident", {
      code: 'unfavorite',
      userId,
      incidentId,
    });
  } catch (error) {
    logger.error("Error unfavoriting", error, {
      code: 'unfavorite',
      incidentId,
      userId,
    });
  }
}

export async function toggleBookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: 'toggleBookmark' });
    return;
  }

  logger.debug("Starting toggle bookmark", {
    code: 'toggleBookmark',
    userId,
    incidentId,
  });

  try {
    const incidentRef = doc(db, "incidents", incidentId);

    // Read current state to determine action
    const snap = await getDoc(incidentRef);
    if (!snap.exists()) {
      logger.error("Document not found", undefined, {
        code: 'toggleBookmark',
        incidentId,
      });
      return;
    }

    const data = snap.data();
    const bookmarkedBy = data.bookmarkedBy || [];
    const isBookmarked = bookmarkedBy.includes(userId);

    logger.debug("Current bookmark state", {
      code: 'toggleBookmark',
      isBookmarked,
      action: isBookmarked ? "REMOVE" : "ADD",
      bookmarkedByCount: bookmarkedBy.length,
    });

    if (isBookmarked) {
      // Remove from bookmarks
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayRemove(userId),
      });
      logger.info("Removed from bookmarks", {
        code: 'toggleBookmark',
        userId,
        incidentId,
      });
    } else {
      // Add to bookmarks
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayUnion(userId),
      });
      logger.info("Added to bookmarks", {
        code: 'toggleBookmark',
        userId,
        incidentId,
      });
    }
  } catch (error) {
    logger.error("Error toggling bookmark", error, {
      code: 'toggleBookmark',
      incidentId,
      userId,
    });
    throw error;
  }
}

export async function unbookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: 'unbookmark' });
    return;
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId);
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayRemove(userId),
    });
    logger.info("Unbookmarked incident", {
      code: 'unbookmark',
      userId,
      incidentId,
    });
  } catch (error) {
    logger.error("Error unbookmarking", error, {
      code: 'unbookmark',
      incidentId,
      userId,
    });
  }
}

// Action stubs - ready for Firebase implementation
export function respondToAlert(incidentId: string): void {
  logger.debug("Responding to alert", {
    code: 'respondToAlert',
    incidentId,
  });
  // TODO: Update Firestore: incidents/{incidentId} set status='responding', assignedTo=currentUserId
}
