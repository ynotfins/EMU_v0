export type Role = "super_admin" | "admin" | "supe" | "chaser"

export interface IncidentUpdate {
  ts: string
  message: string
}

export interface IncidentLite {
  id: string
  incidentNumber: number
  updatedAt: string
  distanceMi?: number // Legacy field, calculated client-side now
  lat?: number // Latitude from geocoding (cached in Firestore)
  lng?: number // Longitude from geocoding (cached in Firestore)
  geocodedAt?: string // When the address was geocoded
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
  // Firestore arrays for multi-user favorites/bookmarks
  favoritedBy?: string[]
  bookmarkedBy?: string[]
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
  viewMode?: "chaser" | "supe"
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
  // Employee Management Fields
  employee?: {
    employeeId: string
    hireDate: string
    department?: string
    permissions: string[]
    idDocument?: {
      url: string
      uploadedAt: string
      verified: boolean
    }
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
  // Location data for live tracking
  location?: {
    lat: number
    lng: number
    accuracy?: number
    lastUpdated: string
  }
}

// Lead Generation Types
export type LeadSource = "radio_scanner" | "social_media" | "web_scraping" | "seo_landing" | "referral" | "manual"
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost"

export interface Lead {
  id: string
  source: LeadSource
  status: LeadStatus
  createdAt: string
  updatedAt: string
  
  // Contact Information
  contact: {
    name?: string
    phone?: string
    email?: string
    address?: string
    city?: string
    state?: string
    zip?: string
  }
  
  // Incident Information
  incidentType?: string
  incidentDate?: string
  damageDescription?: string
  estimatedLoss?: number
  
  // Insurance Information
  insuranceCompany?: string
  policyNumber?: string
  claimNumber?: string
  
  // Assignment
  assignedTo?: string // User ID of assigned adjuster
  convertedToClaimId?: string
  notes?: string[]
  
  // Source-specific data
  sourceData?: {
    radioFrequency?: string
    socialMediaPost?: string
    webUrl?: string
    keywords?: string[]
  }
}

// Claims Management Types
export type ClaimStage = "lead" | "assignment" | "investigation" | "negotiation" | "settlement" | "closed"
export type ClaimPriority = "low" | "medium" | "high" | "urgent"

export interface Claim {
  id: string
  claimNumber: string
  incidentId?: string // Link to original incident
  leadId?: string // Link to original lead
  stage: ClaimStage
  priority: ClaimPriority
  createdAt: string
  updatedAt: string
  
  // Client Information
  client: {
    name: string
    phone: string
    email?: string
    address: string
    city: string
    state: string
    zip: string
  }
  
  // Insurance Details
  insurance: {
    company: string
    policyNumber: string
    claimNumber?: string
    adjusterName?: string
    adjusterPhone?: string
    adjusterEmail?: string
    policyLimits?: number
    deductible?: number
  }
  
  // Damage Assessment
  damage: {
    type: string
    description: string
    estimatedLoss: number
    documentedLoss?: number
    approvedAmount?: number
  }
  
  // Assignment
  assignedAdjuster: string // User ID
  assignedTeam?: string[] // Array of User IDs
  
  // Timeline
  timeline?: {
    leadReceived?: string
    assigned?: string
    firstContact?: string
    inspectionScheduled?: string
    inspectionCompleted?: string
    estimateSubmitted?: string
    negotiationStarted?: string
    settlementReached?: string
    paymentReceived?: string
    closed?: string
  }
  
  // Documents
  documents?: string[] // Document IDs
  signatures?: string[] // ESignature IDs
}

// Document Management Types
export type DocumentType = "form" | "photo" | "estimate" | "contract" | "report" | "correspondence" | "other"
export type DocumentStatus = "draft" | "pending_review" | "approved" | "signed" | "archived"

export interface Document {
  id: string
  type: DocumentType
  status: DocumentStatus
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  
  // File Information
  file: {
    url: string
    name: string
    size: number
    mimeType: string
    storageRef: string
  }
  
  // Metadata
  metadata: {
    claimId?: string
    incidentId?: string
    formTemplateId?: string
    version: number
    tags: string[]
  }
  
  // Access Control
  owner: string // User ID
  sharedWith: string[] // User IDs
  permissions: {
    [userId: string]: "view" | "edit" | "admin"
  }
  
  // Audit Trail
  history: {
    action: "created" | "updated" | "viewed" | "downloaded" | "signed"
    userId: string
    timestamp: string
    details?: string
  }[]
}

// E-Signature Types
export interface ESignature {
  id: string
  documentId: string
  createdAt: string
  completedAt?: string
  
  // Signer Information
  signer: {
    name: string
    email: string
    phone?: string
    title?: string
  }
  
  // Signature Data
  signature: {
    image: string // Base64 encoded signature image
    timestamp: string
    ipAddress: string
    deviceFingerprint: string
    timezone: string
    userAgent: string
  }
  
  // Legal Compliance
  compliance: {
    documentHash: string // SHA-256 hash of document
    consentGiven: boolean
    consentText: string
    certificateUrl?: string
  }
  
  // Status
  status: "pending" | "signed" | "declined" | "expired"
  declineReason?: string
  expiresAt?: string
}

// Form Template Types
export interface FormTemplate {
  id: string
  name: string
  category: string
  description?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  
  // Form Structure
  fields: {
    id: string
    type: "text" | "number" | "email" | "phone" | "date" | "select" | "checkbox" | "textarea" | "signature"
    label: string
    required: boolean
    placeholder?: string
    options?: string[] // For select fields
    validation?: {
      pattern?: string
      min?: number
      max?: number
      message?: string
    }
  }[]
  
  // Layout
  sections: {
    id: string
    title: string
    description?: string
    fieldIds: string[]
  }[]
  
  // Usage
  usageCount: number
  lastUsed?: string
}

// SEO Content Types
export interface SEOContent {
  id: string
  type: "landing_page" | "blog_post" | "service_page" | "location_page"
  status: "draft" | "published" | "scheduled"
  createdAt: string
  updatedAt: string
  publishedAt?: string
  
  // Content
  title: string
  slug: string
  metaDescription: string
  keywords: string[]
  content: string // Rich text/markdown
  
  // SEO Data
  seo: {
    canonicalUrl?: string
    ogImage?: string
    ogTitle?: string
    ogDescription?: string
    schemaMarkup?: string
  }
  
  // Analytics
  analytics?: {
    views: number
    uniqueVisitors: number
    avgTimeOnPage: number
    bounceRate: number
    conversions: number
  }
  
  // Author
  author: string // User ID
  lastEditedBy?: string // User ID
}
