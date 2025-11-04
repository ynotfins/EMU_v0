/**
 * Extended Domain Types
 * 
 * Additional domain types that aren't part of the core Clean Architecture
 * but are needed for backwards compatibility and migration.
 * 
 * TODO: These should be refactored into proper domain entities/value objects
 */

// Re-export core domain types
export * from '@domain/entities/incident/incident.entity';
export * from '@domain/entities/user/user.entity';
export * from '@domain/shared/value-objects';

// Extended types for backwards compatibility
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
}

export interface IncidentUpdate {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'file_upload' | 'location_update';
  userId: string;
  content: string;
  metadata?: any;
  timestamp: Date | string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'chaser' | 'supe' | 'admin';
  pushNotifications: boolean;
  locationTracking: boolean;
  isActive: boolean;
  preferences: {
    favoriteChaser?: boolean;
    silencedAlerts: string[];
  };
  teamId?: string;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Thread {
  id: string;
  incidentId: string;
  participants: string[];
  lastMessage?: Message;
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
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  tags: string[];
  isEsignRequired: boolean;
  esignStatus?: 'pending' | 'sent' | 'signed' | 'rejected';
  uploadedAt: Date | string;
}

export interface HomeownerForm {
  homeownerName?: string;
  contactPerson?: string;
  phone: string;
  email: string;
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
