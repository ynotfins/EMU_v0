/**
 * useIncident Hook
 * 
 * Provides real-time data for a single incident.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { clientDb } from '@infrastructure/firebase/config/firebase-client.config';
import type { SerializedIncident } from '@presentation/actions/incidents';

interface UseIncidentReturn {
  incident: SerializedIncident | null;
  loading: boolean;
  error: string | null;
  exists: boolean;
}

/**
 * Hook for subscribing to a single incident
 */
export function useIncident(incidentId: string): UseIncidentReturn {
  const [state, setState] = useState<{
    incident: SerializedIncident | null;
    loading: boolean;
    error: string | null;
    exists: boolean;
  }>({
    incident: null,
    loading: true,
    error: null,
    exists: false,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!incidentId) {
      setState({
        incident: null,
        loading: false,
        error: 'No incident ID provided',
        exists: false,
      });
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Create document reference
    const incidentRef = doc(clientDb, 'incidents', incidentId);

    // Subscribe to changes
    const unsubscribe = onSnapshot(
      incidentRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setState({
            incident: null,
            loading: false,
            error: 'Incident not found',
            exists: false,
          });
          return;
        }

        const data = docSnapshot.data();
        const incident: SerializedIncident = {
          id: docSnapshot.id,
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

        setState({
          incident,
          loading: false,
          error: null,
          exists: true,
        });
      },
      (error) => {
        console.error('Error subscribing to incident:', error);
        setState({
          incident: null,
          loading: false,
          error: 'Failed to load incident',
          exists: false,
        });
      }
    );

    // Save unsubscribe function
    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount or ID change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [incidentId]);

  return state;
}
