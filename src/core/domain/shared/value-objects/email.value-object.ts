/**
 * Email Value Object
 * 
 * Represents a validated email address.
 * Ensures all email addresses in the system are valid.
 */

import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  /**
   * Creates an Email value object with validation
   */
  static create(email: string): Either<Error, Email> {
    if (!email || email.trim().length === 0) {
      return left(new Error('Email cannot be empty'));
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!this.validate(trimmedEmail)) {
      return left(new Error('Invalid email format'));
    }

    return right(new Email({ value: trimmedEmail }));
  }

  /**
   * Creates an Email without validation
   * Use with caution - only for trusted sources like database reads
   */
  static unsafeCreate(email: string): Email {
    return new Email({ value: email });
  }

  /**
   * Validates email format
   */
  private static validate(email: string): boolean {
    // RFC 5322 compliant email regex (simplified for practical use)
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional validation rules
    const [localPart, domain] = email.split('@');
    
    // Local part length check
    if (localPart.length > 64) {
      return false;
    }

    // Domain length check
    if (domain.length > 255) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    return true;
  }

  /**
   * Gets the domain part of the email
   */
  get domain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Gets the local part of the email (before @)
   */
  get localPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Returns a masked version of the email for display
   * Example: j***@example.com
   */
  getMasked(): string {
    const [local, domain] = this.value.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}${local[1]}***@${domain}`;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
