import { test, expect } from '@playwright/test'

test('Auth: visiting /contact-submissions redirects to /login', async ({ page }) => {
  await page.goto('http://localhost:3000/contact-submissions')
  await expect(page).toHaveURL('**/login')
})
