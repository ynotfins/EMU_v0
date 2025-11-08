import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'https://rebuild.4axe.com',
    storageState: 'artifacts/auth.json',
    serviceWorkers: 'block',
    viewport: { width: 390, height: 844 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  globalSetup: './tests/setup/global-setup.ts',
});
