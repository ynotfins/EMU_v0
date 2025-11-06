/**
 * Incidents Store
 * 
 * Global state management for incidents using Zustand.
 * Includes support for filters, sorting, and optimistic updates.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { SerializedIncident } from '@/lib/actions/incidents';
import { IncidentStatus, IncidentType } from '@domain/entities/incident/incident.entity';

interface IncidentFilters {
  status?: IncidentStatus[];
  type?: IncidentType[];
  search?: string;
  assignedToMe?: boolean;
  reportedByMe?: boolean;
}

interface IncidentSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

interface IncidentsState {
  // State
  incidents: SerializedIncident[];
  selectedIncident: SerializedIncident | null;
  filters: IncidentFilters;
  sort: IncidentSort;
  isLoading: boolean;
  error: string | null;
  
  // Optimistic updates
  optimisticIncidents: Map<string, Partial<SerializedIncident>>;
  
  // Actions
  setIncidents: (incidents: SerializedIncident[]) => void;
  addIncident: (incident: SerializedIncident) => void;
  updateIncident: (id: string, updates: Partial<SerializedIncident>) => void;
  removeIncident: (id: string) => void;
  setSelectedIncident: (incident: SerializedIncident | null) => void;
  setFilters: (filters: IncidentFilters) => void;
  setSort: (sort: IncidentSort) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic updates
  addOptimisticUpdate: (id: string, update: Partial<SerializedIncident>) => void;
  removeOptimisticUpdate: (id: string) => void;
  clearOptimisticUpdates: () => void;
  
  // Computed
  getFilteredIncidents: () => SerializedIncident[];
  getIncidentById: (id: string) => SerializedIncident | undefined;
}

const defaultSort: IncidentSort = {
  field: 'createdAt',
  direction: 'desc',
};

export const useIncidentsStore = create<IncidentsState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      incidents: [],
      selectedIncident: null,
      filters: {},
      sort: defaultSort,
      isLoading: true,
      error: null,
      optimisticIncidents: new Map(),
      
      // Actions
      setIncidents: (incidents) =>
        set({ incidents, error: null }, false, 'setIncidents'),
      
      addIncident: (incident) =>
        set(
          (state) => ({ 
            incidents: [incident, ...state.incidents],
            error: null 
          }),
          false,
          'addIncident'
        ),
      
      updateIncident: (id, updates) =>
        set(
          (state) => ({
            incidents: state.incidents.map((inc) =>
              inc.id === id ? { ...inc, ...updates } : inc
            ),
            selectedIncident: state.selectedIncident?.id === id
              ? { ...state.selectedIncident, ...updates }
              : state.selectedIncident,
            error: null,
          }),
          false,
          'updateIncident'
        ),
      
      removeIncident: (id) =>
        set(
          (state) => ({
            incidents: state.incidents.filter((inc) => inc.id !== id),
            selectedIncident: state.selectedIncident?.id === id 
              ? null 
              : state.selectedIncident,
            error: null,
          }),
          false,
          'removeIncident'
        ),
      
      setSelectedIncident: (incident) =>
        set({ selectedIncident: incident }, false, 'setSelectedIncident'),
      
      setFilters: (filters) =>
        set({ filters }, false, 'setFilters'),
      
      setSort: (sort) =>
        set({ sort }, false, 'setSort'),
      
      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),
      
      // Optimistic updates
      addOptimisticUpdate: (id, update) =>
        set(
          (state) => {
            const newMap = new Map(state.optimisticIncidents);
            newMap.set(id, update);
            return { optimisticIncidents: newMap };
          },
          false,
          'addOptimisticUpdate'
        ),
      
      removeOptimisticUpdate: (id) =>
        set(
          (state) => {
            const newMap = new Map(state.optimisticIncidents);
            newMap.delete(id);
            return { optimisticIncidents: newMap };
          },
          false,
          'removeOptimisticUpdate'
        ),
      
      clearOptimisticUpdates: () =>
        set({ optimisticIncidents: new Map() }, false, 'clearOptimisticUpdates'),
      
      // Computed
      getFilteredIncidents: () => {
        const state = get();
        let filtered = [...state.incidents];
        
        // Apply optimistic updates
        state.optimisticIncidents.forEach((update, id) => {
          const index = filtered.findIndex((inc) => inc.id === id);
          if (index >= 0) {
            filtered[index] = { ...filtered[index], ...update };
          }
        });
        
        // Apply filters
        const { filters } = state;
        
        if (filters.status?.length) {
          filtered = filtered.filter((inc) => 
            filters.status!.includes(inc.status)
          );
        }
        
        if (filters.type?.length) {
          filtered = filtered.filter((inc) => 
            filters.type!.includes(inc.type)
          );
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter((inc) =>
            inc.title.toLowerCase().includes(searchLower) ||
            inc.description.toLowerCase().includes(searchLower) ||
            inc.location.address.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
          const { field, direction } = state.sort;
          let aVal: any = a[field];
          let bVal: any = b[field];
          
          // Convert dates to timestamps
          if (field === 'createdAt' || field === 'updatedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          
          if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        
        return filtered;
      },
      
      getIncidentById: (id) => {
        const state = get();
        const incident = state.incidents.find((inc) => inc.id === id);
        
        if (incident && state.optimisticIncidents.has(id)) {
          return { ...incident, ...state.optimisticIncidents.get(id) };
        }
        
        return incident;
      },
    })),
    {
      name: 'IncidentsStore',
    }
  )
);

// Selectors
export const selectIncidents = (state: IncidentsState) => state.incidents;
export const selectFilteredIncidents = (state: IncidentsState) => state.getFilteredIncidents();
export const selectSelectedIncident = (state: IncidentsState) => state.selectedIncident;
export const selectIncidentFilters = (state: IncidentsState) => state.filters;
export const selectIncidentSort = (state: IncidentsState) => state.sort;
export const selectIncidentsLoading = (state: IncidentsState) => state.isLoading;
export const selectIncidentsError = (state: IncidentsState) => state.error;

// Filter presets
export const ACTIVE_INCIDENT_STATUSES: IncidentStatus[] = [
  IncidentStatus.ACTIVE,
  IncidentStatus.ASSIGNED,
  IncidentStatus.IN_PROGRESS,
];

export const ALL_INCIDENT_TYPES: IncidentType[] = Object.values(IncidentType);
