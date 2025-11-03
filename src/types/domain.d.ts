/**
 * Domain Type Definitions
 * 
 * These are legacy type definitions to support existing code
 * while we migrate to the Clean Architecture.
 * 
 * TODO: Replace these with proper domain entities and value objects
 */

// Basic types that components are expecting
export interface IncidentLite {
  id: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'active' | 'resolved' | 'closed';
  type: 'fire' | 'accident' | 'hazard' | 'medical' | 'other';
  createdAt: Date | string;
  updatedAt: Date | string;
  assignedTo?: string;
  reportedBy?: string;
  
  // UI state properties
  isFavorited?: boolean;
  isBookmarked?: boolean;
  distanceMi?: number;
  
  // Additional properties
  priority?: 'low' | 'medium' | 'high' | 'critical';
  images?: string[];
  address?: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  userId: string;
  type: 'status_change' | 'assignment' | 'comment' | 'arrival' | 'completion';
  content: string;
  metadata?: any;
  timestamp: Date | string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: 'chaser' | 'supe' | 'admin';
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date | string;
  lastLogin?: Date | string;
}

export interface ChatThread {
  id: string;
  incidentId?: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  timestamp: Date | string;
  read?: boolean;
}

export interface FileMetadata {
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

export interface HomeownerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  insurance?: string;
  policyNumber?: string;
  deductible?: string;
  claimNumber?: string;
  notes?: string;
}

// Re-export from Clean Architecture (when available)
// export { User } from '@domain/entities/user/user.entity';
// export { Incident } from '@domain/entities/incident/incident.entity';
