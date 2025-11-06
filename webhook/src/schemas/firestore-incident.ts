import { z } from 'zod';

export const activitySchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  timestamp: z.any().optional(),
  source: z.string().optional(),
});

export const firestoreIncidentSchema = z.object({
  date: z.string(),
  time: z.string(),
  distance: z.number().nonnegative(),
  state: z.string(),
  county: z.string(),
  city: z.string(),
  address: z.string(),
  type: z.string(),
  description: z.string(),
  emergencyServicesStatus: z.string().optional(),
  incidentId: z.string().optional(),
  source: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  respondedBy: z.string().optional(),
  respondedAt: z.any().optional(),
  activity: z.array(activitySchema).optional(),
});

export type FirestoreIncident = z.infer<typeof firestoreIncidentSchema>;
export type Activity = z.infer<typeof activitySchema>;
