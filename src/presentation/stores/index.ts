/**
 * Presentation Layer Stores
 * 
 * Re-exports all Zustand stores for easy importing.
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
  hasRole,
  isAdmin,
  isSupe,
  isChaser,
} from './auth.store';

// Incidents Store
export {
  useIncidentsStore,
  selectIncidents,
  selectFilteredIncidents,
  selectSelectedIncident,
  selectIncidentFilters,
  selectIncidentSort,
  selectIncidentsLoading,
  selectIncidentsError,
  ACTIVE_INCIDENT_STATUSES,
  ALL_INCIDENT_TYPES,
} from './incidents.store';

// UI Store
export {
  useUIStore,
  selectActiveModal,
  selectModalData,
  selectSidebarOpen,
  selectMobileSidebarOpen,
  selectNotifications,
  selectGlobalLoading,
  selectLoadingMessage,
  selectTheme,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  type ModalType,
  type Notification,
} from './ui.store';
