import { logger } from "@/lib/utils/logger";

export async function uploadDoc(incidentId: string, file: File, message?: string) {
  // Stub: will upload to Firebase Storage
  logger.debug('Upload doc', { code: 'Files', incidentId, fileName: file.name, message });
}

export async function deleteDoc(incidentId: string, fileId: string) {
  // Stub: will delete from Firebase Storage
  logger.debug('Delete doc', { code: 'Files', incidentId, fileId });
}
