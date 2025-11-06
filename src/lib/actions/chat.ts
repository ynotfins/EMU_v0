import { logger } from "@/lib/utils/logger";

export async function sendMessage(threadId: string, text: string) {
  // Stub: will send message to Firebase
  logger.debug('Send message', { code: 'Chat', threadId, messageLength: text.length });
}
