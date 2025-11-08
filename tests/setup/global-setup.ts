import type { FullConfig, BrowserContext } from '@playwright/test';
import { chromium } from '@playwright/test';

const EMAIL = process.env.TEST_EMAIL || 'test@test.com';
const PASSWORD = process.env.TEST_PASSWORD || 'test25';

async function tryLogin(context: BrowserContext, baseURL: string) {
  const page = await context.newPage();
  const cb = Date.now();
  await page.goto(`${baseURL}/?cb=${cb}`, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait a bit for client-side redirects
  await page.waitForTimeout(2000);

  const isAuthed =
    await page.locator('[data-testid="incidents-list"]').first().isVisible().catch(() => false);

  if (isAuthed) {
    console.log('Already authenticated, saving session');
    await context.storageState({ path: 'artifacts/auth.json' });
    await page.close();
    return;
  }

  console.log('Not authenticated, attempting login...');
  const candidatePaths = ['/login', '/auth/signin', '/signin', '/account/login'];
  let loggedIn = false;

  for (const path of candidatePaths) {
    console.log(`Trying login path: ${path}`);
    await page.goto(`${baseURL}${path}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Find email field - try multiple selectors
    let emailField = null;
    let passwordField = null;

    // Try getByLabel first
    try {
      emailField = page.getByLabel(/email/i).first();
      if (!(await emailField.isVisible({ timeout: 2000 }).catch(() => false))) {
        emailField = null;
      }
    } catch {}

    if (!emailField) {
      try {
        emailField = page.getByPlaceholder(/email/i).first();
        if (!(await emailField.isVisible({ timeout: 2000 }).catch(() => false))) {
          emailField = null;
        }
      } catch {}
    }

    if (!emailField) {
      try {
        emailField = page.locator('input[type="email"]').first();
        if (!(await emailField.isVisible({ timeout: 2000 }).catch(() => false))) {
          emailField = null;
        }
      } catch {}
    }

    if (!emailField) {
      try {
        emailField = page.locator('[name="email"]').first();
        if (!(await emailField.isVisible({ timeout: 2000 }).catch(() => false))) {
          emailField = null;
        }
      } catch {}
    }

    // Try password field
    try {
      passwordField = page.getByLabel(/password/i).first();
      if (!(await passwordField.isVisible({ timeout: 2000 }).catch(() => false))) {
        passwordField = null;
      }
    } catch {}

    if (!passwordField) {
      try {
        passwordField = page.getByPlaceholder(/password/i).first();
        if (!(await passwordField.isVisible({ timeout: 2000 }).catch(() => false))) {
          passwordField = null;
        }
      } catch {}
    }

    if (!passwordField) {
      try {
        passwordField = page.locator('input[type="password"]').first();
        if (!(await passwordField.isVisible({ timeout: 2000 }).catch(() => false))) {
          passwordField = null;
        }
      } catch {}
    }

    if (!passwordField) {
      try {
        passwordField = page.locator('[name="password"]').first();
        if (!(await passwordField.isVisible({ timeout: 2000 }).catch(() => false))) {
          passwordField = null;
        }
      } catch {}
    }

    // Check if we need to click "Sign in with Email" button first
    const emailSignInButton = page.getByRole('button', { name: /sign in with email/i }).first();
    const hasEmailButton = await emailSignInButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasEmailButton) {
      console.log('Clicking "Sign in with Email" button...');
      await emailSignInButton.click();
      await page.waitForTimeout(1000); // Wait for form to appear
      
      // Re-find fields after clicking
      emailField = page.locator('input[type="email"]').first();
      passwordField = page.locator('input[type="password"]').first();
      
      const hasEmail = await emailField.isVisible({ timeout: 2000 }).catch(() => false);
      const hasPassword = await passwordField.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!hasEmail || !hasPassword) {
        console.log(`Email/password form not found after clicking button on ${path}`);
        continue;
      }
    } else if (!emailField || !passwordField) {
      console.log(`Login form not found on ${path}`);
      continue;
    }

    console.log(`Found login form on ${path}, filling credentials...`);
    await emailField.fill(EMAIL);
    await passwordField.fill(PASSWORD);

    // Submit: click a likely button or press Enter
    const submit =
      page.getByRole('button', { name: /sign in|log in|continue|submit/i }).first()
        .or(page.locator('button[type="submit"]').first());
    const hasSubmit = await submit.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasSubmit) {
      console.log('Clicking submit button...');
      await submit.click();
    } else {
      console.log('Pressing Enter on password field...');
      await passwordField.press('Enter');
    }

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000); // Wait for any redirects

    // Consider login successful if redirected off auth path or list is visible
    const onList = await page.locator('[data-testid="incidents-list"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    const currentUrl = page.url();
    const notAuthPath = !candidatePaths.some(p => currentUrl.includes(p));
    
    console.log(`After login attempt: onList=${onList}, notAuthPath=${notAuthPath}, url=${currentUrl}`);
    
    if (onList || notAuthPath) {
      loggedIn = true;
      console.log('Login successful!');
      break;
    }
  }

  if (!loggedIn) {
    console.log('Login failed, trying root again...');
    // As a fallback, try root again (some auth flows redirect automatically)
    await page.goto(`${baseURL}/?cb=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
  }

  console.log('Saving storage state...');
  await context.storageState({ path: 'artifacts/auth.json' });
  await page.close();
}

export default async function globalSetup(config: FullConfig) {
  console.log('Starting global setup...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const baseURL = config.projects![0].use!.baseURL as string;
  console.log(`Base URL: ${baseURL}`);
  await tryLogin(context, baseURL);
  await browser.close();
  console.log('Global setup complete');
}


