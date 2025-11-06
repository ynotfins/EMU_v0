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
  runTransaction as firestoreRunTransaction,
  serverTimestamp,
  Timestamp,
  CollectionReference,
  DocumentReference,
  type Transaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { logger } from '../utils/logger';

export interface PaginationOptions {
  pageSize: number;
  lastDocument?: DocumentSnapshot;
}

export interface QueryOptions {
  filters?: Array<{ field: string; operator: string; value: unknown }>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitTo?: number;
  startAfterDoc?: DocumentSnapshot;
}

export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: Record<string, unknown>;
}

class DatabaseModule {
  private db: Firestore;
  private offlineEnabled: boolean = true; // Persistence is now handled at initialization

  constructor() {
    this.db = db;
    // Offline persistence is configured at Firestore initialization level
    // in firebase.ts using initializeFirestore with persistentLocalCache
    logger.debug('Using persistent cache configured at initialization', {
      code: 'DatabaseModule',
    });
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
      logger.error(`Error getting document from ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
        documentId,
      });
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
      logger.error(`Error getting documents from ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
      });
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async createDocument<T extends Record<string, unknown>>(
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
      logger.error(`Error creating document in ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
      });
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(
    collectionName: string,
    documentId: string,
    updates: Record<string, unknown>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error(`Error updating document in ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
        documentId,
      });
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
      logger.error(`Error deleting document from ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
        documentId,
      });
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
      logger.error(`Subscription error for ${collectionName}/${documentId}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
        documentId,
      });
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
      logger.error(`Subscription error for ${collectionName}`, error, {
        code: 'DatabaseModule',
        collection: collectionName,
      });
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
      logger.debug(`Batch operations completed`, {
        code: 'DatabaseModule',
        operationCount: operations.length,
      });
    } catch (error) {
      logger.error('Batch operations failed', error, {
        code: 'DatabaseModule',
      });
      throw error;
    }
  }

  /**
   * Run a transaction
   */
  async runTransaction<T>(
    transactionFn: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    try {
      return await firestoreRunTransaction(this.db, transactionFn);
    } catch (error) {
      logger.error('Transaction failed', error, {
        code: 'DatabaseModule',
      });
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
      logger.debug('Offline mode enabled', {
        code: 'DatabaseModule',
      });
    } catch (error) {
      logger.error('Failed to enable offline mode', error, {
        code: 'DatabaseModule',
      });
      throw error;
    }
  }

  /**
   * Disable offline mode
   */
  async goOnline(): Promise<void> {
    try {
      await enableNetwork(this.db);
      logger.debug('Online mode restored', {
        code: 'DatabaseModule',
      });
    } catch (error) {
      logger.error('Failed to restore online mode', error, {
        code: 'DatabaseModule',
      });
      throw error;
    }
  }

  /**
   * Clear offline cache
   */
  async clearOfflineCache(): Promise<void> {
    try {
      await clearIndexedDbPersistence(this.db);
      logger.debug('Offline cache cleared', {
        code: 'DatabaseModule',
      });
    } catch (error) {
      logger.error('Failed to clear offline cache', error, {
        code: 'DatabaseModule',
      });
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
