/**
 * useIncidents Hook
 * 
 * Provides incident data and operations for client components.
 * Includes real-time subscriptions and optimistic updates.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getIncidents, 
  getMyIncidents,
  createIncident,
  type SerializedIncident,
  type GetIncidentsFilter,
  type CreateIncidentData
} from '@/lib/actions/incidents';
import { onSnapshot, collection, query, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface IncidentsState {
  incidents: SerializedIncident[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
}

interface UseIncidentsReturn {
  incidents: SerializedIncident[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  refetch: () => Promise<void>;
  createNewIncident: (data: CreateIncidentData) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook for fetching and subscribing to incidents
 */
export function useIncidents(
  filter?: GetIncidentsFilter,
  realtime: boolean = true
): UseIncidentsReturn {
  const [state, setState] = useState<IncidentsState>({
    incidents: [],
    loading: true,
    error: null,
    isCreating: false,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Fetch incidents from server
   */
  const fetchIncidents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getIncidents(filter);
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Failed to fetch incidents' 
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        incidents: result.incidents || [],
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Error fetching incidents', error, {
        code: 'useIncidents',
      });
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch incidents' 
      }));
    }
  }, [filter]);

  /**
   * Set up real-time subscription
   */
  const setupRealtimeSubscription = useCallback(() => {
    if (!realtime) return;

    // Build Firestore query
    let q = collection(db, 'incidents');
    const constraints: QueryConstraint[] = [];

    if (filter?.status) {
      const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
      if (statusArray.length === 1) {
        constraints.push(where('status', '==', statusArray[0]));
      }
    }

    if (filter?.type) {
      const typeArray = Array.isArray(filter.type) ? filter.type : [filter.type];
      if (typeArray.length === 1) {
        constraints.push(where('type', '==', typeArray[0]));
      }
    }

    // Add default ordering and limit
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));

    const finalQuery = query(q, ...constraints);

    // Subscribe to changes
    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const incidents: SerializedIncident[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            location: {
              lat: data.location.lat,
              lng: data.location.lng,
              address: data.location.address,
            },
            type: data.type,
            priority: data.priority,
            status: data.status,
            reportedBy: data.reportedBy,
            assignedSupes: data.assignedSupes || [],
            chaserResponses: data.chaserResponses || {},
            images: data.images || [],
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        });

        // Apply in-memory filters if needed
        let filteredIncidents = incidents;
        
        if (filter?.search) {
          const searchLower = filter.search.toLowerCase();
          filteredIncidents = filteredIncidents.filter(incident =>
            incident.title.toLowerCase().includes(searchLower) ||
            incident.description.toLowerCase().includes(searchLower) ||
            incident.location.address.toLowerCase().includes(searchLower)
          );
        }

        setState(prev => ({
          ...prev,
          incidents: filteredIncidents,
          loading: false,
        }));
      },
      (error) => {
        logger.error('Realtime subscription error', error, {
          code: 'useIncidents',
        });
        setState(prev => ({
          ...prev,
          error: 'Real-time updates unavailable',
        }));
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [filter, realtime]);

  /**
   * Create a new incident
   */
  const createNewIncident = useCallback(async (
    data: CreateIncidentData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isCreating: true }));
      const result = await createIncident(data);
      
      if (result.success) {
        // Refetch to get the new incident
        await fetchIncidents();
      }

      setState(prev => ({ ...prev, isCreating: false }));
      return result;
    } catch (error) {
      logger.error('Error creating incident', error, {
        code: 'useIncidents',
      });
      setState(prev => ({ ...prev, isCreating: false }));
      return {
        success: false,
        error: 'Failed to create incident',
      };
    }
  }, [fetchIncidents]);

  // Set up subscription on mount and when filter changes
  useEffect(() => {
    if (realtime) {
      setupRealtimeSubscription();
    } else {
      fetchIncidents();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [realtime, setupRealtimeSubscription, fetchIncidents]);

  return {
    incidents: state.incidents,
    loading: state.loading,
    error: state.error,
    isCreating: state.isCreating,
    refetch: fetchIncidents,
    createNewIncident,
  };
}

/**
 * Hook for fetching user's assigned incidents
 */
export function useMyIncidents(realtime: boolean = true) {
  const [state, setState] = useState<IncidentsState>({
    incidents: [],
    loading: true,
    error: null,
    isCreating: false,
  });

  const fetchMyIncidents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const result = await getMyIncidents();
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Failed to fetch incidents' 
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        incidents: result.incidents || [],
        loading: false,
      }));
    } catch (error) {
      logger.error('Error fetching my incidents', error, {
        code: 'useIncidents',
      });
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch incidents' 
      }));
    }
  }, []);

  useEffect(() => {
    fetchMyIncidents();
    
    // TODO: Set up real-time subscription for assigned incidents
    // This requires knowing the current user ID client-side
  }, [fetchMyIncidents]);

  return {
    incidents: state.incidents,
    loading: state.loading,
    error: state.error,
    refetch: fetchMyIncidents,
  };
}
