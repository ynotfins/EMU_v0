export interface ESignPacket {
  incidentId: string
  docIds: string[]
  recipientEmail: string
}

export async function sendForESign(packet: ESignPacket) {
  // Stub: will send via Dropbox Sign API
  console.log("[v0] Send for e-sign:", packet)
}

export async function liveSign(incidentId: string, signatureDataUrl: string) {
  // Stub: will save signature to Firebase
  console.log("[v0] Live sign:", incidentId, signatureDataUrl.substring(0, 50))
}
