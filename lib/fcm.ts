import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging"
import app from "./firebase"

/**
 * Safely get Firebase Messaging instance
 * Returns null if FCM is not supported (e.g., in Node.js or unsupported browsers)
 */
export async function getMessagingSafe(): Promise<Messaging | null> {
  try {
    const supported = await isSupported()
    if (!supported) {
      console.debug("[FCM] Firebase Messaging not supported in this environment")
      return null
    }
    return getMessaging(app)
  } catch (error) {
    console.error("[FCM] Error checking messaging support:", error)
    return null
  }
}

/**
 * Request notification permission and get FCM token
 * @param reg Service Worker registration
 * @param vapidKey VAPID key for web push
 * @returns FCM token or null if permission denied or error
 */
export async function requestPermissionAndGetToken(
  reg: ServiceWorkerRegistration,
  vapidKey: string,
): Promise<string | null> {
  try {
    const messaging = await getMessagingSafe()
    if (!messaging) return null

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      console.debug("[FCM] Notification permission denied")
      return null
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: reg,
    })

    console.debug("[FCM] Got FCM token:", token)
    return token
  } catch (error) {
    console.error("[FCM] Error getting token:", error)
    return null
  }
}

/**
 * Listen for foreground messages
 * @param callback Function to call when message received
 */
export function onForegroundMessage(callback: (payload: any) => void): void {
  getMessagingSafe().then((messaging) => {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.debug("[FCM] Foreground message received:", payload)
      callback(payload)
    })
  })
}

/**
 * Subscribe to FCM topic
 * TODO: Implement server-side topic subscription via Cloud Function
 * @param topic Topic name (e.g., "incidents", "incident-123456")
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  console.debug("[FCM] Subscribe to topic:", topic)
  // TODO: Call Cloud Function to subscribe token to topic
  // await fetch('/api/fcm/subscribe', { method: 'POST', body: JSON.stringify({ topic }) })
}

/**
 * Unsubscribe from FCM topic
 * TODO: Implement server-side topic unsubscription via Cloud Function
 * @param topic Topic name
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  console.debug("[FCM] Unsubscribe from topic:", topic)
  // TODO: Call Cloud Function to unsubscribe token from topic
  // await fetch('/api/fcm/unsubscribe', { method: 'POST', body: JSON.stringify({ topic }) })
}
