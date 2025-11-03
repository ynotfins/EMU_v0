/**
 * User Mapper
 * 
 * Maps between domain User entity and Firebase document structure.
 */

import { Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { 
  UserId, 
  Email, 
  Role,
  Timestamp,
  Location
} from '@domain/shared/value-objects';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  lastLogin?: FirestoreTimestamp;
  lastLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: FirestoreTimestamp;
  };
  settings: {
    maxResponseDistance?: number;
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
    autoAcceptIncidents?: boolean;
    locationSharingEnabled?: boolean;
  };
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  version: number;
}

export class UserMapper {
  /**
   * Maps a domain User entity to a Firebase document
   */
  static toDocument(user: User): UserDocument {
    const props = user.toPersistence();
    
    const doc: UserDocument = {
      uid: props.id.value,
      email: props.email.value,
      displayName: props.displayName,
      role: props.role.value,
      status: props.status,
      photoURL: props.photoURL,
      phoneNumber: props.phoneNumber,
      emailVerified: props.emailVerified,
      settings: props.settings,
      createdAt: FirestoreTimestamp.fromDate(new Date(props.createdAt.value)),
      updatedAt: FirestoreTimestamp.fromDate(new Date(props.updatedAt.value)),
      version: props.version,
    };

    // Add optional fields
    if (props.lastLogin) {
      doc.lastLogin = FirestoreTimestamp.fromDate(new Date(props.lastLogin.value));
    }

    if (props.lastLocation) {
      doc.lastLocation = {
        lat: props.lastLocation.lat,
        lng: props.lastLocation.lng,
        address: props.lastLocation.address,
        timestamp: FirestoreTimestamp.now(),
      };
    }

    return doc;
  }

  /**
   * Maps a Firebase document to a domain User entity
   */
  static toDomain(doc: UserDocument): User {
    // Create value objects
    const userId = UserId.unsafeFromString(doc.uid);
    const email = Email.unsafeCreate(doc.email);
    const role = Role.unsafeCreate(doc.role as any);
    const createdAt = Timestamp.fromUnixTimestamp(doc.createdAt.toMillis()).getOrElseThrow();
    const updatedAt = Timestamp.fromUnixTimestamp(doc.updatedAt.toMillis()).getOrElseThrow();

    let lastLogin: Timestamp | undefined;
    if (doc.lastLogin) {
      lastLogin = Timestamp.fromUnixTimestamp(doc.lastLogin.toMillis()).getOrElseThrow();
    }

    let lastLocation: Location | undefined;
    if (doc.lastLocation) {
      lastLocation = Location.unsafeCreate({
        lat: doc.lastLocation.lat,
        lng: doc.lastLocation.lng,
        address: doc.lastLocation.address,
      });
    }

    return User.fromPersistence({
      id: userId,
      email,
      displayName: doc.displayName,
      role,
      status: doc.status as UserStatus,
      photoURL: doc.photoURL,
      phoneNumber: doc.phoneNumber,
      emailVerified: doc.emailVerified,
      lastLogin,
      lastLocation,
      settings: doc.settings,
      createdAt,
      updatedAt,
      version: doc.version,
    });
  }

  /**
   * Maps partial update data for Firestore update operations
   */
  static toPartialUpdate(updates: Partial<User>): Partial<UserDocument> {
    const doc: Partial<UserDocument> = {};
    
    // This would be used for specific field updates
    // Implementation depends on what can be updated
    
    return doc;
  }
}
