/**
 * Database Module
 * Centralizes Firestore database operations and utilities
 */

import {
  Firestore,
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
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  enableIndexedDbPersistence,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface PaginationOptions {
  pageSize: number;
  lastDocument?: DocumentSnapshot;
}

export interface QueryOptions {
  filters?: Array<{ field: string; operator: any; value: any }>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitTo?: number;
  startAfterDoc?: DocumentSnapshot;
}

export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: any;
}

class DatabaseModule {
  private db: Firestore;
  private offlineEnabled: boolean = true; // Persistence is now handled at initialization

  constructor() {
    this.db = db;
    // Offline persistence is configured at Firestore initialization level
    // in firebase.ts using initializeFirestore with persistentLocalCache
    console.log('[Database Module] Using persistent cache configured at initialization');
  }

  /**
   * Get a single document by ID
   */
  async getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`[Database Module] Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple documents with query options
   */
  async getDocuments<T>(collectionName: string, options?: QueryOptions): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Apply filters
      if (options?.filters) {
        options.filters.forEach(filter => {
          constraints.push(where(filter.field, filter.operator, filter.value));
        });
      }
      
      // Apply ordering
      if (options?.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
      }
      
      // Apply pagination
      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc));
      }
      
      // Apply limit
      if (options?.limitTo) {
        constraints.push(limit(options.limitTo));
      }
      
      const q = query(collection(this.db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`[Database Module] Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async createDocument<T extends { [key: string]: any }>(
    collectionName: string,
    data: T,
    customId?: string
  ): Promise<string> {
    try {
      const timestamp = serverTimestamp();
      const documentData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      if (customId) {
        await setDoc(doc(this.db, collectionName, customId), documentData);
        return customId;
      } else {
        const docRef = doc(collection(this.db, collectionName));
        await setDoc(docRef, documentData);
        return docRef.id;
      }
    } catch (error) {
      console.error(`[Database Module] Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(
    collectionName: string,
    documentId: string,
    updates: { [key: string]: any }
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`[Database Module] Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, collectionName, documentId));
    } catch (error) {
      console.error(`[Database Module] Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a single document
   */
  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
  ): () => void {
    const docRef = doc(this.db, collectionName, documentId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`[Database Module] Subscription error for ${collectionName}/${documentId}:`, error);
      callback(null);
    });
  }

  /**
   * Subscribe to a collection with query options
   */
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    options?: QueryOptions
  ): () => void {
    const constraints: QueryConstraint[] = [];
    
    // Apply filters
    if (options?.filters) {
      options.filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Apply ordering
    if (options?.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    // Apply limit
    if (options?.limitTo) {
      constraints.push(limit(options.limitTo));
    }
    
    const q = query(collection(this.db, collectionName), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    }, (error) => {
      console.error(`[Database Module] Subscription error for ${collectionName}:`, error);
      callback([]);
    });
  }

  /**
   * Perform multiple operations in a batch
   */
  async batchOperations(operations: BatchOperation[]): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      operations.forEach(op => {
        const docRef = doc(this.db, op.collection, op.id);
        
        switch (op.type) {
          case 'set':
            batch.set(docRef, {
              ...op.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });
      
      await batch.commit();
      console.log(`[Database Module] Batch operations completed: ${operations.length} operations`);
    } catch (error) {
      console.error('[Database Module] Batch operations failed:', error);
      throw error;
    }
  }

  /**
   * Run a transaction
   */
  async runTransaction<T>(
    transactionFn: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(this.db, transactionFn);
    } catch (error) {
      console.error('[Database Module] Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Convert date to Firestore timestamp
   */
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Convert Firestore timestamp to date
   */
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  /**
   * Enable offline mode
   */
  async goOffline(): Promise<void> {
    try {
      await disableNetwork(this.db);
      console.log('[Database Module] Offline mode enabled');
    } catch (error) {
      console.error('[Database Module] Failed to enable offline mode:', error);
      throw error;
    }
  }

  /**
   * Disable offline mode
   */
  async goOnline(): Promise<void> {
    try {
      await enableNetwork(this.db);
      console.log('[Database Module] Online mode restored');
    } catch (error) {
      console.error('[Database Module] Failed to restore online mode:', error);
      throw error;
    }
  }

  /**
   * Clear offline cache
   */
  async clearOfflineCache(): Promise<void> {
    try {
      await clearIndexedDbPersistence(this.db);
      console.log('[Database Module] Offline cache cleared');
    } catch (error) {
      console.error('[Database Module] Failed to clear offline cache:', error);
      throw error;
    }
  }

  /**
   * Get collection reference
   */
  getCollectionRef(collectionName: string): CollectionReference {
    return collection(this.db, collectionName);
  }

  /**
   * Get document reference
   */
  getDocumentRef(collectionName: string, documentId: string): DocumentReference {
    return doc(this.db, collectionName, documentId);
  }
}

// Export singleton instance
export const databaseModule = new DatabaseModule();

// Export convenience methods
export const {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  batchOperations,
  runTransaction,
  dateToTimestamp,
  timestampToDate,
  goOffline,
  goOnline,
  clearOfflineCache,
  getCollectionRef,
  getDocumentRef
} = databaseModule;
