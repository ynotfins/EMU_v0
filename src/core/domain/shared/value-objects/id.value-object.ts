/**
 * ID Value Object
 * 
 * Represents a unique identifier for entities.
 * Can be used as a base class for specific ID types (UserId, IncidentId, etc.)
 */

import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';

interface IdProps {
  value: string;
}

export abstract class Id extends ValueObject<IdProps> {
  get value(): string {
    return this.props.value;
  }

  /**
   * Creates a new unique ID
   */
  static create(): Id {
    return new (this as any)({ value: uuidv4() });
  }

  /**
   * Creates an ID from an existing string value
   */
  static fromString(id: string): Either<Error, Id> {
    if (!id || id.trim().length === 0) {
      return left(new Error('ID cannot be empty'));
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return left(new Error('ID must be a valid UUID'));
    }

    return right(new (this as any)({ value: id }));
  }

  /**
   * Creates an ID from an existing value without validation
   * Use with caution - only for trusted sources like database reads
   */
  static unsafeFromString(id: string): Id {
    return new (this as any)({ value: id });
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}

// Specific ID types for type safety
export class UserId extends Id {
  private _userIdBrand!: void;
}

export class IncidentId extends Id {
  private _incidentIdBrand!: void;
}

export class ChatId extends Id {
  private _chatIdBrand!: void;
}

export class MessageId extends Id {
  private _messageIdBrand!: void;
}
