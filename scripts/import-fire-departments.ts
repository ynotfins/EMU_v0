import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import type { FireDepartment } from '../data/fire-departments/types';

function csvToJson(csvPath: string, outputPath: string): void {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const departments: FireDepartment[] = records.map((row) => {
    const encryptionPolicy = 
      row['Encryption Policy']?.trim() || 
      row['encryptionPolicy']?.trim() || 
      row['encryption policy']?.trim() ||
      extractEncryptionPolicyFromNotes(row['Primary agency for emergency mgmt'] || row['Notes'] || '') ||
      'unknown';

    return {
      fdid: row['FDID']?.trim() || row['fdid']?.trim() || '',
      name: row['Fire dept name']?.trim() || row['name']?.trim() || '',
      state: row['HQ state']?.trim() || row['state']?.trim() || 'NJ',
      county: row['County']?.trim() || row['county']?.trim(),
      city: row['HQ city']?.trim() || row['city']?.trim(),
      address: row['HQ addr1']?.trim() || row['address']?.trim(),
      zipCode: row['HQ zip']?.trim() || row['zipCode']?.trim() || row['zipcode']?.trim(),
      phone: row['HQ phone']?.trim() || row['phone']?.trim(),
      website: row['Website']?.trim() || row['website']?.trim(),
      encryptionPolicy: normalizeEncryptionPolicy(encryptionPolicy),
      notes: [
        row['Encryption Notes']?.trim(),
        row['Primary agency for emergency mgmt']?.trim(),
        row['Notes']?.trim(),
      ].filter(Boolean).join(' | ') || undefined,
    };
  }).filter((dept) => dept.fdid && dept.name);

  fs.writeFileSync(outputPath, JSON.stringify(departments, null, 2));
  console.log(`✅ Imported ${departments.length} fire departments to ${outputPath}`);
}

function extractEncryptionPolicyFromNotes(notes: string): string {
  const lowerNotes = notes.toLowerCase();
  
  if (lowerNotes.includes('all encrypted') || lowerNotes.includes('fully encrypted') || lowerNotes.includes('encrypted')) {
    if (lowerNotes.includes('first call') || lowerNotes.includes('initial call') || lowerNotes.includes('dispatch')) {
      return 'first_unencrypted_then_encrypted';
    }
    return 'all_encrypted';
  }
  
  if (lowerNotes.includes('unencrypted') || lowerNotes.includes('clear') || lowerNotes.includes('analog')) {
    return 'all_unencrypted';
  }
  
  return 'unknown';
}

function normalizeEncryptionPolicy(policy: string): FireDepartment['encryptionPolicy'] {
  const normalized = policy.toLowerCase().trim();
  
  if (normalized === 'all_unencrypted' || normalized === 'all unencrypted' || normalized === 'unencrypted') {
    return 'all_unencrypted';
  }
  
  if (normalized === 'first_unencrypted_then_encrypted' || 
      normalized === 'first unencrypted then encrypted' ||
      normalized === 'first call unencrypted') {
    return 'first_unencrypted_then_encrypted';
  }
  
  if (normalized === 'all_encrypted' || normalized === 'all encrypted' || normalized === 'encrypted') {
    return 'all_encrypted';
  }
  
  return 'unknown';
}

const csvPath = process.argv[2];
const outputPath = process.argv[3] || path.join(__dirname, '../data/fire-departments/fire-departments-reference.json');

if (!csvPath) {
  console.error('Usage: tsx scripts/import-fire-departments.ts <csv-file> [output-json]');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  process.exit(1);
}

csvToJson(csvPath, outputPath);

