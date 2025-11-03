/**
 * User Entity
 * 
 * Represents a user in the system (Chaser, Supe, Admin, or Super Admin).
 * Core aggregate root for user-related operations.
 */

import { 
  UserId, 
  Email, 
  Role, 
  Timestamp,
  Location
} from '@domain/shared/value-objects';
import { 
  Either, 
  left, 
  right,
  BusinessRuleViolationError,
  InvalidEntityStateError,
  ValidationError
} from '@domain/shared/errors';

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// User settings interface
export interface UserSettings {
  maxResponseDistance?: number; // For chasers - max distance they're willing to travel
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  autoAcceptIncidents?: boolean; // For chasers
  locationSharingEnabled?: boolean;
}

// Props for creating a new user
export interface CreateUserProps {
  email: Email;
  displayName: string;
  role: Role;
  photoURL?: string;
  phoneNumber?: string;
}

// Internal props for the entity
interface UserProps {
  id: UserId;
  email: Email;
  displayName: string;
  role: Role;
  status: UserStatus;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  lastLogin?: Timestamp;
  lastLocation?: Location;
  settings: UserSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number; // For optimistic concurrency control
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // Getters for accessing properties
  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get photoURL(): string | undefined {
    return this.props.photoURL;
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get lastLogin(): Timestamp | undefined {
    return this.props.lastLogin;
  }

  get lastLocation(): Location | undefined {
    return this.props.lastLocation;
  }

  get settings(): Readonly<UserSettings> {
    return { ...this.props.settings };
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
   * Creates a new User entity
   */
  static create(props: CreateUserProps): Either<Error, User> {
    // Validate display name
    if (!props.displayName || props.displayName.trim().length === 0) {
      return left(new ValidationError('displayName', props.displayName, 'Display name cannot be empty'));
    }

    if (props.displayName.length > 100) {
      return left(new ValidationError('displayName', props.displayName, 'Display name cannot exceed 100 characters'));
    }

    // Validate phone number if provided
    if (props.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
      if (!phoneRegex.test(props.phoneNumber)) {
        return left(new ValidationError('phoneNumber', props.phoneNumber, 'Invalid phone number format'));
      }
    }

    // Create default settings based on role
    const defaultSettings = this.getDefaultSettings(props.role);

    const now = Timestamp.now();
    const user = new User({
      id: UserId.create(),
      email: props.email,
      displayName: props.displayName.trim(),
      role: props.role,
      status: UserStatus.PENDING_VERIFICATION,
      photoURL: props.photoURL,
      phoneNumber: props.phoneNumber,
      emailVerified: false,
      settings: defaultSettings,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    return right(user);
  }

  /**
   * Recreates a User entity from stored data
   */
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  /**
   * Updates the user's profile information
   */
  updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
  }): Either<Error, void> {
    if (!this.canUpdateProfile()) {
      return left(new InvalidEntityStateError('User', this.status, 'updateProfile'));
    }

    if (updates.displayName !== undefined) {
      if (!updates.displayName || updates.displayName.trim().length === 0) {
        return left(new ValidationError('displayName', updates.displayName, 'Display name cannot be empty'));
      }
      this.props.displayName = updates.displayName.trim();
    }

    if (updates.photoURL !== undefined) {
      this.props.photoURL = updates.photoURL;
    }

    if (updates.phoneNumber !== undefined) {
      if (updates.phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(updates.phoneNumber)) {
          return left(new ValidationError('phoneNumber', updates.phoneNumber, 'Invalid phone number format'));
        }
      }
      this.props.phoneNumber = updates.phoneNumber;
    }

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Updates user settings
   */
  updateSettings(settings: Partial<UserSettings>): Either<Error, void> {
    if (!this.isActive()) {
      return left(new InvalidEntityStateError('User', this.status, 'updateSettings'));
    }

    // Validate settings based on role
    if (settings.maxResponseDistance !== undefined && this.role.value !== 'chaser') {
      return left(new BusinessRuleViolationError(
        'Only chasers can set max response distance'
      ));
    }

    if (settings.autoAcceptIncidents !== undefined && this.role.value !== 'chaser') {
      return left(new BusinessRuleViolationError(
        'Only chasers can set auto-accept incidents'
      ));
    }

    this.props.settings = {
      ...this.props.settings,
      ...settings,
    };

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Updates the user's role
   */
  updateRole(newRole: Role, changedBy: User): Either<Error, void> {
    // User cannot change their own role
    if (this.id.equals(changedBy.id)) {
      return left(new BusinessRuleViolationError('Users cannot change their own role'));
    }

    // Check if the changer has permission
    if (!changedBy.role.canManage(this.role)) {
      return left(new BusinessRuleViolationError(
        `${changedBy.role.getDisplayName()} cannot manage ${this.role.getDisplayName()}`
      ));
    }

    // Check if the changer can assign the new role
    if (!changedBy.role.canManage(newRole)) {
      return left(new BusinessRuleViolationError(
        `${changedBy.role.getDisplayName()} cannot assign ${newRole.getDisplayName()} role`
      ));
    }

    this.props.role = newRole;
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Verifies the user's email
   */
  verifyEmail(): Either<Error, void> {
    if (this.emailVerified) {
      return left(new InvalidEntityStateError('User', 'email already verified', 'verifyEmail'));
    }

    this.props.emailVerified = true;
    
    // Activate user if they were pending verification
    if (this.status === UserStatus.PENDING_VERIFICATION) {
      this.props.status = UserStatus.ACTIVE;
    }

    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Records a login
   */
  recordLogin(): void {
    this.props.lastLogin = Timestamp.now();
    this.updateTimestamp();
  }

  /**
   * Updates the user's location
   */
  updateLocation(location: Location): Either<Error, void> {
    if (!this.isActive()) {
      return left(new InvalidEntityStateError('User', this.status, 'updateLocation'));
    }

    if (!this.settings.locationSharingEnabled) {
      return left(new BusinessRuleViolationError('Location sharing is disabled'));
    }

    this.props.lastLocation = location;
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Activates the user
   */
  activate(): Either<Error, void> {
    if (this.status === UserStatus.ACTIVE) {
      return left(new InvalidEntityStateError('User', this.status, 'activate'));
    }

    if (this.status === UserStatus.SUSPENDED) {
      return left(new BusinessRuleViolationError(
        'Suspended users must be unsuspended, not activated'
      ));
    }

    this.props.status = UserStatus.ACTIVE;
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Deactivates the user
   */
  deactivate(): Either<Error, void> {
    if (this.status !== UserStatus.ACTIVE) {
      return left(new InvalidEntityStateError('User', this.status, 'deactivate'));
    }

    this.props.status = UserStatus.INACTIVE;
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Suspends the user
   */
  suspend(reason?: string): Either<Error, void> {
    if (this.status === UserStatus.SUSPENDED) {
      return left(new InvalidEntityStateError('User', this.status, 'suspend'));
    }

    this.props.status = UserStatus.SUSPENDED;
    this.updateTimestamp();
    
    // TODO: Could emit a UserSuspendedEvent with reason
    
    return right(undefined);
  }

  /**
   * Unsuspends the user
   */
  unsuspend(): Either<Error, void> {
    if (this.status !== UserStatus.SUSPENDED) {
      return left(new InvalidEntityStateError('User', this.status, 'unsuspend'));
    }

    this.props.status = UserStatus.ACTIVE;
    this.updateTimestamp();
    return right(undefined);
  }

  /**
   * Checks if the user is active
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * Checks if the user can respond to incidents
   */
  canRespondToIncidents(): boolean {
    return this.isActive() && 
           this.role.value === 'chaser' && 
           this.emailVerified;
  }

  /**
   * Checks if the user can create incidents
   */
  canCreateIncidents(): boolean {
    return this.isActive() && 
           (this.role.value === 'supe' || 
            this.role.value === 'admin' || 
            this.role.value === 'super_admin');
  }

  /**
   * Gets default settings based on role
   */
  private static getDefaultSettings(role: Role): UserSettings {
    const baseSettings: UserSettings = {
      notificationsEnabled: true,
      soundEnabled: true,
      locationSharingEnabled: true,
    };

    if (role.value === 'chaser') {
      return {
        ...baseSettings,
        maxResponseDistance: 50, // 50 miles default
        autoAcceptIncidents: false,
      };
    }

    return baseSettings;
  }

  /**
   * Checks if the user can update their profile
   */
  private canUpdateProfile(): boolean {
    return this.status !== UserStatus.SUSPENDED;
  }

  /**
   * Updates the timestamp and increments version
   */
  private updateTimestamp(): void {
    this.props.updatedAt = Timestamp.now();
    this.props.version += 1;
  }

  /**
   * Converts the entity to a plain object for persistence
   */
  toPersistence(): UserProps {
    return { ...this.props };
  }

  /**
   * Clone the user with updated props
   */
  clone(updates: Partial<UserProps>): User {
    return new User({
      ...this.props,
      ...updates,
    });
  }
}
