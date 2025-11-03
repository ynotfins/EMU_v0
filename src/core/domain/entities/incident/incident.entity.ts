/**
 * Incident Entity
 * 
 * Core aggregate root representing an emergency incident.
 * Manages incident lifecycle, assignments, and updates.
 */

import {
  IncidentId,
  UserId,
  Location,
  Timestamp,
  Distance,
} from '@domain/shared/value-objects';
import {
  Either,
  left,
  right,
  BusinessRuleViolationError,
  InvalidEntityStateError,
  ValidationError,
  InvariantViolationError,
} from '@domain/shared/errors';
import { User } from '../user/user.entity';

// Incident type enum
export enum IncidentType {
  FIRE = 'fire',
  ACCIDENT = 'accident',
  HAZARD = 'hazard',
  MEDICAL = 'medical',
  OTHER = 'other',
}

// Incident priority
export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Incident status
export enum IncidentStatus {
  ACTIVE = 'active',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

// Chaser response status
export enum ChaserResponseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  COMPLETED = 'completed',
}

// Incident update type
export enum IncidentUpdateType {
  STATUS_CHANGE = 'status_change',
  ASSIGNMENT = 'assignment',
  UPDATE = 'update',
  PHOTO_ADDED = 'photo_added',
  HOMEOWNER_INFO = 'homeowner_info',
  RESOLUTION = 'resolution',
}

// Homeowner information
export interface HomeownerInfo {
  name?: string;
  phone?: string;
  email?: string;
  insuranceCarrier?: string;
  policyNumber?: string;
  notes?: string;
}

// Incident update
export interface IncidentUpdate {
  id: string;
  type: IncidentUpdateType;
  userId: UserId;
  content: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

// Chaser response
export interface ChaserResponse {
  userId: UserId;
  status: ChaserResponseStatus;
  distance?: Distance;
  estimatedArrival?: Timestamp;
  actualArrival?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
  lastUpdated: Timestamp;
}

// Props for creating a new incident
export interface CreateIncidentProps {
  location: Location;
  type: IncidentType;
  priority?: IncidentPriority;
  description: string;
  reportedBy: UserId;
  images?: string[];
  homeownerInfo?: HomeownerInfo;
}

// Internal props for the entity
interface IncidentProps {
  id: IncidentId;
  location: Location;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  description: string;
  reportedBy: UserId;
  assignedSupes: Set<UserId>;
  chaserResponses: Map<string, ChaserResponse>;
  images: string[];
  homeownerInfo?: HomeownerInfo;
  updates: IncidentUpdate[];
  resolvedAt?: Timestamp;
  resolvedBy?: UserId;
  resolutionNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

export class Incident {
  private props: IncidentProps;
  private static readonly MAX_IMAGES = 10;
  private static readonly MAX_DESCRIPTION_LENGTH = 2000;
  private static readonly MAX_ASSIGNED_CHASERS = 5;

  private constructor(props: IncidentProps) {
    this.props = props;
  }

  // Getters
  get id(): IncidentId {
    return this.props.id;
  }

  get location(): Location {
    return this.props.location;
  }

  get type(): IncidentType {
    return this.props.type;
  }

  get priority(): IncidentPriority {
    return this.props.priority;
  }

  get status(): IncidentStatus {
    return this.props.status;
  }

  get description(): string {
    return this.props.description;
  }

  get reportedBy(): UserId {
    return this.props.reportedBy;
  }

  get assignedSupes(): UserId[] {
    return Array.from(this.props.assignedSupes);
  }

  get chaserResponses(): ChaserResponse[] {
    return Array.from(this.props.chaserResponses.values());
  }

  get images(): string[] {
    return [...this.props.images];
  }

  get homeownerInfo(): HomeownerInfo | undefined {
    return this.props.homeownerInfo ? { ...this.props.homeownerInfo } : undefined;
  }

  get updates(): IncidentUpdate[] {
    return [...this.props.updates];
  }

  get resolvedAt(): Timestamp | undefined {
    return this.props.resolvedAt;
  }

  get resolvedBy(): UserId | undefined {
    return this.props.resolvedBy;
  }

  get resolutionNotes(): string | undefined {
    return this.props.resolutionNotes;
  }

  get createdAt(): Timestamp {
    return this.props.createdAt;
  }

  get updatedAt(): Timestamp {
    return this.props.updatedAt;
  }

  get version(): number {
    return this.props.version;
  }

  /**
   * Creates a new Incident
   */
  static create(props: CreateIncidentProps): Either<Error, Incident> {
    // Validate description
    if (!props.description || props.description.trim().length === 0) {
      return left(new ValidationError('description', props.description, 'Description cannot be empty'));
    }

    if (props.description.length > this.MAX_DESCRIPTION_LENGTH) {
      return left(new ValidationError(
        'description',
        props.description,
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
      ));
    }

    // Validate images
    if (props.images && props.images.length > this.MAX_IMAGES) {
      return left(new ValidationError(
        'images',
        props.images,
        `Cannot add more than ${this.MAX_IMAGES} images`
      ));
    }

    // Validate homeowner info if provided
    if (props.homeownerInfo) {
      const validationResult = this.validateHomeownerInfo(props.homeownerInfo);
      if (validationResult.isLeft()) {
        return validationResult;
      }
    }

    const now = Timestamp.now();
    const incident = new Incident({
      id: IncidentId.create(),
      location: props.location,
      type: props.type,
      priority: props.priority || this.calculatePriority(props.type),
      status: IncidentStatus.ACTIVE,
      description: props.description.trim(),
      reportedBy: props.reportedBy,
      assignedSupes: new Set(),
      chaserResponses: new Map(),
      images: props.images || [],
      homeownerInfo: props.homeownerInfo,
      updates: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    // Add initial update
    incident.addSystemUpdate(
      IncidentUpdateType.STATUS_CHANGE,
      'Incident created',
      { initialStatus: IncidentStatus.ACTIVE }
    );

    return right(incident);
  }

  /**
   * Recreates an Incident from persistence
   */
  static fromPersistence(props: IncidentProps): Incident {
    return new Incident(props);
  }

  /**
   * Assigns a Supe to oversee this incident
   */
  assignSupe(supe: User, assignedBy: User): Either<Error, void> {
    if (!this.canBeModified()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'assignSupe'));
    }

    if (!supe.canCreateIncidents()) {
      return left(new BusinessRuleViolationError('User cannot be assigned as Supe'));
    }

    if (!assignedBy.canCreateIncidents()) {
      return left(new BusinessRuleViolationError('User cannot assign Supes'));
    }

    if (this.props.assignedSupes.has(supe.id)) {
      return left(new BusinessRuleViolationError('Supe is already assigned to this incident'));
    }

    this.props.assignedSupes.add(supe.id);
    
    this.addSystemUpdate(
      IncidentUpdateType.ASSIGNMENT,
      `Supe ${supe.displayName} assigned by ${assignedBy.displayName}`,
      { supeId: supe.id.value, assignedById: assignedBy.id.value }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Assigns a Chaser to respond to this incident
   */
  assignChaser(chaser: User, assignedBy: User): Either<Error, void> {
    if (!this.canBeModified()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'assignChaser'));
    }

    if (!chaser.canRespondToIncidents()) {
      return left(new BusinessRuleViolationError('User cannot respond to incidents'));
    }

    if (!assignedBy.canCreateIncidents()) {
      return left(new BusinessRuleViolationError('User cannot assign Chasers'));
    }

    const existingResponse = this.props.chaserResponses.get(chaser.id.value);
    if (existingResponse && existingResponse.status !== ChaserResponseStatus.DECLINED) {
      return left(new BusinessRuleViolationError('Chaser is already assigned to this incident'));
    }

    if (this.getActiveChasers().length >= Incident.MAX_ASSIGNED_CHASERS) {
      return left(new BusinessRuleViolationError(
        `Cannot assign more than ${Incident.MAX_ASSIGNED_CHASERS} chasers to an incident`
      ));
    }

    // Calculate distance if chaser has last location
    let distance: Distance | undefined;
    if (chaser.lastLocation) {
      const km = this.location.distanceTo(chaser.lastLocation);
      distance = Distance.fromKilometers(km);
    }

    const response: ChaserResponse = {
      userId: chaser.id,
      status: ChaserResponseStatus.PENDING,
      distance,
      lastUpdated: Timestamp.now(),
    };

    this.props.chaserResponses.set(chaser.id.value, response);

    // Update incident status if first assignment
    if (this.status === IncidentStatus.ACTIVE) {
      this.props.status = IncidentStatus.ASSIGNED;
    }

    this.addSystemUpdate(
      IncidentUpdateType.ASSIGNMENT,
      `Chaser ${chaser.displayName} assigned by ${assignedBy.displayName}`,
      { chaserId: chaser.id.value, assignedById: assignedBy.id.value, distance: distance?.kilometers }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Updates a chaser's response status
   */
  updateChaserResponse(
    chaserId: UserId,
    status: ChaserResponseStatus,
    notes?: string
  ): Either<Error, void> {
    const response = this.props.chaserResponses.get(chaserId.value);
    if (!response) {
      return left(new BusinessRuleViolationError('Chaser is not assigned to this incident'));
    }

    // Validate status transitions
    const validTransition = this.validateResponseStatusTransition(response.status, status);
    if (validTransition.isLeft()) {
      return validTransition;
    }

    // Update response
    response.status = status;
    response.lastUpdated = Timestamp.now();
    
    if (notes) {
      response.notes = notes;
    }

    // Update timestamps based on status
    switch (status) {
      case ChaserResponseStatus.EN_ROUTE:
        response.estimatedArrival = Timestamp.now().addDuration(30 * 60 * 1000); // 30 min estimate
        break;
      case ChaserResponseStatus.ON_SCENE:
        response.actualArrival = Timestamp.now();
        if (this.status === IncidentStatus.ASSIGNED) {
          this.props.status = IncidentStatus.IN_PROGRESS;
        }
        break;
      case ChaserResponseStatus.COMPLETED:
        response.completedAt = Timestamp.now();
        break;
    }

    this.props.chaserResponses.set(chaserId.value, response);

    this.addSystemUpdate(
      IncidentUpdateType.STATUS_CHANGE,
      `Chaser response status updated to ${status}`,
      { chaserId: chaserId.value, status, notes }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Adds an update to the incident
   */
  addUpdate(userId: UserId, content: string, metadata?: Record<string, any>): Either<Error, void> {
    if (!this.canBeModified()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'addUpdate'));
    }

    if (!content || content.trim().length === 0) {
      return left(new ValidationError('content', content, 'Update content cannot be empty'));
    }

    const update: IncidentUpdate = {
      id: IncidentId.create().value,
      type: IncidentUpdateType.UPDATE,
      userId,
      content: content.trim(),
      metadata,
      timestamp: Timestamp.now(),
    };

    this.props.updates.push(update);
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Adds images to the incident
   */
  addImages(imageUrls: string[], uploadedBy: UserId): Either<Error, void> {
    if (!this.canBeModified()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'addImages'));
    }

    const totalImages = this.images.length + imageUrls.length;
    if (totalImages > Incident.MAX_IMAGES) {
      return left(new BusinessRuleViolationError(
        `Cannot exceed ${Incident.MAX_IMAGES} images per incident`
      ));
    }

    this.props.images.push(...imageUrls);

    this.addSystemUpdate(
      IncidentUpdateType.PHOTO_ADDED,
      `${imageUrls.length} photo(s) added`,
      { uploadedById: uploadedBy.value, imageCount: imageUrls.length }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Updates homeowner information
   */
  updateHomeownerInfo(info: HomeownerInfo, updatedBy: UserId): Either<Error, void> {
    if (!this.canBeModified()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'updateHomeownerInfo'));
    }

    const validationResult = Incident.validateHomeownerInfo(info);
    if (validationResult.isLeft()) {
      return validationResult;
    }

    this.props.homeownerInfo = {
      ...this.props.homeownerInfo,
      ...info,
    };

    this.addSystemUpdate(
      IncidentUpdateType.HOMEOWNER_INFO,
      'Homeowner information updated',
      { updatedById: updatedBy.value, fields: Object.keys(info) }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Resolves the incident
   */
  resolve(resolvedBy: User, notes?: string): Either<Error, void> {
    if (!this.canBeResolved()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'resolve'));
    }

    if (!resolvedBy.canCreateIncidents()) {
      return left(new BusinessRuleViolationError('User cannot resolve incidents'));
    }

    this.props.status = IncidentStatus.RESOLVED;
    this.props.resolvedAt = Timestamp.now();
    this.props.resolvedBy = resolvedBy.id;
    this.props.resolutionNotes = notes;

    this.addSystemUpdate(
      IncidentUpdateType.RESOLUTION,
      `Incident resolved by ${resolvedBy.displayName}`,
      { resolvedById: resolvedBy.id.value, notes }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Cancels the incident
   */
  cancel(cancelledBy: User, reason: string): Either<Error, void> {
    if (!this.canBeCancelled()) {
      return left(new InvalidEntityStateError('Incident', this.status, 'cancel'));
    }

    if (!cancelledBy.canCreateIncidents()) {
      return left(new BusinessRuleViolationError('User cannot cancel incidents'));
    }

    if (!reason || reason.trim().length === 0) {
      return left(new ValidationError('reason', reason, 'Cancellation reason is required'));
    }

    this.props.status = IncidentStatus.CANCELLED;

    this.addSystemUpdate(
      IncidentUpdateType.STATUS_CHANGE,
      `Incident cancelled by ${cancelledBy.displayName}: ${reason}`,
      { cancelledById: cancelledBy.id.value, reason }
    );

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Gets active chasers (not declined)
   */
  getActiveChasers(): ChaserResponse[] {
    return this.chaserResponses.filter(
      r => r.status !== ChaserResponseStatus.DECLINED
    );
  }

  /**
   * Gets chasers currently on scene
   */
  getChasersOnScene(): ChaserResponse[] {
    return this.chaserResponses.filter(
      r => r.status === ChaserResponseStatus.ON_SCENE
    );
  }

  /**
   * Checks if a specific user is assigned as a Supe
   */
  isSupeAssigned(userId: UserId): boolean {
    return this.props.assignedSupes.has(userId);
  }

  /**
   * Checks if a specific user is assigned as a Chaser
   */
  isChaserAssigned(userId: UserId): boolean {
    return this.props.chaserResponses.has(userId.value);
  }

  /**
   * Checks if the incident can be modified
   */
  private canBeModified(): boolean {
    return this.status !== IncidentStatus.RESOLVED && 
           this.status !== IncidentStatus.CANCELLED;
  }

  /**
   * Checks if the incident can be resolved
   */
  private canBeResolved(): boolean {
    return this.status === IncidentStatus.IN_PROGRESS ||
           this.status === IncidentStatus.ASSIGNED ||
           this.status === IncidentStatus.ACTIVE;
  }

  /**
   * Checks if the incident can be cancelled
   */
  private canBeCancelled(): boolean {
    return this.status === IncidentStatus.ACTIVE ||
           this.status === IncidentStatus.ASSIGNED;
  }

  /**
   * Validates response status transitions
   */
  private validateResponseStatusTransition(
    from: ChaserResponseStatus,
    to: ChaserResponseStatus
  ): Either<Error, void> {
    const validTransitions: Record<ChaserResponseStatus, ChaserResponseStatus[]> = {
      [ChaserResponseStatus.PENDING]: [
        ChaserResponseStatus.ACCEPTED,
        ChaserResponseStatus.DECLINED,
      ],
      [ChaserResponseStatus.ACCEPTED]: [
        ChaserResponseStatus.EN_ROUTE,
        ChaserResponseStatus.DECLINED,
      ],
      [ChaserResponseStatus.DECLINED]: [
        ChaserResponseStatus.PENDING, // Can be reassigned
      ],
      [ChaserResponseStatus.EN_ROUTE]: [
        ChaserResponseStatus.ON_SCENE,
        ChaserResponseStatus.DECLINED,
      ],
      [ChaserResponseStatus.ON_SCENE]: [
        ChaserResponseStatus.COMPLETED,
      ],
      [ChaserResponseStatus.COMPLETED]: [],
    };

    const allowedTransitions = validTransitions[from] || [];
    if (!allowedTransitions.includes(to)) {
      return left(new BusinessRuleViolationError(
        `Invalid status transition from ${from} to ${to}`
      ));
    }

    return right(undefined);
  }

  /**
   * Calculates default priority based on incident type
   */
  private static calculatePriority(type: IncidentType): IncidentPriority {
    switch (type) {
      case IncidentType.FIRE:
        return IncidentPriority.CRITICAL;
      case IncidentType.MEDICAL:
        return IncidentPriority.HIGH;
      case IncidentType.ACCIDENT:
        return IncidentPriority.MEDIUM;
      case IncidentType.HAZARD:
        return IncidentPriority.MEDIUM;
      case IncidentType.OTHER:
        return IncidentPriority.LOW;
    }
  }

  /**
   * Validates homeowner information
   */
  private static validateHomeownerInfo(info: HomeownerInfo): Either<Error, void> {
    if (info.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(info.email)) {
        return left(new ValidationError('homeownerEmail', info.email, 'Invalid email format'));
      }
    }

    if (info.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(info.phone.replace(/[\s-()]/g, ''))) {
        return left(new ValidationError('homeownerPhone', info.phone, 'Invalid phone format'));
      }
    }

    return right(undefined);
  }

  /**
   * Adds a system-generated update
   */
  private addSystemUpdate(
    type: IncidentUpdateType,
    content: string,
    metadata?: Record<string, any>
  ): void {
    const update: IncidentUpdate = {
      id: IncidentId.create().value,
      type,
      userId: UserId.unsafeFromString('system'),
      content,
      metadata,
      timestamp: Timestamp.now(),
    };

    this.props.updates.push(update);
  }

  /**
   * Updates timestamp and version
   */
  private updateTimestamp(): void {
    this.props.updatedAt = Timestamp.now();
    this.props.version += 1;
  }

  /**
   * Converts to persistence format
   */
  toPersistence(): IncidentProps {
    return { ...this.props };
  }

  /**
   * Validates entity invariants
   */
  validateInvariants(): Either<Error, void> {
    // An incident cannot be resolved without a resolver
    if (this.status === IncidentStatus.RESOLVED && !this.resolvedBy) {
      return left(new InvariantViolationError(
        'Resolved incident must have a resolver'
      ));
    }

    // An incident in progress must have at least one chaser on scene
    if (this.status === IncidentStatus.IN_PROGRESS) {
      const chasersOnScene = this.getChasersOnScene();
      if (chasersOnScene.length === 0) {
        return left(new InvariantViolationError(
          'In-progress incident must have at least one chaser on scene'
        ));
      }
    }

    return right(undefined);
  }
}
