"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

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

    console.log(`[useResponses] [API] Subscribing to responses for user: ${userId}`);

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

        console.log(`[useResponses] [OK] Loaded ${responsesData.length} responses`);
        setResponses(responsesData);
        setLoading(false);
      },
      (error) => {
        console.error("[useResponses] [X] Error fetching responses:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { responses, loading };
}

