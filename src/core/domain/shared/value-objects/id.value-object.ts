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
  
  static create(): UserId {
    return new UserId({ value: uuidv4() });
  }
  
  static fromString(id: string): Either<Error, UserId> {
    if (!id || id.trim().length === 0) {
      return left(new Error('UserId cannot be empty'));
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return left(new Error('UserId must be a valid UUID'));
    }
    return right(new UserId({ value: id }));
  }
  
  static unsafeFromString(id: string): UserId {
    return new UserId({ value: id });
  }
}

export class IncidentId extends Id {
  private _incidentIdBrand!: void;
  
  static create(): IncidentId {
    return new IncidentId({ value: uuidv4() });
  }
  
  static fromString(id: string): Either<Error, IncidentId> {
    if (!id || id.trim().length === 0) {
      return left(new Error('IncidentId cannot be empty'));
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return left(new Error('IncidentId must be a valid UUID'));
    }
    return right(new IncidentId({ value: id }));
  }
  
  static unsafeFromString(id: string): IncidentId {
    return new IncidentId({ value: id });
  }
}

export class ChatId extends Id {
  private _chatIdBrand!: void;
  
  static create(): ChatId {
    return new ChatId({ value: uuidv4() });
  }
  
  static fromString(id: string): Either<Error, ChatId> {
    if (!id || id.trim().length === 0) {
      return left(new Error('ChatId cannot be empty'));
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return left(new Error('ChatId must be a valid UUID'));
    }
    return right(new ChatId({ value: id }));
  }
  
  static unsafeFromString(id: string): ChatId {
    return new ChatId({ value: id });
  }
}

export class MessageId extends Id {
  private _messageIdBrand!: void;
  
  static create(): MessageId {
    return new MessageId({ value: uuidv4() });
  }
  
  static fromString(id: string): Either<Error, MessageId> {
    if (!id || id.trim().length === 0) {
      return left(new Error('MessageId cannot be empty'));
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return left(new Error('MessageId must be a valid UUID'));
    }
    return right(new MessageId({ value: id }));
  }
  
  static unsafeFromString(id: string): MessageId {
    return new MessageId({ value: id });
  }
}
