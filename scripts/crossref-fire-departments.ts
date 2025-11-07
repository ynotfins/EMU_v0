import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import type { FireDepartment, CodeMapping, AddressCodeAssociation } from '../data/fire-departments/types';

if (!admin.apps.length) {
  const serviceAccount = require('../firebase-admin-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function loadFireDepartments(): Promise<FireDepartment[]> {
  const filePath = path.join(__dirname, '../data/fire-departments/fire-departments-reference.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Reference file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as FireDepartment[];
}

async function getAddressCodeAssociations(): Promise<Map<string, AddressCodeAssociation>> {
  const associations = new Map<string, AddressCodeAssociation>();
  
  const incidentsSnapshot = await db.collection('incidents')
    .where('departmentCodes', '!=', null)
    .limit(1000)
    .get();

  incidentsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const codes = data.departmentCodes || [];
    const address = data.address || data.location?.address || '';
    const city = data.city || data.location?.city || '';
    const state = data.state || data.location?.state || '';
    
    if (!address || !city || codes.length === 0) return;

    const key = `${address.toLowerCase()}|${city.toLowerCase()}|${state.toLowerCase()}`;
    const existing = associations.get(key);

    if (existing) {
      existing.incidentCount++;
      existing.lastSeen = data.updatedAt || data.createdAt || new Date().toISOString();
      codes.forEach((code: string) => {
        if (!existing.codes.includes(code)) {
          existing.codes.push(code);
        }
      });
    } else {
      associations.set(key, {
        address,
        city,
        state,
        zipCode: data.zipCode || data.location?.zipCode,
        codes: [...codes],
        incidentCount: 1,
        firstSeen: data.createdAt || new Date().toISOString(),
        lastSeen: data.updatedAt || data.createdAt || new Date().toISOString(),
        confidence: 'unknown',
      });
    }
  });

  return associations;
}

function matchCodeToDepartment(
  code: string,
  departments: FireDepartment[],
  addressAssociations: AddressCodeAssociation[]
): { fdid?: string; departmentName?: string; confidence: 'confirmed' | 'likely' | 'unknown' } {
  const codeLower = code.toLowerCase();
  
  const stateMatch = codeLower.match(/^([a-z]{2})\d+/);
  if (!stateMatch) return { confidence: 'unknown' };

  const stateAbbr = stateMatch[1].toUpperCase();
  
  const matchingAssociations = addressAssociations.filter((assoc) =>
    assoc.codes.includes(code)
  );

  if (matchingAssociations.length === 0) {
    return { confidence: 'unknown' };
  }

  const departmentsInState = departments.filter((dept) => dept.state === stateAbbr);
  
  for (const assoc of matchingAssociations) {
    const locationMatch = departmentsInState.find((dept) => {
      const cityMatch = dept.city?.toLowerCase() === assoc.city.toLowerCase();
      const countyMatch = dept.county?.toLowerCase().includes(assoc.city.toLowerCase()) ||
                         assoc.city.toLowerCase().includes(dept.county?.toLowerCase() || '');
      return cityMatch || countyMatch;
    });

    if (locationMatch) {
      return {
        fdid: locationMatch.fdid,
        departmentName: locationMatch.name,
        confidence: cityMatch ? 'confirmed' : 'likely',
      };
    }
  }

  return { confidence: 'unknown' };
}

async function crossReference(): Promise<void> {
  console.log('🔄 Starting fire department code cross-reference...\n');

  const departments = await loadFireDepartments();
  console.log(`📋 Loaded ${departments.length} fire departments from reference\n`);

  const addressAssociations = await getAddressCodeAssociations();
  console.log(`📍 Found ${addressAssociations.size} unique address-code associations\n`);

  const allCodes = new Set<string>();
  Array.from(addressAssociations.values()).forEach((assoc) => {
    assoc.codes.forEach((code) => allCodes.add(code));
  });

  console.log(`🔢 Found ${allCodes.size} unique department codes\n`);

  const mappings: CodeMapping[] = [];

  for (const code of allCodes) {
    const match = matchCodeToDepartment(code, departments, Array.from(addressAssociations.values()));
    
    const codeAssociations = Array.from(addressAssociations.values())
      .filter((assoc) => assoc.codes.includes(code))
      .map((assoc) => ({
        address: assoc.address,
        city: assoc.city,
        state: assoc.state,
        incidentCount: assoc.incidentCount,
      }));

    mappings.push({
      code,
      fdid: match.fdid,
      departmentName: match.departmentName,
      state: code.match(/^([a-z]{2})\d+/i)?.[1].toUpperCase(),
      confidence: match.confidence,
      source: match.confidence === 'confirmed' ? 'crossref' : 'unknown',
      addressAssociations: codeAssociations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const outputPath = path.join(__dirname, '../data/fire-departments/code-mappings.json');
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2));
  console.log(`✅ Saved ${mappings.length} code mappings to ${outputPath}\n`);

  const confirmed = mappings.filter((m) => m.confidence === 'confirmed').length;
  const likely = mappings.filter((m) => m.confidence === 'likely').length;
  const unknown = mappings.filter((m) => m.confidence === 'unknown').length;

  console.log('📊 Results:');
  console.log(`   ✅ Confirmed: ${confirmed}`);
  console.log(`   ⚠️  Likely: ${likely}`);
  console.log(`   ❓ Unknown: ${unknown}\n`);

  console.log('💾 Saving to Firestore...');
  const batch = db.batch();
  let count = 0;

  for (const mapping of mappings) {
    const ref = db.collection('fireDepartmentMappings').doc(mapping.code);
    batch.set(ref, mapping);
    count++;

    if (count >= 500) {
      await batch.commit();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`✅ Saved ${mappings.length} mappings to Firestore collection 'fireDepartmentMappings'`);
}

crossReference().catch(console.error);

