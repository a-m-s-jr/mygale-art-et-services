import { test, expect } from '@playwright/test'

test('Auth: visiting /admin without a session redirects to /login', async ({ page }) => {
  await page.goto('http://localhost:3000/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('Auth: visiting /admin/services without a session redirects to /login', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/services')
  await expect(page).toHaveURL(/\/login$/)
})
