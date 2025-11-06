'use server';

/**
 * Create Incident Server Action
 * 
 * Handles creating new incidents with proper authorization.
 */

import { revalidatePath } from 'next/cache';
import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { CreateIncidentUseCase } from '@application/incidents';
import { getCurrentUser } from '../auth';
import { IncidentType } from '@domain/entities/incident/incident.entity';
import { logger } from '@/lib/utils/logger';

export interface CreateIncidentResult {
  success: boolean;
  incidentId?: string;
  error?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  type: IncidentType;
  address?: string;
  images?: string[];
}

/**
 * Create a new incident
 */
export async function createIncident(
  data: CreateIncidentData
): Promise<CreateIncidentResult> {
  try {
    // Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to create an incident',
      };
    }

    // Only supes and admins can create incidents
    if (!['supe', 'admin', 'super_admin'].includes(user.role)) {
      return {
        success: false,
        error: 'Only supervisors can create incidents',
      };
    }

    const container = getServerContainer();
    const createIncidentUseCase = container.get<CreateIncidentUseCase>(TOKENS.CreateIncidentUseCase);

    const result = await createIncidentUseCase.execute({
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      type: data.type,
      reportedByUserId: user.id,
    });

    if (result.isLeft()) {
      return {
        success: false,
        error: result.value.message,
      };
    }

    const incident = result.value.incident;

    // Revalidate incident pages
    revalidatePath('/supe/incidents');
    revalidatePath('/chaser/incidents');
    revalidatePath(`/incidents/${incident.id.value}`);

    return {
      success: true,
      incidentId: incident.id.value,
    };
  } catch (error) {
    logger.error('Create incident error', error, {
      code: 'CreateIncidentAction',
    });
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Validate incident data before submission
 */
export async function validateIncidentData(
  data: Partial<CreateIncidentData>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!data.type) {
    errors.push('Incident type is required');
  }

  if (!data.latitude || !data.longitude) {
    errors.push('Location is required');
  } else {
    if (data.latitude < -90 || data.latitude > 90) {
      errors.push('Invalid latitude');
    }
    if (data.longitude < -180 || data.longitude > 180) {
      errors.push('Invalid longitude');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

