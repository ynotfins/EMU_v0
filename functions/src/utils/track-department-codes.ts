import * as admin from 'firebase-admin';
import type { CodeMapping } from '../data/fire-departments/types';

if (!admin.apps.length) {
  const serviceAccount = require('../firebase-admin-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

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

  const batch = db.batch();
  const now = new Date().toISOString();

  for (const code of codes) {
    const mappingRef = db.collection('fireDepartmentMappings').doc(code);
    const mappingSnap = await mappingRef.get();

    if (mappingSnap.exists) {
      const existing = mappingSnap.data() as CodeMapping;
      const addressKey = `${address.toLowerCase()}|${city.toLowerCase()}|${state.toLowerCase()}|${(county || '').toLowerCase()}`;
      
      const addressExists = existing.addressAssociations.some(
        (a) => a.address.toLowerCase() === address.toLowerCase() &&
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
          (a) => a.address.toLowerCase() === address.toLowerCase() &&
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
      batch.update(mappingRef, existing);
    } else {
      const stateMatch = code.match(/^([a-z]{2})\d+/i);
      const newMapping: CodeMapping = {
        code,
        state: stateMatch ? stateMatch[1].toUpperCase() : undefined,
        confidence: 'unknown',
        source: 'crossref',
        addressAssociations: [{
          address,
          city,
          state,
          county: county || undefined,
          alertType: alertType || undefined,
          incidentCount: 1,
          firstSeen: now,
          lastSeen: now,
        }],
        createdAt: now,
        updatedAt: now,
      };
      batch.set(mappingRef, newMapping);
    }
  }

  await batch.commit();
}

