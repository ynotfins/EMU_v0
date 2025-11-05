/**
 * Firebase Incident Repository Implementation
 * 
 * Implements IIncidentRepository using Firebase Admin SDK.
 * Supports real-time subscriptions for incidents.
 */

import { injectable } from 'inversify';
import {
  Timestamp as FirestoreTimestamp,
  Query,
  DocumentData,
  QuerySnapshot,
  CollectionReference,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  onSnapshot,
  deleteDoc,
  setDoc,
  collection
} from 'firebase-admin/firestore';
import {
  Incident,
  IncidentStatus,
  IncidentType,
  IncidentPriority
} from '@domain/entities/incident/incident.entity';
import {
  IncidentId,
  UserId,
  Timestamp
} from '@domain/shared/value-objects';
import {
  IIncidentRepository,
  IncidentFilter,
  IncidentSort,
  LocationBounds,
  Pagination,
  PaginatedResult
} from '@domain/repositories';
import { Either, left, right } from '@domain/shared/errors';
import { adminDb } from '@/lib/firebase-admin';
import { IncidentMapper, IncidentDocument } from '../mappers/incident.mapper';
import * as geofire from 'geofire-common';

@injectable()
export class FirebaseIncidentRepository implements IIncidentRepository {
  private readonly collection = 'incidents';

  async save(incident: Incident): Promise<Either<Error, void>> {
    try {
      const document = IncidentMapper.toDocument(incident);
      const docRef = adminDb.collection(this.collection).doc(incident.id.value);
      
      await adminDb.runTransaction(async (transaction) => {
        const existingDoc = await transaction.get(docRef);

        // Check version for optimistic concurrency control
        if (existingDoc.exists()) {
          const existingVersion = existingDoc.data().version || 0;
          if (existingVersion !== incident.version - 1) {
            throw new Error('Concurrency conflict: Incident has been modified');
          }
        }

        transaction.set(docRef, document);
      });

      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to save incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findById(id: IncidentId): Promise<Either<Error, Incident | null>> {
    try {
      const docRef = adminDb.collection(this.collection).doc(id.value);
      const docSnap = await docRef.get();

      if (!docSnap.exists()) {
        return right(null);
      }

      const incident = IncidentMapper.toDomain(docSnap.data() as IncidentDocument);
      return right(incident);
    } catch (error) {
      return left(new Error(`Failed to find incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findByIds(ids: IncidentId[]): Promise<Either<Error, Incident[]>> {
    try {
      if (ids.length === 0) {
        return right([]);
      }

      // Firestore has a limit of 10 for 'in' queries
      const chunks = this.chunkArray(ids, 10);
      const incidents: Incident[] = [];

      for (const chunk of chunks) {
        const q = query(
          collection(adminDb, this.collection),
          where('id', 'in', chunk.map(id => id.value))
        );

        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          incidents.push(IncidentMapper.toDomain(doc.data() as IncidentDocument));
        });
      }

      return right(incidents);
    } catch (error) {
      return left(new Error(`Failed to find incidents by ids: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findMany(
    filter?: IncidentFilter,
    sort?: IncidentSort,
    pagination?: Pagination
  ): Promise<Either<Error, PaginatedResult<Incident>>> {
    try {
      let q: Query<DocumentData> = collection(adminDb, this.collection);

      // Apply filters
      if (filter) {
        if (filter.status) {
          const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
          q = query(q, where('status', 'in', statusArray));
        }
        
        if (filter.type) {
          const typeArray = Array.isArray(filter.type) ? filter.type : [filter.type];
          q = query(q, where('type', 'in', typeArray));
        }

        if (filter.priority) {
          const priorityArray = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
          q = query(q, where('priority', 'in', priorityArray));
        }

        if (filter.reportedBy) {
          q = query(q, where('reportedBy', '==', filter.reportedBy.value));
        }

        if (filter.assignedSupe) {
          q = query(q, where('assignedSupes', 'array-contains', filter.assignedSupe.value));
        }

        if (filter.assignedChaser) {
          // This is more complex - need to check chaserResponses keys
          // For now, we'll filter in memory after fetching
        }

        if (filter.createdAfter) {
          q = query(q, where('createdAt', '>=', 
            FirestoreTimestamp.fromDate(new Date(filter.createdAfter.value))));
        }

        if (filter.createdBefore) {
          q = query(q, where('createdAt', '<=', 
            FirestoreTimestamp.fromDate(new Date(filter.createdBefore.value))));
        }
      }

      // Apply sorting
      if (sort) {
        q = query(q, orderBy(sort.field, sort.direction));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Get total count
      const countSnapshot = await getDocs(q);
      let allDocs = countSnapshot.docs;

      // Apply in-memory filters if needed
      if (filter?.assignedChaser) {
        allDocs = allDocs.filter(doc => {
          const data = doc.data() as IncidentDocument;
          return filter.assignedChaser!.value in data.chaserResponses;
        });
      }

      if (filter?.search) {
        const searchLower = filter.search.toLowerCase();
        allDocs = allDocs.filter(doc => {
          const data = doc.data() as IncidentDocument;
          return data.description.toLowerCase().includes(searchLower) ||
                 data.location.address.toLowerCase().includes(searchLower);
        });
      }

      const total = allDocs.length;

      // Apply pagination
      const pageSize = pagination?.pageSize || 20;
      const page = pagination?.page || 1;
      const offset = (page - 1) * pageSize;

      const paginatedDocs = allDocs.slice(offset, offset + pageSize);
      const incidents = paginatedDocs.map(doc => 
        IncidentMapper.toDomain(doc.data() as IncidentDocument)
      );

      return right({
        items: incidents,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      return left(new Error(`Failed to find incidents: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findWithinBounds(
    bounds: LocationBounds,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>> {
    try {
      // Calculate geohash bounds
      const lower = geofire.geohashForLocation([bounds.southWest.lat, bounds.southWest.lng]);
      const upper = geofire.geohashForLocation([bounds.northEast.lat, bounds.northEast.lng]);

      let q: Query<DocumentData> = collection(adminDb, this.collection);
      
      // Geohash query
      q = query(q, 
        where('location.geohash', '>=', lower),
        where('location.geohash', '<=', upper)
      );

      // Apply additional filters
      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (statusArray.length === 1) {
          q = query(q, where('status', '==', statusArray[0]));
        }
      }

      const snapshot = await getDocs(q);
      let incidents = snapshot.docs.map(doc => 
        IncidentMapper.toDomain(doc.data() as IncidentDocument)
      );

      // Further filter by exact bounds (geohash is approximate)
      incidents = incidents.filter(incident => {
        const lat = incident.location.lat;
        const lng = incident.location.lng;
        return lat >= bounds.southWest.lat && lat <= bounds.northEast.lat &&
               lng >= bounds.southWest.lng && lng <= bounds.northEast.lng;
      });

      // Apply remaining filters in memory
      if (filter?.status && Array.isArray(filter.status) && filter.status.length > 1) {
        incidents = incidents.filter(i => filter.status!.includes(i.status));
      }

      return right(incidents);
    } catch (error) {
      return left(new Error(`Failed to find incidents within bounds: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findNearLocation(
    lat: number,
    lng: number,
    radiusKm: number,
    filter?: IncidentFilter
  ): Promise<Either<Error, Array<{ incident: Incident; distance: number }>>> {
    try {
      // Get geohash bounds for radius query
      const bounds = geofire.geohashQueryBounds([lat, lng], radiusKm * 1000);
      const promises: Promise<QuerySnapshot<DocumentData>>[] = [];

      for (const b of bounds) {
        let q = query(
          collection(adminDb, this.collection),
          orderBy('location.geohash'),
          startAfter(b[0]),
          limit(100) // Limit each query
        );

        if (filter?.status) {
          const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
          if (statusArray.length === 1) {
            q = query(q, where('status', '==', statusArray[0]));
          }
        }

        promises.push(getDocs(q));
      }

      const snapshots = await Promise.all(promises);
      const results: Array<{ incident: Incident; distance: number }> = [];

      for (const snapshot of snapshots) {
        for (const docSnap of snapshot.docs) {
          const incident = IncidentMapper.toDomain(docSnap.data() as IncidentDocument);
          
          // Calculate exact distance
          const distance = incident.location.distanceTo(
            incident.location.constructor.unsafeCreate({ lat, lng, address: '' })
          );

          if (distance <= radiusKm) {
            results.push({ incident, distance });
          }
        }
      }

      // Apply additional filters
      let filtered = results;
      if (filter?.status && Array.isArray(filter.status) && filter.status.length > 1) {
        filtered = filtered.filter(r => filter.status!.includes(r.incident.status));
      }

      // Sort by distance
      filtered.sort((a, b) => a.distance - b.distance);

      return right(filtered);
    } catch (error) {
      return left(new Error(`Failed to find incidents near location: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findByChaserId(
    chaserId: UserId,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>> {
    try {
      // Firestore doesn't support querying map keys directly
      // We need to fetch all and filter in memory
      let q: Query<DocumentData> = collection(adminDb, this.collection);

      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        q = query(q, where('status', 'in', statusArray));
      }

      const snapshot = await getDocs(q);
      const incidents = snapshot.docs
        .map(doc => IncidentMapper.toDomain(doc.data() as IncidentDocument))
        .filter(incident => incident.isChaserAssigned(chaserId));

      return right(incidents);
    } catch (error) {
      return left(new Error(`Failed to find incidents by chaser: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findBySupeId(
    supeId: UserId,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>> {
    try {
      let q: Query<DocumentData> = collection(adminDb, this.collection);
      
      q = query(q, where('assignedSupes', 'array-contains', supeId.value));

      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        q = query(q, where('status', 'in', statusArray));
      }

      const snapshot = await getDocs(q);
      const incidents = snapshot.docs.map(doc => 
        IncidentMapper.toDomain(doc.data() as IncidentDocument)
      );

      return right(incidents);
    } catch (error) {
      return left(new Error(`Failed to find incidents by supe: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async getStatistics(filter?: IncidentFilter): Promise<Either<Error, {
    total: number;
    byStatus: Record<IncidentStatus, number>;
    byType: Record<IncidentType, number>;
    byPriority: Record<IncidentPriority, number>;
    averageResponseTime?: number;
    averageResolutionTime?: number;
  }>> {
    try {
      let q: Query<DocumentData> = collection(adminDb, this.collection);

      // Apply filters
      if (filter?.createdAfter) {
        q = query(q, where('createdAt', '>=', 
          FirestoreTimestamp.fromDate(new Date(filter.createdAfter.value))));
      }
      if (filter?.createdBefore) {
        q = query(q, where('createdAt', '<=', 
          FirestoreTimestamp.fromDate(new Date(filter.createdBefore.value))));
      }

      const snapshot = await getDocs(q);
      const incidents = snapshot.docs.map(doc => 
        IncidentMapper.toDomain(doc.data() as IncidentDocument)
      );

      // Calculate statistics
      const stats = {
        total: incidents.length,
        byStatus: {} as Record<IncidentStatus, number>,
        byType: {} as Record<IncidentType, number>,
        byPriority: {} as Record<IncidentPriority, number>,
        averageResponseTime: undefined as number | undefined,
        averageResolutionTime: undefined as number | undefined,
      };

      // Initialize counters
      Object.values(IncidentStatus).forEach(status => stats.byStatus[status] = 0);
      Object.values(IncidentType).forEach(type => stats.byType[type] = 0);
      Object.values(IncidentPriority).forEach(priority => stats.byPriority[priority] = 0);

      // Count incidents
      let totalResponseTime = 0;
      let responseCount = 0;
      let totalResolutionTime = 0;
      let resolutionCount = 0;

      incidents.forEach(incident => {
        stats.byStatus[incident.status]++;
        stats.byType[incident.type]++;
        stats.byPriority[incident.priority]++;

        // Calculate average response time
        const responses = incident.chaserResponses;
        responses.forEach(response => {
          if (response.actualArrival) {
            const responseTime = response.actualArrival.diffFrom(incident.createdAt);
            totalResponseTime += responseTime;
            responseCount++;
          }
        });

        // Calculate average resolution time
        if (incident.resolvedAt) {
          const resolutionTime = incident.resolvedAt.diffFrom(incident.createdAt);
          totalResolutionTime += resolutionTime;
          resolutionCount++;
        }
      });

      if (responseCount > 0) {
        stats.averageResponseTime = totalResponseTime / responseCount;
      }

      if (resolutionCount > 0) {
        stats.averageResolutionTime = totalResolutionTime / resolutionCount;
      }

      return right(stats);
    } catch (error) {
      return left(new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async subscribeToIncident(
    id: IncidentId,
    callback: (incident: Incident) => void
  ): Promise<Either<Error, () => void>> {
    try {
      const docRef = doc(adminDb, this.collection, id.value);
      
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const incident = IncidentMapper.toDomain(snapshot.data() as IncidentDocument);
          callback(incident);
        }
      }, (error) => {
        console.error('Incident subscription error:', error);
      });

      return right(unsubscribe);
    } catch (error) {
      return left(new Error(`Failed to subscribe to incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async subscribeToIncidents(
    filter: IncidentFilter,
    callback: (incidents: Incident[]) => void
  ): Promise<Either<Error, () => void>> {
    try {
      let q: Query<DocumentData> = collection(adminDb, this.collection);

      // Apply filters
      if (filter.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (statusArray.length === 1) {
          q = query(q, where('status', '==', statusArray[0]));
        }
      }

      if (filter.type) {
        const typeArray = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (typeArray.length === 1) {
          q = query(q, where('type', '==', typeArray[0]));
        }
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'), limit(50));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const incidents = snapshot.docs.map(doc => 
          IncidentMapper.toDomain(doc.data() as IncidentDocument)
        );

        // Apply in-memory filters for complex conditions
        let filtered = incidents;
        
        if (filter.status && Array.isArray(filter.status) && filter.status.length > 1) {
          filtered = filtered.filter(i => filter.status!.includes(i.status));
        }

        if (filter.assignedChaser) {
          filtered = filtered.filter(i => i.isChaserAssigned(filter.assignedChaser!));
        }

        callback(filtered);
      }, (error) => {
        console.error('Incidents subscription error:', error);
      });

      return right(unsubscribe);
    } catch (error) {
      return left(new Error(`Failed to subscribe to incidents: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async delete(id: IncidentId): Promise<Either<Error, void>> {
    try {
      const docRef = doc(adminDb, this.collection, id.value);
      await deleteDoc(docRef);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async archiveOlderThan(date: Timestamp): Promise<Either<Error, number>> {
    try {
      const q = query(
        collection(adminDb, this.collection),
        where('createdAt', '<', FirestoreTimestamp.fromDate(new Date(date.value))),
        where('status', 'in', [IncidentStatus.RESOLVED, IncidentStatus.CANCELLED])
      );

      const snapshot = await getDocs(q);
      
      // Archive to a different collection
      const archivePromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        
        // Save to archive collection
        await setDoc(doc(adminDb, 'archived_incidents', docSnap.id), {
          ...data,
          archivedAt: FirestoreTimestamp.now(),
        });
        
        // Delete from main collection
        await deleteDoc(docSnap.ref);
      });

      await Promise.all(archivePromises);

      return right(snapshot.size);
    } catch (error) {
      return left(new Error(`Failed to archive incidents: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  // Transaction support
  async beginTransaction(): Promise<any> {
    return { useTransaction: true };
  }

  async commitTransaction(transaction: any): Promise<Either<Error, void>> {
    return right(undefined);
  }

  async rollbackTransaction(transaction: any): Promise<Either<Error, void>> {
    return right(undefined);
  }

  // Helper method to chunk arrays
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
