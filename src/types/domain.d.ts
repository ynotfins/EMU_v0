/**
 * Domain Type Definitions
 * 
 * These are legacy type definitions to support existing code
 * while we migrate to the Clean Architecture.
 * 
 * TODO: Replace these with proper domain entities and value objects
 */

// Basic types that components are expecting
// IncidentLite moved to extended-domain.d.ts to avoid duplicate

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
