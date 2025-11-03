/**
 * Role Value Object
 * 
 * Represents user roles in the system with validation and permissions.
 */

import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPE = 'supe',
  CHASER = 'chaser',
}

interface RoleProps {
  value: RoleType;
}

export class Role extends ValueObject<RoleProps> {
  get value(): RoleType {
    return this.props.value;
  }

  /**
   * Creates a Role value object with validation
   */
  static create(role: string): Either<Error, Role> {
    if (!this.isValidRole(role)) {
      return left(new Error(`Invalid role: ${role}`));
    }

    return right(new Role({ value: role as RoleType }));
  }

  /**
   * Creates a Role without validation
   * Use with caution - only for trusted sources
   */
  static unsafeCreate(role: RoleType): Role {
    return new Role({ value: role });
  }

  /**
   * Validates if a string is a valid role
   */
  private static isValidRole(role: string): role is RoleType {
    return Object.values(RoleType).includes(role as RoleType);
  }

  /**
   * Predefined role instances for convenience
   */
  static readonly SUPER_ADMIN = new Role({ value: RoleType.SUPER_ADMIN });
  static readonly ADMIN = new Role({ value: RoleType.ADMIN });
  static readonly SUPE = new Role({ value: RoleType.SUPE });
  static readonly CHASER = new Role({ value: RoleType.CHASER });

  /**
   * Checks if this role has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  /**
   * Gets all permissions for this role
   */
  getPermissions(): Permission[] {
    switch (this.value) {
      case RoleType.SUPER_ADMIN:
        return Object.values(Permission);
      
      case RoleType.ADMIN:
        return [
          Permission.CREATE_INCIDENT,
          Permission.UPDATE_INCIDENT,
          Permission.DELETE_INCIDENT,
          Permission.ASSIGN_CHASER,
          Permission.VIEW_ALL_INCIDENTS,
          Permission.VIEW_ANALYTICS,
          Permission.MANAGE_USERS,
          Permission.SEND_BROADCAST,
        ];
      
      case RoleType.SUPE:
        return [
          Permission.CREATE_INCIDENT,
          Permission.UPDATE_INCIDENT,
          Permission.ASSIGN_CHASER,
          Permission.VIEW_ALL_INCIDENTS,
          Permission.VIEW_ANALYTICS,
          Permission.SEND_BROADCAST,
        ];
      
      case RoleType.CHASER:
        return [
          Permission.VIEW_ASSIGNED_INCIDENTS,
          Permission.RESPOND_TO_INCIDENT,
          Permission.UPDATE_OWN_LOCATION,
          Permission.CHAT_IN_INCIDENT,
        ];
      
      default:
        return [];
    }
  }

  /**
   * Checks if this role is higher than another role
   */
  isHigherThan(other: Role): boolean {
    const hierarchy = [
      RoleType.CHASER,
      RoleType.SUPE,
      RoleType.ADMIN,
      RoleType.SUPER_ADMIN,
    ];

    const thisIndex = hierarchy.indexOf(this.value);
    const otherIndex = hierarchy.indexOf(other.value);

    return thisIndex > otherIndex;
  }

  /**
   * Checks if this role can manage another role
   */
  canManage(other: Role): boolean {
    // Super admin can manage everyone
    if (this.value === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Admin can manage supe and chaser
    if (this.value === RoleType.ADMIN) {
      return other.value === RoleType.SUPE || other.value === RoleType.CHASER;
    }

    // Supe can manage chaser
    if (this.value === RoleType.SUPE) {
      return other.value === RoleType.CHASER;
    }

    return false;
  }

  /**
   * Gets the display name for the role
   */
  getDisplayName(): string {
    switch (this.value) {
      case RoleType.SUPER_ADMIN:
        return 'Super Admin';
      case RoleType.ADMIN:
        return 'Admin';
      case RoleType.SUPE:
        return 'Supe';
      case RoleType.CHASER:
        return 'Chaser';
      default:
        return 'Unknown';
    }
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}

/**
 * Permissions enum
 */
export enum Permission {
  // Incident permissions
  CREATE_INCIDENT = 'create_incident',
  UPDATE_INCIDENT = 'update_incident',
  DELETE_INCIDENT = 'delete_incident',
  VIEW_ALL_INCIDENTS = 'view_all_incidents',
  VIEW_ASSIGNED_INCIDENTS = 'view_assigned_incidents',
  RESPOND_TO_INCIDENT = 'respond_to_incident',
  ASSIGN_CHASER = 'assign_chaser',
  
  // User permissions
  MANAGE_USERS = 'manage_users',
  UPDATE_OWN_LOCATION = 'update_own_location',
  
  // Communication permissions
  SEND_BROADCAST = 'send_broadcast',
  CHAT_IN_INCIDENT = 'chat_in_incident',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  
  // System permissions
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOG = 'view_audit_log',
}
