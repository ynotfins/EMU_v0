export async function uploadDoc(incidentId: string, file: File, message?: string) {
  // Stub: will upload to Firebase Storage
  console.log("[v0] Upload doc:", incidentId, file.name, message)
}

export async function deleteDoc(incidentId: string, fileId: string) {
  // Stub: will delete from Firebase Storage
  console.log("[v0] Delete doc:", incidentId, fileId)
}
