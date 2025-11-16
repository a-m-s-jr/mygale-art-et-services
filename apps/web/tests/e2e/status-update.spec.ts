import { test, expect } from '@playwright/test'

test('Optimistic UI: admin changes status and UI updates instantly', async ({ page }) => {
  await page.goto('http://localhost:3000/login')

  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page.waitForURL('**/contact-submissions')

  // Assume one submission exists, click first row
  await page.click('table tbody tr:first-child')

  // Click status dropdown
  await page.click("button[data-testid='status-menu']")

  // Select new status
  await page.click("button[data-testid='status-in_review']")

  // IMPORTANT: optimistic update should reflect immediately
  const statusChip = page.locator("[data-testid='status-chip']")
  await expect(statusChip).toHaveText('in_review')

  // Wait for backend confirmation
  await page.waitForTimeout(1000)

  // Confirm again, final check
  await expect(statusChip).toHaveText('in_review')
})
