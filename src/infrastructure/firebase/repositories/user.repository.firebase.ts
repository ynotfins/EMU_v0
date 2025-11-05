/**
 * Firebase User Repository Implementation
 * 
 * Implements IUserRepository using Firebase Admin SDK.
 */

import { injectable } from 'inversify';
import { 
  GeoPoint,
  Timestamp as FirestoreTimestamp,
  Query,
  DocumentData,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  setDoc,
  collection
} from 'firebase-admin/firestore';
import { User } from '@domain/entities/user/user.entity';
import { UserId, Email, Role, Location } from '@domain/shared/value-objects';
import { 
  IUserRepository, 
  UserFilter, 
  UserSort, 
  Pagination, 
  PaginatedResult 
} from '@domain/repositories';
import { Either, left, right } from '@domain/shared/errors';
import { adminDb } from '../config/firebase-admin.config';
import { UserMapper, UserDocument } from '../mappers/user.mapper';

@injectable()
export class FirebaseUserRepository implements IUserRepository {
  private readonly collection = 'users';

  async save(user: User): Promise<Either<Error, void>> {
    try {
      const document = UserMapper.toDocument(user);
      const docRef = adminDb.collection(this.collection).doc(user.id.value);
      
      await adminDb.runTransaction(async (transaction) => {
        const existingDoc = await transaction.get(docRef);
        
        // Check version for optimistic concurrency control
        if (existingDoc.exists()) {
          const existingVersion = existingDoc.data().version || 0;
          if (existingVersion !== user.version - 1) {
            throw new Error('Concurrency conflict: User has been modified');
          }
        }
        
        transaction.set(docRef, document);
      });
      
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to save user: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findById(id: UserId): Promise<Either<Error, User | null>> {
    try {
      const docRef = adminDb.collection(this.collection).doc(id.value);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists()) {
        return right(null);
      }
      
      const user = UserMapper.toDomain(docSnap.data() as UserDocument);
      return right(user);
    } catch (error) {
      return left(new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findByEmail(email: Email): Promise<Either<Error, User | null>> {
    try {
      const snapshot = await adminDb
        .collection(this.collection)
        .where('email', '==', email.value)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return right(null);
      }
      
      const user = UserMapper.toDomain(snapshot.docs[0].data() as UserDocument);
      return right(user);
    } catch (error) {
      return left(new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findByIds(ids: UserId[]): Promise<Either<Error, User[]>> {
    try {
      if (ids.length === 0) {
        return right([]);
      }
      
      // Firestore has a limit of 10 for 'in' queries
      const chunks = this.chunkArray(ids, 10);
      const users: User[] = [];
      
      for (const chunk of chunks) {
        const q = query(
          collection(adminDb, this.collection),
          where('uid', 'in', chunk.map(id => id.value))
        );
        
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          users.push(UserMapper.toDomain(doc.data() as UserDocument));
        });
      }
      
      return right(users);
    } catch (error) {
      return left(new Error(`Failed to find users by ids: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findMany(
    filter?: UserFilter,
    sort?: UserSort,
    pagination?: Pagination
  ): Promise<Either<Error, PaginatedResult<User>>> {
    try {
      let q = adminDb.collection(this.collection) as Query<DocumentData>;
      
      // Apply filters
      if (filter) {
        if (filter.role) {
          q = q.where('role', '==', filter.role.value);
        }
        if (filter.status) {
          q = q.where('status', '==', filter.status);
        }
        if (filter.emailVerified !== undefined) {
          q = q.where('emailVerified', '==', filter.emailVerified);
        }
        // Note: Full-text search is limited in Firestore
        // For production, consider using Algolia or Elasticsearch
      }
      
      // Apply sorting
      if (sort) {
        q = q.orderBy(sort.field, sort.direction);
      } else {
        q = q.orderBy('createdAt', 'desc');
      }
      
      // Get total count (expensive operation in Firestore)
      const countSnapshot = await q.get();
      const total = countSnapshot.size;
      
      // Apply pagination
      const pageSize = pagination?.pageSize || 20;
      const page = pagination?.page || 1;
      const offset = (page - 1) * pageSize;
      
      if (offset > 0) {
        const offsetDoc = countSnapshot.docs[offset - 1];
        if (offsetDoc) {
          q = q.startAfter(offsetDoc);
        }
      }
      
      q = q.limit(pageSize);
      
      // Execute paginated query
      const snapshot = await q.get();
      const users = snapshot.docs.map(doc => 
        UserMapper.toDomain(doc.data() as UserDocument)
      );
      
      return right({
        items: users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      return left(new Error(`Failed to find users: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async existsByEmail(email: Email): Promise<Either<Error, boolean>> {
    try {
      const snapshot = await adminDb
        .collection(this.collection)
        .where('email', '==', email.value)
        .limit(1)
        .get();
      return right(!snapshot.empty);
    } catch (error) {
      return left(new Error(`Failed to check email existence: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async delete(id: UserId): Promise<Either<Error, void>> {
    try {
      const docRef = adminDb.collection(this.collection).doc(id.value);
      await docRef.delete();
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findByRole(role: Role): Promise<Either<Error, User[]>> {
    try {
      const snapshot = await adminDb
        .collection(this.collection)
        .where('role', '==', role.value)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .get();
      const users = snapshot.docs.map(doc => 
        UserMapper.toDomain(doc.data() as UserDocument)
      );
      
      return right(users);
    } catch (error) {
      return left(new Error(`Failed to find users by role: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async findActiveChasersNearLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<Either<Error, Array<{ user: User; distance: number }>>> {
    try {
      // Firestore doesn't have native geospatial queries
      // For production, use GeoFirestore or similar library
      // For now, we'll fetch all active chasers and filter in memory
      
      const snapshot = await adminDb
        .collection(this.collection)
        .where('role', '==', 'chaser')
        .where('status', '==', 'active')
        .where('settings.locationSharingEnabled', '==', true)
        .get();
      const results: Array<{ user: User; distance: number }> = [];
      
      for (const docSnap of snapshot.docs) {
        const user = UserMapper.toDomain(docSnap.data() as UserDocument);
        
        if (user.lastLocation) {
          const distance = user.lastLocation.distanceTo(
            Location.unsafeCreate({ lat, lng, address: '' })
          );
          
          if (distance <= radiusKm) {
            results.push({ user, distance });
          }
        }
      }
      
      // Sort by distance
      results.sort((a, b) => a.distance - b.distance);
      
      return right(results);
    } catch (error) {
      return left(new Error(`Failed to find chasers near location: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async updateLastLogin(id: UserId): Promise<Either<Error, void>> {
    try {
      const docRef = doc(adminDb, this.collection, id.value);
      await setDoc(docRef, {
        lastLogin: FirestoreTimestamp.now(),
        updatedAt: FirestoreTimestamp.now(),
      }, { merge: true });
      
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to update last login: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  async updateLocation(id: UserId, lat: number, lng: number): Promise<Either<Error, void>> {
    try {
      const docRef = doc(adminDb, this.collection, id.value);
      await setDoc(docRef, {
        lastLocation: {
          lat,
          lng,
          timestamp: FirestoreTimestamp.now(),
        },
        updatedAt: FirestoreTimestamp.now(),
      }, { merge: true });
      
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  // Transaction support
  async beginTransaction(): Promise<any> {
    // Firestore transactions are created per operation
    // Return a marker that indicates transaction mode
    return { useTransaction: true };
  }

  async commitTransaction(transaction: any): Promise<Either<Error, void>> {
    // Firestore automatically commits when the transaction function completes
    return right(undefined);
  }

  async rollbackTransaction(transaction: any): Promise<Either<Error, void>> {
    // Firestore automatically rolls back on error
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
