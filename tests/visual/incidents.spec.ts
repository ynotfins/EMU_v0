import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;

test.describe('Incidents page shows visible messages', () => {
  for (const v of variants) {
    test(`incidents visible for ${v}`, async ({ page, baseURL }) => {
      // Navigate to the role-specific incidents route
      const url = `${baseURL}/${v}/incidents?cb=${Date.now()}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for page to fully load
      await page.waitForTimeout(2000);
      
      const list = page.getByTestId('incidents-list');
      await expect(list).toBeVisible({ timeout: 30000 });

      const items = list.getByTestId('incident-item');
      await expect.soft(items).toHaveCountGreaterThan(5);

      const top = (await items.all()).slice(0, 3);
      for (const item of top) {
        const msg = item.getByTestId('incident-message');
        await expect(msg).toBeVisible();
        const text = (await msg.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(30);
        expect(/[|•,]|#[0-9]{4,}/.test(text)).toBeTruthy();
      }

      await page.screenshot({ path: `screenshots/live/${v}-incidents.png`, fullPage: true });
    });
  }
});



