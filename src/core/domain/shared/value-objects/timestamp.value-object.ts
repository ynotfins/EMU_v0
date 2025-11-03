/**
 * Timestamp Value Object
 * 
 * Represents a point in time with timezone awareness.
 * Provides consistent date/time handling across the application.
 */

import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';

interface TimestampProps {
  value: Date;
}

export class Timestamp extends ValueObject<TimestampProps> {
  get value(): Date {
    return this.props.value;
  }

  /**
   * Creates a Timestamp from a Date object
   */
  static create(date: Date): Either<Error, Timestamp> {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return left(new Error('Invalid date provided'));
    }

    return right(new Timestamp({ value: new Date(date) }));
  }

  /**
   * Creates a Timestamp from an ISO string
   */
  static fromISOString(isoString: string): Either<Error, Timestamp> {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return left(new Error('Invalid ISO date string'));
      }
      return right(new Timestamp({ value: date }));
    } catch (error) {
      return left(new Error('Failed to parse ISO date string'));
    }
  }

  /**
   * Creates a Timestamp from a Unix timestamp (milliseconds)
   */
  static fromUnixTimestamp(timestamp: number): Either<Error, Timestamp> {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      return left(new Error('Invalid timestamp'));
    }

    return right(new Timestamp({ value: new Date(timestamp) }));
  }

  /**
   * Creates a Timestamp representing the current time
   */
  static now(): Timestamp {
    return new Timestamp({ value: new Date() });
  }

  /**
   * Returns the ISO string representation
   */
  toISOString(): string {
    return this.value.toISOString();
  }

  /**
   * Returns the Unix timestamp in milliseconds
   */
  toUnixTimestamp(): number {
    return this.value.getTime();
  }

  /**
   * Formats the timestamp for display
   */
  format(options?: Intl.DateTimeFormatOptions): string {
    return this.value.toLocaleString('en-US', options);
  }

  /**
   * Returns a relative time string (e.g., "2 hours ago")
   */
  toRelativeTime(): string {
    const now = Date.now();
    const diffMs = now - this.value.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return this.format({ 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }

  /**
   * Checks if this timestamp is before another
   */
  isBefore(other: Timestamp): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  /**
   * Checks if this timestamp is after another
   */
  isAfter(other: Timestamp): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  /**
   * Checks if this timestamp is within a certain duration from now
   */
  isWithinDuration(durationMs: number): boolean {
    const now = Date.now();
    return Math.abs(now - this.value.getTime()) <= durationMs;
  }

  /**
   * Adds a duration to this timestamp
   */
  addDuration(durationMs: number): Timestamp {
    return new Timestamp({ 
      value: new Date(this.value.getTime() + durationMs) 
    });
  }

  /**
   * Returns the difference between this timestamp and another in milliseconds
   */
  diffFrom(other: Timestamp): number {
    return this.value.getTime() - other.value.getTime();
  }

  toJSON(): string {
    return this.toISOString();
  }

  toString(): string {
    return this.toISOString();
  }
}
