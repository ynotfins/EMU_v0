/**
 * Incident Module
 * Centralizes all incident-related operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  Query,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase-client';

export interface Incident {
  id: string;
  title: string;
  type: string;
  level: 'high' | 'medium' | 'low';
  address: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  source?: string;
  isHomeFire?: boolean;
  isActive: boolean;
  isSilenced: boolean;
  isFavorited: boolean;
  isBookmarked: boolean;
  description?: string;
  reportedBy?: string;
  assignedTo?: string[];
  images?: string[];
  videos?: string[];
  audioNotes?: string[];
  updates?: IncidentUpdate[];
  responses?: ChaserResponse[];
  createdAt: Date;
  updatedAt: Date;
  homeownerInfo?: HomeownerInfo;
  weatherConditions?: WeatherInfo;
}

export interface IncidentUpdate {
  id: string;
  userId: string;
  userName: string;
  message: string;
  images?: string[];
  timestamp: Date;
  type: 'status' | 'info' | 'alert' | 'resolution';
}

export interface ChaserResponse {
  userId: string;
  userName: string;
  status: 'responding' | 'on_scene' | 'completed' | 'unavailable';
  eta?: string;
  timestamp: Date;
  notes?: string;
}

export interface HomeownerInfo {
  name: string;
  phone: string;
  email?: string;
  insurance?: string;
  policyNumber?: string;
  notes?: string;
}

export interface WeatherInfo {
  temperature?: number;
  conditions?: string;
  windSpeed?: number;
  windDirection?: string;
  humidity?: number;
}

export interface IncidentFilters {
  type?: string;
  level?: string;
  isActive?: boolean;
  isFavorited?: boolean;
  assignedTo?: string;
  city?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class IncidentModule {
  private readonly COLLECTION = 'incidents';
  
  /**
   * Create a new incident
   */
  async createIncident(data: Partial<Incident>): Promise<string> {
    try {
      console.log('[Incident Module] Creating new incident');
      
      const incidentData = {
        ...data,
        isActive: true,
        isSilenced: false,
        isFavorited: false,
        isBookmarked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updates: [],
        responses: []
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), incidentData);
      console.log('[Incident Module] Incident created:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('[Incident Module] Failed to create incident:', error);
      throw error;
    }
  }

  /**
   * Get incident by ID
   */
  async getIncident(id: string): Promise<Incident | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.formatIncident(docSnap.id, docSnap.data());
      }
      
      return null;
    } catch (error) {
      console.error('[Incident Module] Failed to get incident:', error);
      throw error;
    }
  }

  /**
   * Get all incidents with optional filters
   */
  async getIncidents(filters?: IncidentFilters): Promise<Incident[]> {
    try {
      let q: Query<DocumentData> = collection(db, this.COLLECTION);
      
      // Apply filters
      if (filters) {
        const constraints = [];
        
        if (filters.type) constraints.push(where('type', '==', filters.type));
        if (filters.level) constraints.push(where('level', '==', filters.level));
        if (filters.isActive !== undefined) constraints.push(where('isActive', '==', filters.isActive));
        if (filters.isFavorited !== undefined) constraints.push(where('isFavorited', '==', filters.isFavorited));
        if (filters.assignedTo) constraints.push(where('assignedTo', 'array-contains', filters.assignedTo));
        if (filters.city) constraints.push(where('city', '==', filters.city));
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        q = query(collection(db, this.COLLECTION), ...constraints);
      } else {
        q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.formatIncident(doc.id, doc.data()));
    } catch (error) {
      console.error('[Incident Module] Failed to get incidents:', error);
      throw error;
    }
  }

  /**
   * Get recent incidents (last 4 hours)
   */
  async getRecentIncidents(limitCount: number = 10): Promise<Incident[]> {
    try {
      const fourHoursAgo = new Date();
      fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);
      
      const q = query(
        collection(db, this.COLLECTION),
        where('createdAt', '>=', Timestamp.fromDate(fourHoursAgo)),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.formatIncident(doc.id, doc.data()));
    } catch (error) {
      console.error('[Incident Module] Failed to get recent incidents:', error);
      throw error;
    }
  }

  /**
   * Subscribe to incident updates
   */
  subscribeToIncident(id: string, callback: (incident: Incident | null) => void): () => void {
    const docRef = doc(db, this.COLLECTION, id);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(this.formatIncident(doc.id, doc.data()));
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('[Incident Module] Subscription error:', error);
      callback(null);
    });
  }

  /**
   * Subscribe to all incidents
   */
  subscribeToIncidents(callback: (incidents: Incident[]) => void, filters?: IncidentFilters): () => void {
    let q: Query<DocumentData> = collection(db, this.COLLECTION);
    
    if (filters) {
      const constraints = [];
      if (filters.type) constraints.push(where('type', '==', filters.type));
      if (filters.isActive !== undefined) constraints.push(where('isActive', '==', filters.isActive));
      constraints.push(orderBy('createdAt', 'desc'));
      q = query(collection(db, this.COLLECTION), ...constraints);
    } else {
      q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
    }
    
    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => this.formatIncident(doc.id, doc.data()));
      callback(incidents);
    }, (error) => {
      console.error('[Incident Module] Subscription error:', error);
      callback([]);
    });
  }

  /**
   * Update incident
   */
  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    try {
      console.log('[Incident Module] Updating incident:', id);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, this.COLLECTION, id), updateData);
      console.log('[Incident Module] Incident updated');
    } catch (error) {
      console.error('[Incident Module] Failed to update incident:', error);
      throw error;
    }
  }

  /**
   * Add update to incident
   */
  async addIncidentUpdate(incidentId: string, update: Omit<IncidentUpdate, 'id' | 'timestamp'>): Promise<void> {
    try {
      const incident = await this.getIncident(incidentId);
      if (!incident) throw new Error('Incident not found');
      
      const newUpdate: IncidentUpdate = {
        ...update,
        id: Date.now().toString(),
        timestamp: new Date()
      };
      
      const updates = [...(incident.updates || []), newUpdate];
      
      await this.updateIncident(incidentId, { updates });
      console.log('[Incident Module] Update added to incident');
    } catch (error) {
      console.error('[Incident Module] Failed to add update:', error);
      throw error;
    }
  }

  /**
   * Add chaser response
   */
  async addChaserResponse(incidentId: string, response: Omit<ChaserResponse, 'timestamp'>): Promise<void> {
    try {
      const incident = await this.getIncident(incidentId);
      if (!incident) throw new Error('Incident not found');
      
      const newResponse: ChaserResponse = {
        ...response,
        timestamp: new Date()
      };
      
      const responses = [...(incident.responses || []), newResponse];
      
      await this.updateIncident(incidentId, { responses });
      console.log('[Incident Module] Chaser response added');
    } catch (error) {
      console.error('[Incident Module] Failed to add response:', error);
      throw error;
    }
  }

  /**
   * Toggle incident favorite status
   */
  async toggleFavorite(id: string): Promise<void> {
    try {
      const incident = await this.getIncident(id);
      if (!incident) throw new Error('Incident not found');
      
      await this.updateIncident(id, { isFavorited: !incident.isFavorited });
      console.log('[Incident Module] Favorite toggled');
    } catch (error) {
      console.error('[Incident Module] Failed to toggle favorite:', error);
      throw error;
    }
  }

  /**
   * Toggle incident silence status
   */
  async toggleSilence(id: string): Promise<void> {
    try {
      const incident = await this.getIncident(id);
      if (!incident) throw new Error('Incident not found');
      
      await this.updateIncident(id, { isSilenced: !incident.isSilenced });
      console.log('[Incident Module] Silence toggled');
    } catch (error) {
      console.error('[Incident Module] Failed to toggle silence:', error);
      throw error;
    }
  }

  /**
   * Assign incident to chasers
   */
  async assignIncident(id: string, chaserIds: string[]): Promise<void> {
    try {
      await this.updateIncident(id, { assignedTo: chaserIds });
      console.log('[Incident Module] Incident assigned to:', chaserIds);
    } catch (error) {
      console.error('[Incident Module] Failed to assign incident:', error);
      throw error;
    }
  }

  /**
   * Update homeowner information
   */
  async updateHomeownerInfo(id: string, homeownerInfo: HomeownerInfo): Promise<void> {
    try {
      await this.updateIncident(id, { homeownerInfo });
      console.log('[Incident Module] Homeowner info updated');
    } catch (error) {
      console.error('[Incident Module] Failed to update homeowner info:', error);
      throw error;
    }
  }

  /**
   * Delete incident
   */
  async deleteIncident(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, id));
      console.log('[Incident Module] Incident deleted:', id);
    } catch (error) {
      console.error('[Incident Module] Failed to delete incident:', error);
      throw error;
    }
  }

  /**
   * Format Firestore document to Incident type
   */
  private formatIncident(id: string, data: DocumentData): Incident {
    return {
      id,
      title: data.title || 'Untitled Incident',
      type: data.type || 'unknown',
      level: data.level || 'low',
      address: data.address || '',
      city: data.city,
      state: data.state,
      lat: data.lat,
      lng: data.lng,
      source: data.source,
      isHomeFire: data.isHomeFire || false,
      isActive: data.isActive ?? true,
      isSilenced: data.isSilenced || false,
      isFavorited: data.isFavorited || false,
      isBookmarked: data.isBookmarked || false,
      description: data.description,
      reportedBy: data.reportedBy,
      assignedTo: data.assignedTo || [],
      images: data.images || [],
      videos: data.videos || [],
      audioNotes: data.audioNotes || [],
      updates: data.updates || [],
      responses: data.responses || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      homeownerInfo: data.homeownerInfo,
      weatherConditions: data.weatherConditions
    };
  }
}

// Export singleton instance
export const incidentModule = new IncidentModule();

// Export convenience methods
export const {
  createIncident,
  getIncident,
  getIncidents,
  getRecentIncidents,
  subscribeToIncident,
  subscribeToIncidents,
  updateIncident,
  addIncidentUpdate,
  addChaserResponse,
  toggleFavorite,
  toggleSilence,
  assignIncident,
  updateHomeownerInfo,
  deleteIncident
} = incidentModule;
