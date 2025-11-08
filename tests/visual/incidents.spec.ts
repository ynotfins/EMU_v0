import { test, expect } from '@playwright/test';

const variants = ['chaser', 'supe'] as const;
const BASE_URL = 'https://rebuild.4axe.com';

test.describe('Incidents page shows alert messages', () => {
  for (const variant of variants) {
    test(`incidents list visible: ${variant}`, async ({ page }) => {
      const url = `${BASE_URL}/${variant}?cb=${Date.now()}`;
      
      // Navigate and wait for redirect to /incidents
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait for navigation to complete (redirect from /chaser or /supe to /incidents)
      await page.waitForURL(/\/incidents/, { timeout: 30000 });
      
      // Wait for list to appear with longer timeout
      const list = page.getByTestId('incidents-list');
      await expect(list).toBeVisible({ timeout: 30000 });
      
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


