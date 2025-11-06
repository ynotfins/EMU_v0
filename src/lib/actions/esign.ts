import { logger } from "@/lib/utils/logger";

export interface ESignPacket {
  incidentId: string
  docIds: string[]
  recipientEmail: string
}

export async function sendForESign(packet: ESignPacket) {
  // Stub: will send via Dropbox Sign API
  logger.debug('Send for e-sign', { code: 'ESign', ...packet });
}

export async function liveSign(incidentId: string, signatureDataUrl: string) {
  // Stub: will save signature to Firebase
  logger.debug('Live sign', { code: 'ESign', incidentId, signatureLength: signatureDataUrl.length });
}
