import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/v2/https";

admin.initializeApp();

/**
 * writeAudit: internal helper that writes a document guarded by rules to allow only Functions.
 */
async function writeAudit(path: string, data: Record<string, unknown>) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().doc(path).set({ ...data, _ts: now }, { merge: true });
}

/**
 * logAuthEvent
 * HTTPS callable. Records high-signal login data.
 * Client sends minimal payload; server enriches with headers and auth.
 */
export const logAuthEvent = functions.https.onCall(
  async (request: CallableRequest<unknown>) => {
    const uid = request.auth?.uid || null;

    // Basic shape and server-side enrichment
    const p = (request.data as Record<string, unknown>) || {};
    const rawReq = request.rawRequest;

    const entry = {
      uid,
      email: (request.auth?.token?.email as string) || null,
      event: "login",
      // client-provided hints
      client: {
        userAgent: rawReq.get("user-agent") || null,
        lang: rawReq.get("accept-language") || null,
        ip: rawReq.ip || null
      },
      // optional client data
      fp: p["fingerprint"] || null,
      consentVersion: p["consentVersion"] || null,
      source: p["source"] || "web",
      roleHint: p["role"] || null
    };

    const refPath = `audit/authEvents/${admin.firestore().collection("_").doc().id}`;
    await writeAudit(refPath, entry);

    return { ok: true, refPath };
  }
);

/**
 * recordConsent
 * HTTPS callable. Stores user consent with versioning and snapshot of toggles.
 */
export const recordConsent = functions.https.onCall(
  async (request: CallableRequest<unknown>) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;
    const p = (request.data as Record<string, unknown>) || {};

    const entry = {
      uid,
      consent: {
        version: p["version"] ?? "v1",
        accepted: !!p["accepted"],
        scopes: Array.isArray(p["scopes"]) ? p["scopes"] : [],
        page: p["page"] || "login"
      },
      client: {
        userAgent: request.rawRequest.get("user-agent") || null,
        lang: request.rawRequest.get("accept-language") || null,
        ip: request.rawRequest.ip || null
      }
    };

    const docId = admin.firestore().collection("_").doc().id;
    const refPath = `legal/consents/${uid}/events/${docId}`;
    await writeAudit(refPath, entry);

    return { ok: true, refPath };
  }
);

/**
 * onIncidentCreate
 * Firestore trigger that automatically geocodes new incidents.
 * Runs when a new incident is added to the incidents collection.
 */
export const onIncidentCreate = functions.firestore
  .document("incidents/{incidentId}")
  .onCreate(async (snapshot, context) => {
    const incidentData = snapshot.data();
    const incidentId = context.params.incidentId;

    // Check if already geocoded
    if (incidentData.lat && incidentData.lng && incidentData.geocodedAt) {
      console.log(`Incident ${incidentId} already has coordinates`);
      return;
    }

    // Build full address
    const { address, city, state } = incidentData;
    if (!address || !city || !state) {
      console.error(`Incident ${incidentId} missing address components`);
      return;
    }

    const fullAddress = `${address}, ${city}, ${state}`;
    console.log(`Geocoding incident ${incidentId}: ${fullAddress}`);

    try {
      // Get Google Maps API key from environment
      const apiKey = functions.config().google?.maps_api_key;
      if (!apiKey) {
        console.error("Google Maps API key not configured");
        return;
      }

      // Call Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        
        // Update incident with coordinates
        await snapshot.ref.update({
          lat: location.lat,
          lng: location.lng,
          geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
          geocodeProvider: "google_maps",
        });

        console.log(
          `Successfully geocoded incident ${incidentId}: ${location.lat}, ${location.lng}`
        );
      } else {
        console.error(`Geocoding failed for incident ${incidentId}:`, data.status);
        
        // Mark as failed to prevent repeated attempts
        await snapshot.ref.update({
          geocodeFailed: true,
          geocodeError: data.status || "UNKNOWN_ERROR",
          geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(`Error geocoding incident ${incidentId}:`, error);
      
      // Mark as failed
      await snapshot.ref.update({
        geocodeFailed: true,
        geocodeError: error.message || "EXCEPTION",
        geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

/**
 * geocodeIncident
 * HTTPS callable function to manually trigger geocoding for an incident.
 * Useful for retrying failed geocoding or updating coordinates.
 */
export const geocodeIncident = functions.https.onCall(
  async (request: CallableRequest<{ incidentId: string }>) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
    }

    const { incidentId } = request.data;
    if (!incidentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "incidentId is required"
      );
    }

    // Get the incident
    const incidentDoc = await admin
      .firestore()
      .collection("incidents")
      .doc(incidentId)
      .get();

    if (!incidentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Incident not found");
    }

    const incidentData = incidentDoc.data()!;
    const { address, city, state } = incidentData;

    if (!address || !city || !state) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Incident missing address components"
      );
    }

    const fullAddress = `${address}, ${city}, ${state}`;

    try {
      const apiKey = functions.config().google?.maps_api_key;
      if (!apiKey) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Google Maps API key not configured"
        );
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;

        await incidentDoc.ref.update({
          lat: location.lat,
          lng: location.lng,
          geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
          geocodeProvider: "google_maps",
          geocodeFailed: false,
          geocodeError: null,
        });

        return {
          success: true,
          lat: location.lat,
          lng: location.lng,
          address: fullAddress,
        };
      } else {
        throw new functions.https.HttpsError(
          "internal",
          `Geocoding failed: ${data.status}`
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Geocoding error: ${error.message}`
      );
    }
  }
);