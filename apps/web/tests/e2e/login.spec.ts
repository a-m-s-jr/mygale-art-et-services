import { test, expect } from '@playwright/test'

test('Login: valid email logs in', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/contact-submissions')

  await expect(page.locator('h1')).toHaveText(/Contact Submissions/i)
})
