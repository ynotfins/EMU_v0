'use server';

/**
 * Get Incidents Server Action
 * 
 * Handles fetching incidents with filtering and authorization.
 */

import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { GetIncidentsUseCase } from '@application/incidents';
import { getCurrentUser } from '../auth';
import { IncidentStatus, IncidentType } from '@domain/entities/incident/incident.entity';
import { logger } from '@/lib/utils/logger';

export interface GetIncidentsResult {
  success: boolean;
  incidents?: SerializedIncident[];
  error?: string;
}

export interface SerializedIncident {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: IncidentType;
  priority: string;
  status: IncidentStatus;
  reportedBy: string;
  assignedSupes: string[];
  chaserResponses: Record<string, {
    status: string;
    distance?: number;
    estimatedArrival?: string;
  }>;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetIncidentsFilter {
  status?: IncidentStatus | IncidentStatus[];
  type?: IncidentType | IncidentType[];
  assignedToMe?: boolean;
  reportedByMe?: boolean;
  search?: string;
}

/**
 * Get incidents with optional filters
 */
export async function getIncidents(
  filter?: GetIncidentsFilter
): Promise<GetIncidentsResult> {
  try {
    // Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to view incidents',
      };
    }

    const container = getServerContainer();
    const getIncidentsUseCase = container.get<GetIncidentsUseCase>(TOKENS.GetIncidentsUseCase);

    // Build request filters
    const request: any = {};
    
    if (filter?.status) {
      request.status = filter.status;
    }
    
    if (filter?.type) {
      request.type = filter.type;
    }
    
    if (filter?.assignedToMe && user.role === 'chaser') {
      request.assignedToUserId = user.id;
    }
    
    if (filter?.reportedByMe) {
      request.reportedByUserId = user.id;
    }
    
    if (filter?.search) {
      request.search = filter.search;
    }

    const result = await getIncidentsUseCase.execute(request);

    if (result.isLeft()) {
      return {
        success: false,
        error: result.value.message,
      };
    }

    const { incidents } = result.value;

    // Serialize incidents for client consumption
    const serializedIncidents: SerializedIncident[] = incidents.map(incident => ({
      id: incident.id.value,
      title: incident.title,
      description: incident.description,
      location: {
        lat: incident.location.lat,
        lng: incident.location.lng,
        address: incident.location.address,
      },
      type: incident.type,
      priority: incident.priority,
      status: incident.status,
      reportedBy: incident.reportedBy.value,
      assignedSupes: Array.from(incident.assignedSupes).map(id => id.value),
      chaserResponses: Object.fromEntries(
        Array.from(incident.chaserResponses.entries()).map(([key, response]) => [
          key,
          {
            status: response.status,
            distance: response.distance?.kilometers,
            estimatedArrival: response.estimatedArrival?.toISOString(),
          },
        ])
      ),
      images: incident.images,
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString(),
    }));

    return {
      success: true,
      incidents: serializedIncidents,
    };
  } catch (error) {
    logger.error('Get incidents error', error as Error, { code: 'GetIncidentsAction' });
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get incidents for the current user's role
 */
export async function getMyIncidents(): Promise<GetIncidentsResult> {
  const { user } = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
    };
  }

  // For chasers, get assigned incidents
  if (user.role === 'chaser') {
    return getIncidents({ assignedToMe: true });
  }

  // For supes, get all active incidents
  return getIncidents({ 
    status: [IncidentStatus.ACTIVE, IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS] 
  });
}

/**
 * Get recent incidents (for dashboard)
 */
export async function getRecentIncidents(limit: number = 10): Promise<GetIncidentsResult> {
  const result = await getIncidents();
  
  if (!result.success || !result.incidents) {
    return result;
  }

  // Sort by created date and limit
  const recentIncidents = result.incidents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return {
    ...result,
    incidents: recentIncidents,
  };
}
