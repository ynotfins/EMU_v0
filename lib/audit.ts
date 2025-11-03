import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function auditLogin(params: {
  fingerprint?: unknown;
  consentVersion?: string;
  role?: string;
  source?: "web" | "pwa";
}) {
  const call = httpsCallable(functions, "logAuthEvent");
  return await call(params ?? {});
}

export async function saveConsent(params: {
  version: string;
  accepted: boolean;
  scopes?: string[];
  page?: string;
}) {
  const call = httpsCallable(functions, "recordConsent");
  return await call(params);
}

