"use server";

import { db } from "@/lib/firebase-client";
import { logger } from "@/lib/utils/logger";
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
    logger.debug('Recording response', { code: 'Responses', incidentId, userName, userRole });

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

    logger.debug('Response recorded', { code: 'Responses', responseId: responseDoc.id, incidentId });

    // Notify all supes
    await notifyAllSupes(incidentId, userName, incidentAddress);

    return { success: true, responseId: responseDoc.id };
  } catch (error) {
    logger.error('Error recording response', error as Error, { code: 'Responses', incidentId, userId });
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
    logger.debug('Notifying all supes about response', { code: 'Responses', incidentId, responderName });

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
    logger.debug('Notified supes', { code: 'Responses', incidentId, supeCount: supesSnap.size });
  } catch (error) {
    logger.error('Error notifying supes', error as Error, { code: 'Responses', incidentId });
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
    logger.error('Error fetching user responses', error as Error, { code: 'Responses', userId });
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
    logger.error('Error fetching incident responses', error as Error, { code: 'Responses', incidentId });
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

    logger.debug('Updated response status', { code: 'Responses', responseId, status });
    return { success: true };
  } catch (error) {
    logger.error('Error updating response status', error as Error, { code: 'Responses', responseId, status });
    return { success: false, error: String(error) };
  }
}

