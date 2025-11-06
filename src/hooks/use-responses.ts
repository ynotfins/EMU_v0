"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { logger } from "@/lib/utils/logger";

export interface Response {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  userRole: string;
  incidentAddress: string;
  respondedAt: any;
  status: "active" | "completed" | "cancelled";
  createdAt: any;
}

export function useResponses(userId: string | undefined) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(!userId ? false : true);

  useEffect(() => {
    if (!userId) {
      // Early return if no user ID - state already set above
      return;
    }

    logger.debug('Subscribing to responses', { code: 'useResponses', userId });

    const responsesRef = collection(db, "responses");
    const q = query(
      responsesRef,
      where("userId", "==", userId),
      orderBy("respondedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const responsesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Response[];

        logger.debug('Loaded responses', { code: 'useResponses', count: responsesData.length, userId });
        setResponses(responsesData);
        setLoading(false);
      },
      (error) => {
        logger.error('Error fetching responses', error, { code: 'useResponses', userId });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { responses, loading };
}

