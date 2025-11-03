/**
 * Incident Mapper
 * 
 * Maps between domain Incident entity and Firebase document structure.
 */

import { Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';
import { 
  Incident, 
  IncidentType,
  IncidentPriority,
  IncidentStatus,
  ChaserResponseStatus,
  IncidentUpdateType,
  IncidentUpdate,
  ChaserResponse,
  HomeownerInfo
} from '@domain/entities/incident/incident.entity';
import { 
  IncidentId,
  UserId,
  Location,
  Timestamp,
  Distance
} from '@domain/shared/value-objects';

export interface IncidentDocument {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    geohash?: string;
  };
  type: string;
  priority: string;
  status: string;
  description: string;
  reportedBy: string;
  assignedSupes: string[];
  chaserResponses: {
    [userId: string]: {
      status: string;
      distance?: number;
      estimatedArrival?: FirestoreTimestamp;
      actualArrival?: FirestoreTimestamp;
      completedAt?: FirestoreTimestamp;
      notes?: string;
      lastUpdated: FirestoreTimestamp;
    };
  };
  images: string[];
  homeownerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    insuranceCarrier?: string;
    policyNumber?: string;
    notes?: string;
  };
  updates: Array<{
    id: string;
    type: string;
    userId: string;
    content: string;
    metadata?: any;
    timestamp: FirestoreTimestamp;
  }>;
  resolvedAt?: FirestoreTimestamp;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  version: number;
}

export class IncidentMapper {
  /**
   * Maps a domain Incident entity to a Firebase document
   */
  static toDocument(incident: Incident): IncidentDocument {
    const props = incident.toPersistence();
    
    // Convert chaser responses map
    const chaserResponses: IncidentDocument['chaserResponses'] = {};
    props.chaserResponses.forEach((value, key) => {
      chaserResponses[key] = {
        status: value.status,
        distance: value.distance?.kilometers,
        estimatedArrival: value.estimatedArrival 
          ? FirestoreTimestamp.fromDate(new Date(value.estimatedArrival.value))
          : undefined,
        actualArrival: value.actualArrival
          ? FirestoreTimestamp.fromDate(new Date(value.actualArrival.value))
          : undefined,
        completedAt: value.completedAt
          ? FirestoreTimestamp.fromDate(new Date(value.completedAt.value))
          : undefined,
        notes: value.notes,
        lastUpdated: FirestoreTimestamp.fromDate(new Date(value.lastUpdated.value)),
      };
    });

    const doc: IncidentDocument = {
      id: props.id.value,
      location: {
        lat: props.location.lat,
        lng: props.location.lng,
        address: props.location.address,
        city: props.location.city,
        state: props.location.state,
        zipCode: props.location.zipCode,
        country: props.location.country,
        geohash: props.location.geohash,
      },
      type: props.type,
      priority: props.priority,
      status: props.status,
      description: props.description,
      reportedBy: props.reportedBy.value,
      assignedSupes: Array.from(props.assignedSupes).map(id => id.value),
      chaserResponses,
      images: props.images,
      homeownerInfo: props.homeownerInfo,
      updates: props.updates.map(update => ({
        id: update.id,
        type: update.type,
        userId: update.userId.value,
        content: update.content,
        metadata: update.metadata,
        timestamp: FirestoreTimestamp.fromDate(new Date(update.timestamp.value)),
      })),
      createdAt: FirestoreTimestamp.fromDate(new Date(props.createdAt.value)),
      updatedAt: FirestoreTimestamp.fromDate(new Date(props.updatedAt.value)),
      version: props.version,
    };

    // Add optional fields
    if (props.resolvedAt) {
      doc.resolvedAt = FirestoreTimestamp.fromDate(new Date(props.resolvedAt.value));
    }
    if (props.resolvedBy) {
      doc.resolvedBy = props.resolvedBy.value;
    }
    if (props.resolutionNotes) {
      doc.resolutionNotes = props.resolutionNotes;
    }

    return doc;
  }

  /**
   * Maps a Firebase document to a domain Incident entity
   */
  static toDomain(doc: IncidentDocument): Incident {
    // Create value objects
    const incidentId = IncidentId.unsafeFromString(doc.id);
    const reportedBy = UserId.unsafeFromString(doc.reportedBy);
    
    const location = Location.unsafeCreate({
      lat: doc.location.lat,
      lng: doc.location.lng,
      address: doc.location.address,
      city: doc.location.city,
      state: doc.location.state,
      zipCode: doc.location.zipCode,
      country: doc.location.country,
      geohash: doc.location.geohash,
    });

    // Convert assigned supes
    const assignedSupes = new Set(
      doc.assignedSupes.map(id => UserId.unsafeFromString(id))
    );

    // Convert chaser responses
    const chaserResponses = new Map<string, ChaserResponse>();
    Object.entries(doc.chaserResponses).forEach(([userId, response]) => {
      const chaserResponse: ChaserResponse = {
        userId: UserId.unsafeFromString(userId),
        status: response.status as ChaserResponseStatus,
        distance: response.distance 
          ? Distance.fromKilometers(response.distance)
          : undefined,
        estimatedArrival: response.estimatedArrival
          ? Timestamp.fromUnixTimestamp(response.estimatedArrival.toMillis()).getOrElseThrow()
          : undefined,
        actualArrival: response.actualArrival
          ? Timestamp.fromUnixTimestamp(response.actualArrival.toMillis()).getOrElseThrow()
          : undefined,
        completedAt: response.completedAt
          ? Timestamp.fromUnixTimestamp(response.completedAt.toMillis()).getOrElseThrow()
          : undefined,
        notes: response.notes,
        lastUpdated: Timestamp.fromUnixTimestamp(response.lastUpdated.toMillis()).getOrElseThrow(),
      };
      chaserResponses.set(userId, chaserResponse);
    });

    // Convert updates
    const updates: IncidentUpdate[] = doc.updates.map(update => ({
      id: update.id,
      type: update.type as IncidentUpdateType,
      userId: UserId.unsafeFromString(update.userId),
      content: update.content,
      metadata: update.metadata,
      timestamp: Timestamp.fromUnixTimestamp(update.timestamp.toMillis()).getOrElseThrow(),
    }));

    // Convert timestamps
    const createdAt = Timestamp.fromUnixTimestamp(doc.createdAt.toMillis()).getOrElseThrow();
    const updatedAt = Timestamp.fromUnixTimestamp(doc.updatedAt.toMillis()).getOrElseThrow();
    
    let resolvedAt: Timestamp | undefined;
    if (doc.resolvedAt) {
      resolvedAt = Timestamp.fromUnixTimestamp(doc.resolvedAt.toMillis()).getOrElseThrow();
    }

    let resolvedBy: UserId | undefined;
    if (doc.resolvedBy) {
      resolvedBy = UserId.unsafeFromString(doc.resolvedBy);
    }

    return Incident.fromPersistence({
      id: incidentId,
      location,
      type: doc.type as IncidentType,
      priority: doc.priority as IncidentPriority,
      status: doc.status as IncidentStatus,
      description: doc.description,
      reportedBy,
      assignedSupes,
      chaserResponses,
      images: doc.images,
      homeownerInfo: doc.homeownerInfo as HomeownerInfo,
      updates,
      resolvedAt,
      resolvedBy,
      resolutionNotes: doc.resolutionNotes,
      createdAt,
      updatedAt,
      version: doc.version,
    });
  }
}
