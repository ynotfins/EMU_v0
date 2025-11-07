export type EncryptionPolicy = 
  | 'all_unencrypted' 
  | 'first_unencrypted_then_encrypted' 
  | 'all_encrypted'
  | 'unknown';

export interface FireDepartment {
  fdid: string;
  name: string;
  state: string;
  county?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  serviceArea?: string[];
  encryptionPolicy?: EncryptionPolicy;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentCode {
  code: string;
  fdid?: string;
  departmentName?: string;
  state?: string;
  confidence: 'confirmed' | 'likely' | 'unknown';
  source: 'manual' | 'crossref' | 'scraped';
  notes?: string;
}

export interface AddressCodeAssociation {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  codes: string[];
  primaryCode?: string;
  fdid?: string;
  departmentName?: string;
  incidentCount: number;
  firstSeen: string;
  lastSeen: string;
  confidence: 'confirmed' | 'likely' | 'unknown';
}

export interface CodeMapping {
  code: string;
  fdid?: string;
  departmentName?: string;
  state?: string;
  county?: string;
  city?: string;
  addressAssociations: Array<{
    address: string;
    city: string;
    state: string;
    county?: string;
    alertType?: string;
    incidentCount: number;
    firstSeen?: string;
    lastSeen?: string;
  }>;
  confidence: 'confirmed' | 'likely' | 'unknown';
  source: 'manual' | 'crossref' | 'scraped';
  createdAt: string;
  updatedAt: string;
}

