export type Role = "admin" | "supe" | "chaser"

export interface IncidentUpdate {
  ts: string
  message: string
}

export interface IncidentLite {
  id: string
  incidentNumber: number
  updatedAt: string
  distanceMi?: number
  state: string
  county: string
  city: string
  address: string
  type: string
  message: string
  isFavorited?: boolean
  isBookmarked?: boolean
  isSilenced?: boolean // Added to track silenced incidents
  updates?: IncidentUpdate[]
  highAlert?: boolean
}

export interface Note {
  uid: string
  text: string
  ts: string
}

export interface HomeownerForm {
  homeownerName?: string
  contactPerson?: string
  phone?: string
  email?: string
  propertyAddress?: string
  incidentDate?: string
  policyNumber?: string
  carrierName?: string
  claimsPhone?: string
  damageDescription?: string
  adjusterName?: string
  adjusterPhone?: string
  additionalNotes?: string
}

export interface FileMeta {
  id: string
  name: string
  url?: string
  kind: "pdf" | "image"
  uploadedBy: {
    uid: string
    name: string
    role: Role
  }
  ts: string
  message?: string
}

export interface Incident extends IncidentLite {
  notes: Note[]
  activeResponders: string[]
  homeownerForm?: HomeownerForm
  files: FileMeta[]
}

export type ThreadKind = "incident" | "team" | "dm"

export interface Thread {
  id: string
  kind: ThreadKind
  title: string
  incidentId?: string
  participants: string[]
  lastMessageContent?: string
  lastMessageTimestamp?: string
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  ts: string
}

export interface Profile {
  uid: string
  email: string
  displayName: string
  role: Role
  agency?: string
  stats: {
    responded: number
    noted: number
    daysActive: number
  }
  settings: {
    pushEnabled: boolean
    trackingEnabled: boolean
    highAlertSound: string
    muted: boolean
  }
  payout: {
    verified: boolean
    cashappHandle?: string
    venmoHandle?: string
  }
}
