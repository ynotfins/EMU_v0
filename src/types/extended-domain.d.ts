/**
 * Extended Domain Types
 * 
 * Additional domain types that aren't part of the core Clean Architecture
 * but are needed for backwards compatibility and migration.
 * 
 * TODO: These should be refactored into proper domain entities/value objects
 */

// Re-export core domain types (but not Incident - we override it below)
export * from '@domain/entities/user/user.entity';
export * from '@domain/shared/value-objects';
export type {
  IncidentType,
  IncidentPriority,
  IncidentStatus,
  ChaserResponseStatus,
  IncidentUpdateType,
  HomeownerInfo
} from '@domain/entities/incident/incident.entity';

// Extended types for backwards compatibility
// UI-friendly Incident interface (replaces domain Incident for hooks/components)
export interface Incident {
  id: string;
  incidentId?: string;
  incidentNumber: string | number;
  type: string;
  message: string;
  address: string;
  city: string;
  state: string;
  county?: string;
  updatedAt: string | Date;
  updates?: any[];
  updateCount?: number;
  notes?: Array<{
    text: string;
    createdAt: string;
    createdBy: string;
  }>;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export interface IncidentLite {
  id: string;
  incidentId?: string; // Legacy alias for id
  incidentNumber: string | number;
  title: string;
  description: string;
  type: 'fire' | 'accident' | 'hazard' | 'medical' | 'other';
  status: 'pending' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Location data
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  lat?: number; // Direct location access
  lng?: number; // Direct location access
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  
  // Content
  message?: string;
  highAlert?: boolean;
  
  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date | { seconds: number };
  
  // User interaction
  isFavorited?: boolean;
  isBookmarked?: boolean;
  favoritedBy?: string[];
  bookmarkedBy?: string[];
  distanceMi?: number;
  
  // Updates
  updates?: IncidentUpdate[];
  
  // Notes
  notes?: Array<{
    text: string;
    createdAt: string;
    createdBy: string;
  }>;
}

export interface IncidentUpdate {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'file_upload' | 'location_update';
  userId: string;
  content: string;
  metadata?: any;
  timestamp: Date | string;
  ts?: Date | string; // Legacy alias
}

export interface Profile {
  id: string;
  uid: string; // Alias for userId
  userId: string;
  name?: string; // For backwards compat
  displayName: string;
  email: string;
  phone?: string;
  agency?: string;
  role: 'chaser' | 'supe' | 'admin' | 'super_admin';
  pushNotifications: boolean;
  locationTracking: boolean;
  isActive: boolean;
  preferences: {
    favoriteChaser?: boolean;
    silencedAlerts: string[];
  };
  settings?: {
    pushNotifications?: boolean;
    pushEnabled?: boolean;
    locationTracking?: boolean;
    trackingEnabled?: boolean;
    silencedAlerts?: string[];
    highAlertSound?: string;
    muted?: boolean;
  };
  stats?: {
    responsesCount?: number;
    responded?: number;
    completedJobs?: number;
    noted?: number;
    daysActive?: number;
    rating?: number;
  };
  payout?: {
    balance?: number;
    pendingPayments?: number;
    totalEarnings?: number;
    verified?: boolean;
    cashappHandle?: string;
    venmoHandle?: string;
  };
  teamId?: string;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Thread {
  id: string;
  kind?: 'direct' | 'incident';
  title?: string;
  incidentId: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageContent?: string;
  lastMessageTimestamp?: Date | string;
  unreadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
  };
  readBy: string[];
  timestamp: Date | string;
  ts?: Date | string; // Legacy alias
}

export interface FileMeta {
  id: string;
  incidentId: string;
  uploadedBy: string;
  name?: string; // Alias for fileName
  fileName: string;
  fileUrl: string;
  type?: string; // Alias for fileType
  fileType: string;
  kind?: string; // Alias for fileType
  role?: string; // Uploader role
  fileSize: number;
  description?: string;
  message?: string; // Description alias
  tags: string[];
  isEsignRequired: boolean;
  esignStatus?: 'pending' | 'sent' | 'signed' | 'rejected';
  uploadedAt: Date | string;
  ts?: Date | string; // Uploaded timestamp alias
}

export interface HomeownerForm {
  homeownerName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  propertyAddress?: string;
  insuranceCompany: string;
  policyNumber: string;
  claimNumber?: string;
  carrierName?: string;
  claimsPhone?: string;
  incidentDate?: Date | string;
  damageDescription?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  additionalNotes?: string;
  submittedAt?: Date | string;
  submittedBy?: string;
}
