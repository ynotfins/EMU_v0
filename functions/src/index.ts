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
