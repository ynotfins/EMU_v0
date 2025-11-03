/**
 * Base Value Object
 * 
 * Value objects are immutable objects that represent a descriptive aspect of the domain
 * with no conceptual identity. They are defined by their attributes.
 */

export interface ValueObjectProps {
  [key: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Value objects are equal if all their properties are equal
   */
  public equals(other?: ValueObject<T>): boolean {
    if (!other || other.constructor !== this.constructor) {
      return false;
    }

    return this.compareProps(this.props, other.props);
  }

  private compareProps(a: any, b: any): boolean {
    if (a === b) return true;

    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return a === b;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key)) {
        return false;
      }

      if (!this.compareProps(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }
}
