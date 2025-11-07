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

  const departments: FireDepartment[] = records.map((row) => ({
    fdid: row.fdid?.trim() || '',
    name: row.name?.trim() || '',
    state: row.state?.trim() || '',
    county: row.county?.trim(),
    city: row.city?.trim(),
    address: row.address?.trim(),
    zipCode: row.zipCode?.trim() || row.zipcode?.trim(),
    phone: row.phone?.trim(),
    website: row.website?.trim(),
    encryptionPolicy: (row.encryptionPolicy?.trim() || row['encryption policy']?.trim() || 'unknown') as FireDepartment['encryptionPolicy'],
    notes: row.notes?.trim(),
  })).filter((dept) => dept.fdid && dept.name);

  fs.writeFileSync(outputPath, JSON.stringify(departments, null, 2));
  console.log(`✅ Imported ${departments.length} fire departments to ${outputPath}`);
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

