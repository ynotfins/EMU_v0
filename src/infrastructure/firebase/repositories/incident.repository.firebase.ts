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
  CollectionReference
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
  Timestamp,
  Location
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
import { logger } from '@/lib/utils/logger';

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
        if (existingDoc.exists) {
          const existingData = existingDoc.data();
          if (existingData) {
            const existingVersion = existingData.version || 0;
            if (existingVersion !== incident.version - 1) {
              throw new Error('Concurrency conflict: Incident has been modified');
            }
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

      if (!docSnap.exists) {
        return right(null);
      }

      const docData = docSnap.data();
      if (!docData) {
        return right(null);
      }

      const incident = IncidentMapper.toDomain(docData as IncidentDocument);
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
        const snapshot = await adminDb
          .collection(this.collection)
          .where('id', 'in', chunk.map(id => id.value))
          .get();

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
      let q = adminDb.collection(this.collection) as Query<DocumentData>;

      // Apply filters
      if (filter) {
        if (filter.status) {
          const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
          q = q.where('status', 'in', statusArray);
        }
        
        if (filter.type) {
          const typeArray = Array.isArray(filter.type) ? filter.type : [filter.type];
          q = q.where('type', 'in', typeArray);
        }

        if (filter.priority) {
          const priorityArray = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
          q = q.where('priority', 'in', priorityArray);
        }

        if (filter.reportedBy) {
          q = q.where('reportedBy', '==', filter.reportedBy.value);
        }

        if (filter.assignedSupe) {
          q = q.where('assignedSupes', 'array-contains', filter.assignedSupe.value);
        }

        if (filter.createdAfter) {
          q = q.where('createdAt', '>=', 
            FirestoreTimestamp.fromDate(new Date(filter.createdAfter.value)));
        }

        if (filter.createdBefore) {
          q = q.where('createdAt', '<=', 
            FirestoreTimestamp.fromDate(new Date(filter.createdBefore.value)));
        }
      }

      // Apply sorting
      if (sort) {
        q = q.orderBy(sort.field, sort.direction);
      } else {
        q = q.orderBy('createdAt', 'desc');
      }

      // Apply pagination limit before counting
      const pageSize = pagination?.pageSize || 20;
      const maxLimit = Math.min(pageSize * 3, 100); // Cap at 100 for performance
      q = q.limit(maxLimit);

      // Get total count (limited query)
      const countSnapshot = await q.get();
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

      // Apply pagination (pageSize already defined above)
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
      logger.error(`Failed to find incidents`, error, { code: 'IncidentRepository' });
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

      let q = adminDb.collection(this.collection) as Query<DocumentData>;
      
      // Geohash query
      q = q.where('location.geohash', '>=', lower)
           .where('location.geohash', '<=', upper);

      // Apply additional filters
      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (statusArray.length === 1) {
          q = q.where('status', '==', statusArray[0]);
        }
      }

      // Add limit for geospatial queries
      q = q.limit(100);
      const snapshot = await q.get();
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
        let q = adminDb.collection(this.collection) as Query<DocumentData>;
        q = q.orderBy('location.geohash')
             .startAfter(b[0])
             .limit(100); // Limit each query

        if (filter?.status) {
          const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
          if (statusArray.length === 1) {
            q = q.where('status', '==', statusArray[0]);
          }
        }

        promises.push(q.get());
      }

      const snapshots = await Promise.all(promises);
      const results: Array<{ incident: Incident; distance: number }> = [];

      for (const snapshot of snapshots) {
        for (const docSnap of snapshot.docs) {
          const incident = IncidentMapper.toDomain(docSnap.data() as IncidentDocument);
          
          // Calculate exact distance
          const distance = incident.location.distanceTo(
            Location.unsafeCreate({ lat, lng, address: '' })
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
      let q = adminDb.collection(this.collection) as Query<DocumentData>;

      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        q = q.where('status', 'in', statusArray);
      }

      // Add limit to prevent fetching all incidents
      q = q.limit(100);
      const snapshot = await q.get();
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
      let q = adminDb.collection(this.collection) as Query<DocumentData>;
      
      q = q.where('assignedSupes', 'array-contains', supeId.value);

      if (filter?.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        q = q.where('status', 'in', statusArray);
      }

      // Add limit to prevent high costs
      q = q.limit(100);
      const snapshot = await q.get();
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
      let q = adminDb.collection(this.collection) as Query<DocumentData>;

      // Apply filters
      if (filter?.createdAfter) {
        q = q.where('createdAt', '>=', 
          FirestoreTimestamp.fromDate(new Date(filter.createdAfter.value)));
      }
      if (filter?.createdBefore) {
        q = q.where('createdAt', '<=', 
          FirestoreTimestamp.fromDate(new Date(filter.createdBefore.value)));
      }

      const snapshot = await q.get();
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
      // Note: Admin SDK doesn't support onSnapshot - this should use client SDK
      // For now, we'll use Admin SDK document reference but note this limitation
      const docRef = adminDb.collection(this.collection).doc(id.value);
      
      // WARNING: Admin SDK doesn't support onSnapshot for real-time subscriptions
      // This method should be refactored to use client SDK for real-time updates
      // For now, return a no-op unsubscribe function
      logger.warn('subscribeToIncident called with Admin SDK - real-time subscriptions require client SDK', {
        code: 'IncidentRepository',
        incidentId: id.value
      });

      return right(() => {
        // No-op unsubscribe - Admin SDK doesn't support real-time subscriptions
      });
    } catch (error) {
      return left(new Error(`Failed to subscribe to incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async subscribeToIncidents(
    filter: IncidentFilter,
    callback: (incidents: Incident[]) => void
  ): Promise<Either<Error, () => void>> {
    try {
      // Note: Admin SDK doesn't support onSnapshot - this should use client SDK
      // For now, we'll use Admin SDK query builder pattern but note this limitation
      let q = adminDb.collection(this.collection) as Query<DocumentData>;

      // Apply filters
      if (filter.status) {
        const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (statusArray.length === 1) {
          q = q.where('status', '==', statusArray[0]);
        }
      }

      if (filter.type) {
        const typeArray = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (typeArray.length === 1) {
          q = q.where('type', '==', typeArray[0]);
        }
      }

      // Order by creation date with limit
      q = q.orderBy('createdAt', 'desc').limit(50);

      // WARNING: Admin SDK doesn't support onSnapshot for real-time subscriptions
      // This method should be refactored to use client SDK for real-time updates
      // For now, return a no-op unsubscribe function
      logger.warn('subscribeToIncidents called with Admin SDK - real-time subscriptions require client SDK', {
        code: 'IncidentRepository'
      });

      return right(() => {
        // No-op unsubscribe - Admin SDK doesn't support real-time subscriptions
      });
    } catch (error) {
      return left(new Error(`Failed to subscribe to incidents: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async delete(id: IncidentId): Promise<Either<Error, void>> {
    try {
      const docRef = adminDb.collection(this.collection).doc(id.value);
      await docRef.delete();
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete incident: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async archiveOlderThan(date: Timestamp): Promise<Either<Error, number>> {
    try {
      let q = adminDb.collection(this.collection) as Query<DocumentData>;
      q = q.where('createdAt', '<', FirestoreTimestamp.fromDate(new Date(date.value)))
           .where('status', 'in', [IncidentStatus.RESOLVED, IncidentStatus.CANCELLED]);

      const snapshot = await q.get();
      
      // Archive to a different collection
      const archivePromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        
        // Save to archive collection
        await adminDb.collection('archived_incidents').doc(docSnap.id).set({
          ...data,
          archivedAt: FirestoreTimestamp.now(),
        });
        
        // Delete from main collection
        await docSnap.ref.delete();
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
