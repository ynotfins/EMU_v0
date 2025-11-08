import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;
const BASE_URL = 'https://rebuild.4axe.com';

test.describe('Incidents page shows alert messages', () => {
  for (const variant of variants) {
    test(`incidents list visible: ${variant}`, async ({ page }) => {
      const url = `${BASE_URL}/${variant}?cb=${Date.now()}`;
      
      // Navigate and wait for page to load
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait a bit for any redirects or client-side navigation
      await page.waitForTimeout(3000);
      
      // Check current URL - might be /incidents or /login
      const currentUrl = page.url();
      
      // If we're on login page, skip test (requires authentication)
      if (currentUrl.includes('/login')) {
        test.skip();
        return;
      }
      
      // Try to find incidents list - might be on /incidents or still on /chaser or /supe
      const list = page.getByTestId('incidents-list');
      
      // Wait for list with reasonable timeout
      try {
        await expect(list).toBeVisible({ timeout: 20000 });
      } catch (e) {
        // If list not found, take screenshot for debugging
        await page.screenshot({ 
          path: `screenshots/live/${variant}-incidents-error.png`, 
          fullPage: true 
        });
        throw e;
      }
      
      // Check for incident items
      const items = list.getByTestId('incident-item');
      const itemCount = await items.count();
      
      expect(itemCount).toBeGreaterThan(5);
      
      // Check first 3 items have visible, non-empty messages
      const firstThree = await items.all();
      const itemsToCheck = firstThree.slice(0, Math.min(3, itemCount));
      
      for (let i = 0; i < itemsToCheck.length; i++) {
        const item = itemsToCheck[i];
        const msg = item.getByTestId('incident-message');
        
        await expect(msg).toBeVisible();
        
        const text = (await msg.textContent())?.trim() ?? '';
        
        // Assert message is non-empty and has reasonable length
        expect(text.length).toBeGreaterThan(20);
        
        // Assert message contains delimiter or is substantial
        const hasDelimiter = text.includes('|') || text.includes('•') || text.includes(',');
        const isSubstantial = text.length >= 60;
        
        expect(hasDelimiter || isSubstantial).toBeTruthy();
      }
      
      // Capture screenshot
      await page.screenshot({ 
        path: `screenshots/live/${variant}-incidents.png`, 
        fullPage: true 
      });
    });
  }
});



