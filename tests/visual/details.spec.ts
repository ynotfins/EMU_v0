import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;

test.describe('Details page renders full alert text', () => {
  for (const v of variants) {
    test(`details visible for ${v}`, async ({ page, baseURL }) => {
      // Navigate directly to /incidents
      await page.goto(`${baseURL}/incidents?cb=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait for incidents list to be visible
      const list = page.getByTestId('incidents-list');
      await expect(list).toBeVisible({ timeout: 30000 });
      
      const items = list.getByTestId('incident-item');
      const itemCount = await items.count();
      
      expect(itemCount).toBeGreaterThan(0);
      
      const firstThree = (await items.all()).slice(0, Math.min(3, itemCount));

      for (const item of firstThree) {
        const id = await item.getAttribute('data-incident-id');
        expect(id).toBeTruthy();

        await page.goto(`${baseURL}/${v}/incident/${id}?cb=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
        const container = page.getByTestId('incident-details');
        await expect(container).toBeVisible({ timeout: 30000 });

        const msg = page.getByTestId('incident-details-message');
        await expect(msg).toBeVisible({ timeout: 30000 });
        const text = (await msg.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(30);

        await page.screenshot({ path: `screenshots/live/${v}-${id}-details.png`, fullPage: true });
      }
    });
  }
});


