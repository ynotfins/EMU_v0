/**
 * Presentation Layer Hooks
 * 
 * Re-exports all custom hooks for easy importing.
 */

// Authentication
export { useAuth, useRole, useProtectedRoute } from './use-auth';

// Incidents
export { useIncidents, useMyIncidents } from './use-incidents';
export { useIncident } from './use-incident';

// Location
export { useLocation, useDistanceTo } from './use-location';
