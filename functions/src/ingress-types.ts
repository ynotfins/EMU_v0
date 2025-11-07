import { Request, Response } from 'express';
import { DocumentData } from 'firebase-admin/firestore';

export interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

export interface CounterData extends DocumentData {
  next: number;
  updatedAt: unknown;
}

export interface ExistingIncidentData extends DocumentData {
  incidentNumber?: number;
  description?: string;
  state?: string | null;
  county?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  country?: string;
  type?: string | null;
  alertType?: string | null;
  severity?: string | null;
  fireDepartmentInfo?: string | null;
  departmentCodes?: string[] | null;
  createdAt?: unknown;
  activity?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: unknown;
    source?: string;
  }>;
}

export interface ParsedIncident {
  incidentId?: string;
  state?: string;
  county?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  country?: string;
  type?: string;
  description: string;
  severity?: string;
  fireDepartmentInfo?: string;
  departmentCodes?: string[];
  source?: string;
}

export interface GenerateObjectResult {
  object?: ParsedIncident;
  text?: string;
}

export interface ErrorWithStatus extends Error {
  status?: number;
}

