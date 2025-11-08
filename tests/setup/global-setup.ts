import type { FullConfig, BrowserContext } from '@playwright/test';
import { chromium } from '@playwright/test';

const EMAIL = process.env.TEST_EMAIL || 'test@test.com';
const PASSWORD = process.env.TEST_PASSWORD || 'test25';

async function tryLogin(context: BrowserContext, baseURL: string) {
  const page = await context.newPage();
  const cb = Date.now();
  await page.goto(`${baseURL}/?cb=${cb}`, { waitUntil: 'networkidle' });

  const isAuthed =
    await page.locator('[data-testid="incidents-list"]').first().isVisible().catch(() => false);

  if (isAuthed) {
    await context.storageState({ path: 'artifacts/auth.json' });
    await page.close();
    return;
  }

  const candidatePaths = ['/login', '/auth/signin', '/signin', '/account/login'];
  let loggedIn = false;

  for (const path of candidatePaths) {
    await page.goto(`${baseURL}${path}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' });

    // Find email field
    const emailField =
      page.getByLabel(/email/i).first().or(page.getByPlaceholder(/email/i).first())
        .or(page.locator('input[type="email"]').first())
        .or(page.locator('[name="email"]').first());
    const passwordField =
      page.getByLabel(/password/i).first().or(page.getByPlaceholder(/password/i).first())
        .or(page.locator('input[type="password"]').first())
        .or(page.locator('[name="password"]').first());

    const hasEmail = await emailField.isVisible().catch(() => false);
    const hasPassword = await passwordField.isVisible().catch(() => false);
    if (!hasEmail || !hasPassword) continue;

    await emailField.fill(EMAIL);
    await passwordField.fill(PASSWORD);

    // Submit: click a likely button or press Enter
    const submit =
      page.getByRole('button', { name: /sign in|log in|continue|submit/i }).first()
        .or(page.locator('button[type="submit"]').first());
    const hasSubmit = await submit.isVisible().catch(() => false);
    if (hasSubmit) await submit.click(); else await passwordField.press('Enter');

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // Consider login successful if redirected off auth path or list is visible
    const onList = await page.locator('[data-testid="incidents-list"]').first().isVisible().catch(() => false);
    const notAuthPath = !candidatePaths.some(p => (page.url() || '').includes(p));
    if (onList || notAuthPath) {
      loggedIn = true;
      break;
    }
  }

  if (!loggedIn) {
    // As a fallback, try root again (some auth flows redirect automatically)
    await page.goto(`${baseURL}/?cb=${Date.now()}`, { waitUntil: 'networkidle' });
  }

  await context.storageState({ path: 'artifacts/auth.json' });
  await page.close();
}

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await tryLogin(context, config.projects![0].use!.baseURL as string);
  await browser.close();
}

