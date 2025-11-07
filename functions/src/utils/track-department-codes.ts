import * as admin from 'firebase-admin';
import type { CodeMapping } from '../data/fire-departments/types';

if (!admin.apps.length) {
  const serviceAccount = require('../firebase-admin-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function trackDepartmentCodes(incidentId: string, codes: string[], address: string, city: string, state: string): Promise<void> {
  if (!codes || codes.length === 0) return;

  const batch = db.batch();

  for (const code of codes) {
    const mappingRef = db.collection('fireDepartmentMappings').doc(code);
    const mappingSnap = await mappingRef.get();

    const addressKey = `${address.toLowerCase()}|${city.toLowerCase()}|${state.toLowerCase()}`;
    
    if (mappingSnap.exists) {
      const existing = mappingSnap.data() as CodeMapping;
      const addressExists = existing.addressAssociations.some(
        (a) => a.address.toLowerCase() === address.toLowerCase() &&
              a.city.toLowerCase() === city.toLowerCase() &&
              a.state.toLowerCase() === state.toLowerCase()
      );

      if (!addressExists) {
        existing.addressAssociations.push({
          address,
          city,
          state,
          incidentCount: 1,
        });
      } else {
        const assoc = existing.addressAssociations.find(
          (a) => a.address.toLowerCase() === address.toLowerCase() &&
                a.city.toLowerCase() === city.toLowerCase() &&
                a.state.toLowerCase() === state.toLowerCase()
        );
        if (assoc) {
          assoc.incidentCount++;
        }
      }

      existing.updatedAt = new Date().toISOString();
      batch.update(mappingRef, existing);
    } else {
      const newMapping: CodeMapping = {
        code,
        state: code.match(/^([a-z]{2})\d+/i)?.[1].toUpperCase(),
        confidence: 'unknown',
        source: 'crossref',
        addressAssociations: [{
          address,
          city,
          state,
          incidentCount: 1,
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(mappingRef, newMapping);
    }
  }

  await batch.commit();
}

