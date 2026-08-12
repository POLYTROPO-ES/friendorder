import { test, expect } from '@playwright/test';

const DEFAULT_SUMMARY_ES = 'Normal · 1 carne · Al punto';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the default burger state', async ({ page }) => {
  await expect(page.locator('#summary')).toHaveText(DEFAULT_SUMMARY_ES);
  await expect(page.locator('#burger-canvas')).toBeVisible();
});

test('selecting toppings updates the summary', async ({ page }) => {
  await page.locator('button[data-topping="lechuga"]').click();
  await page.locator('button[data-topping="bacon"]').click();
  await expect(page.locator('#summary')).toHaveText('Normal · 1 carne · Al punto · Lechuga, Bacon');
});

test('language toggle switches to English', async ({ page }) => {
  await page.evaluate(() => document.getElementById('lang-toggle').click());
  await expect(page.locator('#summary')).toHaveText('Normal · 1 patty · Medium');
  await expect(page.locator('button[data-topping="lechuga"]')).toContainText('Lettuce');
});

test('fresh start resets the order through the confirm dialog', async ({ page }) => {
  await page.locator('button[data-topping="lechuga"]').click();
  await page.locator('#btn-fresh-start').click();
  await expect(page.locator('#confirm-reset')).toBeVisible();
  await page.locator('#confirm-reset-yes').click();
  await expect(page.locator('#summary')).toHaveText(DEFAULT_SUMMARY_ES);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('friendorder:burger:v1')));
  expect(stored.toppings).toEqual([]);
  expect(stored.updatedAt).toBeTruthy();
});

test('a share link restores the full configuration', async ({ page }) => {
  const config = { bread: 'none', patties: 2, meatPoint: 'hecho', toppings: ['bacon', 'queson'] };
  const token = Buffer.from(JSON.stringify(config), 'utf8').toString('base64url');
  await page.goto(`/?c=${token}`);
  await expect(page.locator('#summary')).toHaveText('Ninguno · 2 carnes · Hecho · Bacon, Queso');
});

test('conflict dialog appears when moving a category inside with toppings aparte', async ({ page }) => {
  await page.evaluate(() => {
    document.getElementById('toppings-aside-toggle').click();
  });
  await page.locator('select[data-serve-cat="veggie"]').selectOption('inside');
  await expect(page.locator('#serve-conflict')).toBeVisible();
  await page.locator('#conflict-inside').click();
  await expect(page.locator('select[data-serve-cat="veggie"]')).toHaveValue('inside');
});

test('help dialog shows the generated app version', async ({ page }) => {
  await page.evaluate(() => document.getElementById('btn-help').click());
  await expect(page.locator('#help-dialog')).toBeVisible();
  await expect(page.locator('#app-version')).toHaveText(/v\d+\.\d+\.\d+/);
});
