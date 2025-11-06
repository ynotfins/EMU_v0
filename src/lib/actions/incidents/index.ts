/**
 * Incident Server Actions
 * 
 * Re-exports all incident-related server actions for easy importing.
 */

export { 
  createIncident, 
  validateIncidentData,
  type CreateIncidentResult,
  type CreateIncidentData 
} from './create-incident.action';

export { 
  getIncidents,
  getMyIncidents,
  getRecentIncidents,
  type GetIncidentsResult,
  type GetIncidentsFilter,
  type SerializedIncident 
} from './get-incidents.action';

