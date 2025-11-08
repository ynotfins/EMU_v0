import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;
const BASE_URL = 'https://rebuild.4axe.com';

test.describe('Details page shows alert message text', () => {
  for (const variant of variants) {
    test(`details visible: ${variant}`, async ({ page }) => {
      const base = `${BASE_URL}/${variant}?cb=${Date.now()}`;
      
      // Navigate and wait for redirect
      await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait for navigation to /incidents
      await page.waitForURL(/\/incidents/, { timeout: 30000 });
      
      // Wait for list to appear
      const list = page.getByTestId('incidents-list');
      await expect(list).toBeVisible({ timeout: 30000 });
      
      // Get first 3 incident items
      const items = list.getByTestId('incident-item');
      const itemCount = await items.count();
      
      expect(itemCount).toBeGreaterThan(0);
      
      const firstThree = await items.all();
      const itemsToCheck = firstThree.slice(0, Math.min(3, itemCount));
      
      for (let i = 0; i < itemsToCheck.length; i++) {
        const item = itemsToCheck[i];
        const id = await item.getAttribute('data-incident-id');
        
        expect(id).toBeTruthy();
        
        if (!id) continue;
        
        // Navigate to details page
        const detailsUrl = `${BASE_URL}/${variant}/incident/${id}?cb=${Date.now()}`;
        await page.goto(detailsUrl, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Wait for details page to load
        const details = page.getByTestId('incident-details');
        await expect(details).toBeVisible({ timeout: 30000 });
        
        // Check message is visible and non-empty
        const msg = page.getByTestId('incident-details-message');
        await expect(msg).toBeVisible({ timeout: 30000 });
        
        const text = (await msg.textContent())?.trim() ?? '';
        
        // Assert message is non-empty and has reasonable length
        expect(text.length).toBeGreaterThan(20);
        
        // Capture screenshot
        await page.screenshot({ 
          path: `screenshots/live/${variant}-${id}-details.png`, 
          fullPage: true 
        });
      }
    });
  }
});


