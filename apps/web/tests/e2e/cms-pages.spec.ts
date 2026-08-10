import { test, expect } from '@playwright/test'

test.describe('CMS-driven public pages', () => {
  test('Homepage renders hero, services grid, and map sections from the database', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#services')).toBeVisible()
    await expect(page.locator('#location')).toBeVisible()
  })

  test('Services index lists published services', async ({ page }) => {
    await page.goto('http://localhost:3000/services')
    // Scoped to <main> — the Navbar also renders a (hover-only, hidden by
    // default) services dropdown with matching hrefs earlier in the DOM.
    const cards = page.locator('main a[href^="/services/"]')
    await expect(cards.first()).toBeVisible()
  })

  test('Service detail page renders structured sections', async ({ page }) => {
    await page.goto('http://localhost:3000/services/architecture')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('main ul li').first()).toBeVisible()
  })

  test('About page renders CMS content', async ({ page }) => {
    await page.goto('http://localhost:3000/about')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Contact form submits successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')
    // Fields are placeholder-labeled (no <label>), so match by input order/type.
    await page.locator('form input[type="text"]').first().fill('Playwright Test')
    await page.locator('form input[type="email"]').fill(`playwright-${Date.now()}@example.com`)
    await page
      .locator('form textarea')
      .fill('This is an automated end-to-end test submission.')
    await page.locator('form button[type="submit"]').click()
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 10_000 })
  })

  test('sitemap.xml and robots.txt are served', async ({ request }) => {
    const sitemap = await request.get('http://localhost:3000/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')

    const robots = await request.get('http://localhost:3000/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Disallow: /admin/')
  })
})
