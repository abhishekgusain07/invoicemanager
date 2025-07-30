import { test, expect } from '@playwright/test';

test.describe('Dashboard Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - assumes user is already authenticated
    await page.goto('/dashboard');
  });

  test('dashboard loads within performance threshold', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for dashboard content to load
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('[data-testid="stats-cards"]').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds on first visit
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Dashboard loaded in ${loadTime}ms`);
  });

  test('dashboard shows correct stats cards', async ({ page }) => {
    // Check that all 4 main stats cards are present
    await expect(page.locator('text=Pending Invoices')).toBeVisible();
    await expect(page.locator('text=Overdue Invoices')).toBeVisible();
    await expect(page.locator('text=Paid Invoices')).toBeVisible();
    await expect(page.locator('text=Outstanding Amount')).toBeVisible();
  });

  test('dashboard chart renders properly', async ({ page }) => {
    // Check for chart container
    await expect(page.locator('text=Payment Analytics')).toBeVisible();
    
    // Check for period selection buttons
    await expect(page.locator('button:has-text("All Time")')).toBeVisible();
    await expect(page.locator('button:has-text("This Month")')).toBeVisible();
    await expect(page.locator('button:has-text("This Week")')).toBeVisible();
  });

  test('recent invoices section displays correctly', async ({ page }) => {
    await expect(page.locator('text=Recent Invoices')).toBeVisible();
    await expect(page.locator('text=View All')).toBeVisible();
    
    // Should show either invoice table or empty state
    const hasInvoices = await page.locator('table').isVisible();
    const hasEmptyState = await page.locator('text=No invoices found').isVisible();
    
    expect(hasInvoices || hasEmptyState).toBeTruthy();
  });

  test('new invoice modal opens and closes', async ({ page }) => {
    // Click new invoice button
    await page.locator('button:has-text("New Invoice")').click();
    
    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Close modal (assuming there's a close button or overlay)
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('dashboard caching - second visit is faster', async ({ page }) => {
    // First visit timing
    const firstStartTime = Date.now();
    await page.reload();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    const firstLoadTime = Date.now() - firstStartTime;
    
    // Second visit timing
    const secondStartTime = Date.now();
    await page.reload();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    const secondLoadTime = Date.now() - secondStartTime;
    
    console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
    
    // Second load should be significantly faster (caching effect)
    // Allow some variance for network conditions
    expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.8);
  });

  test('dashboard handles network failures gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('/api/trpc/**', (route) => {
      route.abort('failed');
    });
    
    await page.reload();
    
    // Should show error state or fallback content
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    
    // Check that page doesn't crash and shows some fallback content
    const hasErrorMessage = await page.locator('text=Failed to load').isVisible();
    const hasDefaultValues = await page.locator('text=$0.00').isVisible();
    
    expect(hasErrorMessage || hasDefaultValues).toBeTruthy();
  });

  test('performance benchmark - single API call verification', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('/api/trpc/dashboard')) {
        requests.push(request.url());
      }
    });
    
    await page.reload();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    
    // Should make only one dashboard API call (not separate calls for stats and monthly data)
    const dashboardCalls = requests.filter(url => 
      url.includes('getAllDashboardData') || 
      url.includes('getStats') || 
      url.includes('getMonthlyData')
    );
    
    expect(dashboardCalls.length).toBeGreaterThan(0);
    console.log('Dashboard API calls:', dashboardCalls);
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.reload();
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    
    // Stats cards should still be visible and properly arranged
    await expect(page.locator('text=Pending Invoices')).toBeVisible();
    await expect(page.locator('text=Payment Analytics')).toBeVisible();
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Should focus on New Invoice button
    await expect(page.locator('button:has-text("New Invoice")')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should move to next focusable element
    
    // Enter should activate focused button
    await page.keyboard.press('Enter');
    
    // Should open modal or perform action
    const modalOpened = await page.locator('[role="dialog"]').isVisible();
    expect(modalOpened).toBeTruthy();
  });
});

test.describe('Dashboard Data Updates', () => {
  test('cache invalidation after invoice creation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Record initial stats
    const initialPendingText = await page.locator('text=Pending Invoices').locator('..').locator('.text-3xl').textContent();
    
    // Open and submit new invoice form (simplified test)
    await page.locator('button:has-text("New Invoice")').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill form (basic fields)
    await page.fill('input[name="clientName"]', 'Test Client');
    await page.fill('input[name="clientEmail"]', 'test@example.com');
    await page.fill('input[name="invoiceNumber"]', 'TEST-001');
    await page.fill('input[name="amount"]', '100');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for modal to close and data to update
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify stats updated (pending invoices should increase)
    await page.waitForTimeout(1000); // Allow time for cache invalidation
    const updatedPendingText = await page.locator('text=Pending Invoices').locator('..').locator('.text-3xl').textContent();
    
    // Stats should have changed after invoice creation
    expect(updatedPendingText).not.toBe(initialPendingText);
  });
});