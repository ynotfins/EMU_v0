import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

/**
 * HTTPS callable: logAuthEvent
 * Verifies caller's Firebase ID token, records audit entry with request metadata.
 */
export const logAuthEvent = functions.https.onCall(async (data, context) => {
  // Verify auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Missing auth')
  }
  const uid = context.auth.uid
  const now = admin.firestore.Timestamp.now()

  // Extract request metadata
  const ip =
    (context.rawRequest.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    context.rawRequest.ip ||
    'unknown'
  const ua = (context.rawRequest.headers['user-agent'] as string) || 'unknown'
  const referer = (context.rawRequest.headers['referer'] as string) || ''

  // Device fingerprint payload from client (optional)
  const fp = (data?.fingerprint || {}) as {
    vendor?: string
    confidence?: number
    visitorId?: string
    ua?: string
  }

  // Write immutable audit doc in partitioned collection
  const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '')
  const docRef = admin.firestore()
    .collection('audit_auth')
    .doc(yyyymm)
    .collection('events')
    .doc()

  await docRef.set({
    uid,
    ts: now,
    ip,
    ua,
    referer,
    fpVendor: fp.vendor || null,
    fpVisitorId: fp.visitorId || null,
    fpConfidence: fp.confidence ?? null,
    fpUa: fp.ua || null,
    type: data?.type || 'login', // login|logout|signup
    app: 'web',
    domain: (context.rawRequest.headers['x-forwarded-host'] as string) || (context.rawRequest.headers['host'] as string) || '',
  }, { merge: false })

  return { ok: true, id: docRef.id }
})

/**
 * Callable to record consent version(s) at first login or when updated.
 */
export const recordConsent = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Missing auth')
  const uid = context.auth.uid
  const { tosVersion, privacyVersion } = data || {}
  const ts = admin.firestore.Timestamp.now()
  const ref = admin.firestore().collection('users').doc(uid)
  await ref.set({
    consent: {
      tos: { version: tosVersion || 'v1', at: ts },
      privacy: { version: privacyVersion || 'v1', at: ts },
    }
  }, { merge: true })
  return { ok: true }
})

