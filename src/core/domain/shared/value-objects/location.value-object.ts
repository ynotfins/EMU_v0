/**
 * Location Value Object
 * 
 * Represents a geographic location with coordinates and address.
 * Includes distance calculation capabilities.
 */

import { ValueObject } from './value-object';
import { Either, left, right } from '../errors/either';

interface LocationProps {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  geohash?: string;
}

export class Location extends ValueObject<LocationProps> {
  get lat(): number {
    return this.props.lat;
  }

  get lng(): number {
    return this.props.lng;
  }

  get address(): string {
    return this.props.address;
  }

  get city(): string | undefined {
    return this.props.city;
  }

  get state(): string | undefined {
    return this.props.state;
  }

  get zipCode(): string | undefined {
    return this.props.zipCode;
  }

  get country(): string | undefined {
    return this.props.country;
  }

  get geohash(): string | undefined {
    return this.props.geohash;
  }

  /**
   * Creates a Location value object with validation
   */
  static create(props: LocationProps): Either<Error, Location> {
    const errors: string[] = [];

    // Validate latitude
    if (props.lat < -90 || props.lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    // Validate longitude
    if (props.lng < -180 || props.lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }

    // Validate address
    if (!props.address || props.address.trim().length === 0) {
      errors.push('Address cannot be empty');
    }

    if (errors.length > 0) {
      return left(new Error(errors.join(', ')));
    }

    // Generate geohash if not provided
    const location = new Location({
      ...props,
      address: props.address.trim(),
      geohash: props.geohash || this.generateGeohash(props.lat, props.lng, 9),
    });

    return right(location);
  }

  /**
   * Creates a Location without validation
   * Use with caution - only for trusted sources like database reads
   */
  static unsafeCreate(props: LocationProps): Location {
    return new Location(props);
  }

  /**
   * Calculates the distance to another location using the Haversine formula
   * Returns distance in kilometers
   */
  distanceTo(other: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.lat - this.lat);
    const dLng = this.toRadians(other.lng - this.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.lat)) * Math.cos(this.toRadians(other.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculates the distance in miles
   */
  distanceToMiles(other: Location): number {
    return this.distanceTo(other) * 0.621371;
  }

  /**
   * Checks if this location is within a certain radius of another location
   * @param other The other location
   * @param radiusKm The radius in kilometers
   */
  isWithinRadius(other: Location, radiusKm: number): boolean {
    return this.distanceTo(other) <= radiusKm;
  }

  /**
   * Returns the coordinates as a tuple
   */
  get coordinates(): [number, number] {
    return [this.lat, this.lng];
  }

  /**
   * Returns a Google Maps URL for this location
   */
  getGoogleMapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.lng}`;
  }

  /**
   * Returns a formatted address string
   */
  getFormattedAddress(): string {
    const parts = [this.address];
    
    if (this.city) parts.push(this.city);
    if (this.state && this.zipCode) {
      parts.push(`${this.state} ${this.zipCode}`);
    } else if (this.state) {
      parts.push(this.state);
    }
    if (this.country) parts.push(this.country);

    return parts.join(', ');
  }

  /**
   * Returns a short display format for the location
   */
  getShortDisplay(): string {
    if (this.city && this.state) {
      return `${this.address}, ${this.city}, ${this.state}`;
    }
    return this.address;
  }

  /**
   * Converts degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generates a geohash for the location
   * This is a simplified version - in production, use a proper geohash library
   */
  private static generateGeohash(lat: number, lng: number, precision: number): string {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0;
    let bit = 0;
    let evenBit = true;
    let geohash = '';

    let latMin = -90, latMax = 90;
    let lngMin = -180, lngMax = 180;

    while (geohash.length < precision) {
      if (evenBit) {
        // longitude
        const mid = (lngMin + lngMax) / 2;
        if (lng > mid) {
          idx |= (1 << (4 - bit));
          lngMin = mid;
        } else {
          lngMax = mid;
        }
      } else {
        // latitude
        const mid = (latMin + latMax) / 2;
        if (lat > mid) {
          idx |= (1 << (4 - bit));
          latMin = mid;
        } else {
          latMax = mid;
        }
      }

      evenBit = !evenBit;

      if (bit === 4) {
        geohash += BASE32[idx];
        bit = 0;
        idx = 0;
      } else {
        bit++;
      }
    }

    return geohash;
  }

  toJSON(): object {
    return {
      lat: this.lat,
      lng: this.lng,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      country: this.country,
      geohash: this.geohash,
    };
  }

  toString(): string {
    return this.getFormattedAddress();
  }
}

/**
 * Distance Value Object
 */
interface DistanceProps {
  kilometers: number;
}

export class Distance extends ValueObject<DistanceProps> {
  get kilometers(): number {
    return this.props.kilometers;
  }

  get miles(): number {
    return this.kilometers * 0.621371;
  }

  get meters(): number {
    return this.kilometers * 1000;
  }

  static fromKilometers(km: number): Distance {
    return new Distance({ kilometers: Math.max(0, km) });
  }

  static fromMiles(miles: number): Distance {
    return new Distance({ kilometers: miles / 0.621371 });
  }

  static fromMeters(meters: number): Distance {
    return new Distance({ kilometers: meters / 1000 });
  }

  isWithin(maxDistance: Distance): boolean {
    return this.kilometers <= maxDistance.kilometers;
  }

  toString(): string {
    if (this.kilometers < 1) {
      return `${Math.round(this.meters)}m`;
    }
    return `${this.kilometers.toFixed(1)}km`;
  }

  toStringMiles(): string {
    return `${this.miles.toFixed(1)}mi`;
  }
}
