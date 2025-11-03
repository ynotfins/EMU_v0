/**
 * Get Incidents DTOs
 * 
 * Data Transfer Objects for retrieving incidents with filters.
 */

export interface GetIncidentsRequest {
  // Filters
  status?: string | string[];
  type?: string | string[];
  priority?: string | string[];
  reportedByUserId?: string;
  assignedSupeId?: string;
  assignedChaserId?: string;
  createdAfter?: string; // ISO date string
  createdBefore?: string; // ISO date string
  search?: string;

  // Location filters
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;

  // Bounds for map view
  bounds?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };

  // Pagination
  page?: number;
  pageSize?: number;

  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortDirection?: 'asc' | 'desc';

  // User context
  requestingUserId: string;
  userRole: string;
}

export interface IncidentDto {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    state?: string;
  };
  type: string;
  priority: string;
  status: string;
  description: string;
  reportedBy: {
    id: string;
    displayName: string;
  };
  assignedSupes: Array<{
    id: string;
    displayName: string;
  }>;
  chaserResponses: Array<{
    userId: string;
    displayName: string;
    status: string;
    distance?: number;
    estimatedArrival?: string;
  }>;
  images: string[];
  homeownerInfo?: {
    name?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  
  // Calculated fields
  distance?: number; // If near location filter was used
  canRespond?: boolean; // For chasers
  canEdit?: boolean; // Based on permissions
}

export interface GetIncidentsResponse {
  incidents: IncidentDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
