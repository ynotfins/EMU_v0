/**
 * UI Store
 * 
 * Global state management for UI elements using Zustand.
 * Handles modals, sidebars, notifications, and other UI state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ModalType = 
  | 'createIncident'
  | 'incidentDetails'
  | 'userProfile'
  | 'settings'
  | 'confirmation'
  | null;

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UIState {
  // Modal state
  activeModal: ModalType;
  modalData: any;
  
  // Sidebar state
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeModal: null,
      modalData: null,
      sidebarOpen: true,
      mobileSidebarOpen: false,
      notifications: [],
      globalLoading: false,
      loadingMessage: null,
      theme: 'system',
      
      // Modal actions
      openModal: (modal, data) =>
        set(
          { activeModal: modal, modalData: data },
          false,
          'openModal'
        ),
      
      closeModal: () =>
        set(
          { activeModal: null, modalData: null },
          false,
          'closeModal'
        ),
      
      // Sidebar actions
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, 'setSidebarOpen'),
      
      setMobileSidebarOpen: (open) =>
        set({ mobileSidebarOpen: open }, false, 'setMobileSidebarOpen'),
      
      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'toggleSidebar'
        ),
      
      toggleMobileSidebar: () =>
        set(
          (state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen }),
          false,
          'toggleMobileSidebar'
        ),
      
      // Notification actions
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        
        set(
          (state) => ({
            notifications: [...state.notifications, newNotification],
          }),
          false,
          'addNotification'
        );
        
        // Auto-remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || 5000);
        }
      },
      
      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'removeNotification'
        ),
      
      clearNotifications: () =>
        set({ notifications: [] }, false, 'clearNotifications'),
      
      // Loading actions
      setGlobalLoading: (loading, message) =>
        set(
          {
            globalLoading: loading,
            loadingMessage: message || null,
          },
          false,
          'setGlobalLoading'
        ),
      
      // Theme actions
      setTheme: (theme) =>
        set({ theme }, false, 'setTheme'),
    }),
    {
      name: 'UIStore',
    }
  )
);

// Selectors
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectModalData = (state: UIState) => state.modalData;
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen;
export const selectMobileSidebarOpen = (state: UIState) => state.mobileSidebarOpen;
export const selectNotifications = (state: UIState) => state.notifications;
export const selectGlobalLoading = (state: UIState) => state.globalLoading;
export const selectLoadingMessage = (state: UIState) => state.loadingMessage;
export const selectTheme = (state: UIState) => state.theme;

// Helper functions
export const showSuccessNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'success',
    title,
    message,
  });
};

export const showErrorNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'error',
    title,
    message,
    duration: 10000, // Show errors longer
  });
};

export const showWarningNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'warning',
    title,
    message,
  });
};

export const showInfoNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'info',
    title,
    message,
  });
};
