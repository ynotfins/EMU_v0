#!/usr/bin/env tsx

/**
 * Pre-Build Check Script
 * 
 * Runs various checks to catch issues before building or committing.
 * Helps identify common problems that cause build failures.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const checks: CheckResult[] = [];

function runCommand(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stdout || error.message };
  }
}

function addCheck(result: CheckResult) {
  checks.push(result);
  const status = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`${status} ${result.name}: ${result.message}`);
  if (result.details && result.details.length > 0) {
    result.details.forEach(detail => console.log(`  ${colors.yellow}→${colors.reset} ${detail}`));
  }
}

console.log(`${colors.blue}Running Pre-Build Checks...${colors.reset}\n`);

// Check 1: TypeScript compilation
console.log('Checking TypeScript...');
const tsCheck = runCommand('pnpm typecheck');
const tsErrors = (tsCheck.output.match(/error TS/g) || []).length;
addCheck({
  name: 'TypeScript',
  passed: tsErrors === 0,
  message: tsErrors === 0 ? 'No TypeScript errors' : `${tsErrors} TypeScript errors found`,
  details: tsErrors > 0 ? ['Run "pnpm typecheck" to see all errors'] : undefined
});

// Check 2: ESLint
console.log('\nChecking ESLint...');
const eslintCheck = runCommand('pnpm lint');
addCheck({
  name: 'ESLint',
  passed: eslintCheck.success,
  message: eslintCheck.success ? 'No ESLint errors' : 'ESLint errors found',
  details: !eslintCheck.success ? ['Run "pnpm lint" to see all errors'] : undefined
});

// Check 3: Check for missing dependencies
console.log('\nChecking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const nodeModulesExists = fs.existsSync('node_modules');
const lockFileExists = fs.existsSync('pnpm-lock.yaml');
addCheck({
  name: 'Dependencies',
  passed: nodeModulesExists && lockFileExists,
  message: nodeModulesExists && lockFileExists ? 'Dependencies installed' : 'Missing dependencies',
  details: !nodeModulesExists ? ['Run "pnpm install"'] : undefined
});

// Check 4: Environment variables
console.log('\nChecking environment variables...');
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
addCheck({
  name: 'Environment Variables',
  passed: missingEnvVars.length === 0,
  message: missingEnvVars.length === 0 ? 'All required env vars present' : `Missing ${missingEnvVars.length} env vars`,
  details: missingEnvVars.length > 0 ? missingEnvVars : undefined
});

// Check 5: Check for common import errors
console.log('\nChecking for common import errors...');
const srcPath = path.join(process.cwd(), 'src');
let importErrors: string[] = [];

function checkImports(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      checkImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for imports from paths that don't exist
      const importRegex = /import\s+.*\s+from\s+['"](.+?)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Check for old imports that should be updated
        if (importPath.includes('../lib/firebase') || importPath.includes('../lib/modules')) {
          importErrors.push(`${filePath}: Old import pattern "${importPath}"`);
        }
        
        // Check for missing @ aliases
        if (importPath.startsWith('../') && filePath.includes('/src/')) {
          const depth = (filePath.match(/\//g) || []).length;
          if (depth > 3) {
            importErrors.push(`${filePath}: Consider using @ alias instead of "${importPath}"`);
          }
        }
      }
    }
  }
}

checkImports(srcPath);
addCheck({
  name: 'Import Patterns',
  passed: importErrors.length === 0,
  message: importErrors.length === 0 ? 'No import issues found' : `${importErrors.length} import issues found`,
  details: importErrors.slice(0, 5)
});

// Check 6: Check for TODO comments
console.log('\nChecking for TODO comments...');
let todoCount = 0;
function countTodos(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      countTodos(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/TODO|FIXME|XXX|HACK/g);
      if (matches) {
        todoCount += matches.length;
      }
    }
  }
}
countTodos(srcPath);
addCheck({
  name: 'TODO Comments',
  passed: true, // This is informational
  message: `${todoCount} TODO/FIXME comments found`,
  details: todoCount > 10 ? ['Consider addressing some TODOs'] : undefined
});

// Summary
console.log(`\n${colors.blue}Summary:${colors.reset}`);
const passed = checks.filter(c => c.passed).length;
const failed = checks.filter(c => !c.passed).length;

console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed > 0) {
  console.log(`\n${colors.yellow}⚠️  Fix the above issues before building or committing.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ All checks passed! Ready to build.${colors.reset}`);
  process.exit(0);
}
