import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging"
import app from "./firebase"
import { logger } from "../utils/logger"

/**
 * Safely get Firebase Messaging instance
 * Returns null if FCM is not supported (e.g., in Node.js or unsupported browsers)
 */
export async function getMessagingSafe(): Promise<Messaging | null> {
  try {
    const supported = await isSupported()
    if (!supported) {
      logger.debug('Firebase Messaging not supported', { code: 'FCM' })
      return null
    }
    return getMessaging(app)
  } catch (error) {
    logger.error('Error checking messaging support', error as Error, { code: 'FCM' })
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
      logger.debug('Notification permission denied', { code: 'FCM' })
      return null
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: reg,
    })

    logger.debug('Got FCM token', { code: 'FCM', token })
    return token
  } catch (error) {
    logger.error('Error getting token', error as Error, { code: 'FCM' })
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
      logger.debug('Foreground message received', { code: 'FCM', payload })
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
  logger.debug('Subscribe to topic', { code: 'FCM', topic })
  // TODO: Call Cloud Function to subscribe token to topic
  // await fetch('/api/fcm/subscribe', { method: 'POST', body: JSON.stringify({ topic }) })
}

/**
 * Unsubscribe from FCM topic
 * TODO: Implement server-side topic unsubscription via Cloud Function
 * @param topic Topic name
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  logger.debug('Unsubscribe from topic', { code: 'FCM', topic })
  // TODO: Call Cloud Function to unsubscribe token from topic
  // await fetch('/api/fcm/unsubscribe', { method: 'POST', body: JSON.stringify({ topic }) })
}
