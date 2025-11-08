import * as admin from 'firebase-admin';

interface CodeMapping {
  code: string;
  originalCode?: string; // Original code before sanitization
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

function getDb() {
  return admin.firestore();
}

export async function trackDepartmentCodes(
  incidentId: string,
  codes: string[],
  address: string,
  city: string,
  state: string,
  county?: string,
  alertType?: string
): Promise<void> {
  if (!codes || codes.length === 0 || !address || !city || !state) return;

  const db = getDb();
  const batch = db.batch();
  const now = new Date().toISOString();

  for (const code of codes) {
    // Sanitize code: replace slashes with underscores for Firestore document ID
    const sanitizedCode = code.replace(/\//g, '_');
    const mappingRef = db.collection('fireDepartmentMappings').doc(sanitizedCode);
    const mappingSnap = await mappingRef.get();

    if (mappingSnap.exists) {
      const existing = mappingSnap.data() as CodeMapping;
      
      const addressExists = existing.addressAssociations.some(
        (a: CodeMapping['addressAssociations'][0]) => a.address.toLowerCase() === address.toLowerCase() &&
              a.city.toLowerCase() === city.toLowerCase() &&
              a.state.toLowerCase() === state.toLowerCase() &&
              (a.county || '').toLowerCase() === (county || '').toLowerCase()
      );

      if (!addressExists) {
        existing.addressAssociations.push({
          address,
          city,
          state,
          county: county || undefined,
          alertType: alertType || undefined,
          incidentCount: 1,
          firstSeen: now,
          lastSeen: now,
        });
      } else {
        const assoc = existing.addressAssociations.find(
          (a: CodeMapping['addressAssociations'][0]) => a.address.toLowerCase() === address.toLowerCase() &&
                a.city.toLowerCase() === city.toLowerCase() &&
                a.state.toLowerCase() === state.toLowerCase() &&
                (a.county || '').toLowerCase() === (county || '').toLowerCase()
        );
        if (assoc) {
          assoc.incidentCount++;
          assoc.lastSeen = now;
          if (alertType && !assoc.alertType) {
            assoc.alertType = alertType;
          } else if (alertType && assoc.alertType !== alertType) {
            assoc.alertType = `${assoc.alertType}, ${alertType}`;
          }
        }
      }

      existing.updatedAt = now;
      // Filter out undefined values for Firestore
      const updateData: Record<string, any> = {};
      Object.keys(existing).forEach(key => {
        const value = existing[key as keyof CodeMapping];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });
      batch.update(mappingRef, updateData);
    } else {
      const stateMatch = code.match(/^([a-z]{2})\d+/i);
      const newMapping: Record<string, any> = {
        code: sanitizedCode,
        originalCode: code,
        confidence: 'unknown',
        source: 'crossref',
        addressAssociations: [{
          address,
          city,
          state,
          ...(county ? { county } : {}),
          ...(alertType ? { alertType } : {}),
          incidentCount: 1,
          firstSeen: now,
          lastSeen: now,
        }],
        createdAt: now,
        updatedAt: now,
      };
      if (stateMatch) {
        newMapping.state = stateMatch[1].toUpperCase();
      }
      batch.set(mappingRef, newMapping);
    }
  }

  await batch.commit();
}

