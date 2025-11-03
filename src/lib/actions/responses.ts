"use server";

import { db } from "@/lib/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

/**
 * Record a user responding to an alert
 * This creates a response record and notifies all supes
 */
export async function recordAlertResponse(
  incidentId: string,
  userId: string,
  userName: string,
  userRole: string,
  incidentAddress: string
) {
  try {
    console.log(`[Responses] [DOC] Recording response for incident ${incidentId} by ${userName}`);

    // Create response record
    const responsesRef = collection(db, "responses");
    const responseDoc = await addDoc(responsesRef, {
      incidentId,
      userId,
      userName,
      userRole,
      incidentAddress,
      respondedAt: serverTimestamp(),
      status: "active", // active, completed, cancelled
      createdAt: serverTimestamp(),
    });

    console.log(`[Responses] [OK] Response recorded: ${responseDoc.id}`);

    // Notify all supes
    await notifyAllSupes(incidentId, userName, incidentAddress);

    return { success: true, responseId: responseDoc.id };
  } catch (error) {
    console.error("[Responses] [X] Error recording response:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Notify all supes that someone responded to an alert
 */
async function notifyAllSupes(
  incidentId: string,
  responderName: string,
  incidentAddress: string
) {
  try {
    console.log(`[Responses] 📢 Notifying all supes about response`);

    // Get all supe users
    const usersRef = collection(db, "users");
    const supesQuery = query(
      usersRef,
      where("role", "in", ["supe", "super_admin", "admin"])
    );
    const supesSnap = await getDocs(supesQuery);

    // Create notification for each supe
    const notificationsRef = collection(db, "notifications");
    const notificationPromises = supesSnap.docs.map((supeDoc) => {
      return addDoc(notificationsRef, {
        userId: supeDoc.id,
        type: "alert_response",
        title: "Alert Response",
        message: `${responderName} is responding to alert at ${incidentAddress}`,
        incidentId,
        responderName,
        read: false,
        createdAt: serverTimestamp(),
      });
    });

    await Promise.all(notificationPromises);
    console.log(`[Responses] [OK] Notified ${supesSnap.size} supes`);
  } catch (error) {
    console.error("[Responses] [X] Error notifying supes:", error);
  }
}

/**
 * Get all responses for a specific user
 */
export async function getUserResponses(userId: string) {
  try {
    const responsesRef = collection(db, "responses");
    const q = query(
      responsesRef,
      where("userId", "==", userId),
      orderBy("respondedAt", "desc")
    );
    const snapshot = await getDocs(q);

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return responses;
  } catch (error) {
    console.error("[Responses] [X] Error fetching user responses:", error);
    return [];
  }
}

/**
 * Get all active responses for an incident
 */
export async function getIncidentResponses(incidentId: string) {
  try {
    const responsesRef = collection(db, "responses");
    const q = query(
      responsesRef,
      where("incidentId", "==", incidentId),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return responses;
  } catch (error) {
    console.error("[Responses] [X] Error fetching incident responses:", error);
    return [];
  }
}

/**
 * Update response status
 */
export async function updateResponseStatus(
  responseId: string,
  status: "active" | "completed" | "cancelled"
) {
  try {
    const responseRef = doc(db, "responses", responseId);
    await updateDoc(responseRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    console.log(`[Responses] [OK] Updated response ${responseId} to ${status}`);
    return { success: true };
  } catch (error) {
    console.error("[Responses] [X] Error updating response status:", error);
    return { success: false, error: String(error) };
  }
}

