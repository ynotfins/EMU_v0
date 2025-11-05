import type { Incident } from '../schemas/incident';
import type { FirestoreIncident } from '../schemas/firestore-incident';
import { Timestamp } from 'firebase-admin/firestore';
import type { WeatherInfo } from './weather';

export function parseTimestamp(timestampStr: string | undefined): { date: string; time: string } {
  if (!timestampStr) {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
    };
  }

  try {
    const date = new Date(timestampStr);
    if (!isNaN(date.getTime())) {
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0].substring(0, 5),
      };
    }
  } catch {}

  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 5),
  };
}

export function mapIncidentToFirestore(
  parsedIncident: Incident,
  notificationReceivedAt?: string,
  weatherInfo?: WeatherInfo | null
): FirestoreIncident {
  const timestamp = parsedIncident.timestamp || notificationReceivedAt;
  const { date, time } = parseTimestamp(timestamp);

  return {
    date,
    time,
    distance: parsedIncident.distance ?? 0,
    state: parsedIncident.state,
    county: parsedIncident.county,
    city: parsedIncident.city,
    address: parsedIncident.address,
    type: parsedIncident.type,
    description: parsedIncident.description,
    emergencyServicesStatus: parsedIncident.emergencyServicesStatus,
    incidentId: parsedIncident.incidentId?.replace('#', '') || undefined,
    source: parsedIncident.source,
    latitude: parsedIncident.latitude,
    longitude: parsedIncident.longitude,
    updatedAt: Timestamp.now(),
    weatherConditions: weatherInfo || undefined,
  };
}
