import { expect, test, type Page } from '@playwright/test';

async function expectDashboardLoaded(page: Page) {
  await expect(page.getByRole('heading', { name: 'Vehicle Telemetry Dashboard' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Fleet metrics' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Filter vehicles' })).toBeVisible();
  await expect(page.getByRole('tablist', { name: 'Dashboard views' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Alert panel' })).toBeVisible();
}

async function goToDashboard(page: Page) {
  await page.goto('/dashboard');
  await expectDashboardLoaded(page);
}

test.describe('Vehicle telemetry dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test('loads the dashboard and shows the default map view', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Map/i })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Vehicle map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('filters the vehicle list by search text and updates the visible count', async ({ page }) => {
    await page.getByRole('tab', { name: /Vehicles/i }).click();
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();

    await page.getByLabel('Search').fill('Tesla');

    await expect(page.getByText('1 visible')).toBeVisible();
    await expect(page.getByText('Tesla Model 3 - Alpha')).toBeVisible();
    await expect(page.getByText('No vehicles match the current filters')).toHaveCount(0);
  });

  test('opens a vehicle detail page from the list view', async ({ page }) => {
    await page.getByRole('tab', { name: /Vehicles/i }).click();
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible();

    await page.getByRole('link', { name: 'View details' }).first().click();

    await expect(page).toHaveURL(/\/vehicle\/vehicle-001$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Tesla Model 3 - Alpha' })).toBeVisible();
  });

  test('selects a vehicle from the map and opens the detail page', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Tesla Model 3 - Alpha' }).click();

    await expect(page.getByRole('heading', { name: 'Tesla Model 3 - Alpha' })).toBeVisible();
    await page.getByRole('button', { name: 'Open vehicle details' }).click();

    await expect(page).toHaveURL(/\/vehicle\/vehicle-001$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Tesla Model 3 - Alpha' })).toBeVisible();
  });
});
