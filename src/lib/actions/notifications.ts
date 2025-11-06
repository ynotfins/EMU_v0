import { logger } from "@/lib/utils/logger";

export async function setHighAlertSound(soundId: string) {
  // Stub: will update Firebase user settings
  logger.debug('Set high alert sound', { code: 'Notifications', soundId });
}

export async function subscribeTopics(options: {
  allIncidents?: boolean
  incidentId?: string
}) {
  // Stub: will subscribe to FCM topics
  logger.debug('Subscribe topics', { code: 'Notifications', ...options });
}
