import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;

test.describe('Details page renders full alert text', () => {
  for (const v of variants) {
    test(`details visible for ${v}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/${v}?cb=${Date.now()}`, { waitUntil: 'networkidle' });
      const items = page.getByTestId('incidents-list').getByTestId('incident-item');
      const firstThree = (await items.all()).slice(0, 3);
      expect(firstThree.length).toBeGreaterThan(0);

      for (const item of firstThree) {
        const id = await item.getAttribute('data-incident-id');
        expect(id).toBeTruthy();

        await page.goto(`${baseURL}/${v}/incident/${id}?cb=${Date.now()}`, { waitUntil: 'networkidle' });
        const container = page.getByTestId('incident-details');
        await expect(container).toBeVisible();

        const msg = page.getByTestId('incident-details-message');
        await expect(msg).toBeVisible();
        const text = (await msg.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(30);

        await page.screenshot({ path: `screenshots/live/${v}-${id}-details.png`, fullPage: true });
      }
    });
  }
});
