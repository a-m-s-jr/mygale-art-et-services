import { test, expect } from '@playwright/test'

test('realtime new submission shows in inbox and optimistic status update', async ({
  page,
  request,
}) => {
  // 1) go to login
  await page.goto('http://localhost:3000/login')
  // NOTE: in CI you can mock login; here we assume a test user exists and we can programmatically create/get a session cookie.
  // For local dev, you may have a test flow or bypass; this test will check UI behavior once logged in.

  // For demonstration: visit the inbox (if unauthenticated you'll see login)
  await page.goto('http://localhost:3000/contact-submissions')
  await expect(page.locator('text=Contact Submissions')).toBeVisible()

  // 2) Create a submission using backend API directly
  const apiBase = process.env.TEST_API_BASE ?? 'http://localhost:4000'
  const createResp = await request.post(`${apiBase}/contact-submissions`, {
    data: { name: 'E2E Tester', email: 'e2e@test.local', message: 'hello realtime' },
  })
  expect(createResp.ok()).toBeTruthy()
  const created = await createResp.json()

  // Wait briefly and assert inbox shows new item
  await page.waitForTimeout(400) // socket propagation
  await expect(page.locator(`text=${created.email}`)).toBeVisible()

  // 3) Click into it and hit status change
  await page.click(`a[href="/contact-submissions/${created.id}"]`)
  await expect(page.locator('text=Message')).toBeVisible()

  // Click "Mark In Review" (optimistic)
  await page.click('text=Mark In Review')
  // optimistic UI: status should update immediately
  await expect(page.locator('text=Status:')).toContainText('in_review')

  // Clean up if needed
  // await request.delete(`${apiBase}/contact-submissions/${created.id}`)
})
