/**
 * Create Incident DTOs
 * 
 * Data Transfer Objects for creating new incidents.
 */

export interface CreateIncidentRequest {
  // Location information
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Incident details
  type: 'fire' | 'accident' | 'hazard' | 'medical' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  description: string;

  // Optional homeowner information
  homeownerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    insuranceCarrier?: string;
    policyNumber?: string;
    notes?: string;
  };

  // Images
  imageUrls?: string[];

  // User context
  reportedByUserId: string;
}

export interface CreateIncidentResponse {
  incidentId: string;
  status: string;
  createdAt: string; // ISO date string
  assignedSupes: string[]; // User IDs
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}
