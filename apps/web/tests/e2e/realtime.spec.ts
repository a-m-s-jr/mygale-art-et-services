/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test'
import { connectSocket } from './utils/ws'

test('Realtime: admin receives live contact submission', async ({ page }) => {
  // Make browser accessible setter
  await page.exposeFunction('setReceivedPayload', (p: any) => {
    ;(global as any).__receivedPayload = p
  })

  // Step 1 — login
  await page.goto('http://localhost:3000/login')
  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // dashboard loaded
  await page.waitForURL('**/contact-submissions')

  const session = await page.evaluate(() => {
    return window.__NEXT_AUTH_SESSION
  })

  expect(session?.apiToken).toBeTruthy()

  const socket = connectSocket(session.apiToken)

  // Wait for websocket ready
  await new Promise<void>((resolve) => {
    socket.on('connect', () => resolve())
  })

  // Listen for event
  socket.on('contact:created', async (payload) => {
    await page.evaluate((p) => {
      window.__receivedPayload = p
    }, payload)
  })

  // Trigger a new submission
  const res = await fetch('http://localhost:4000/contact-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'WS Test',
      email: 'ws@example.com',
      message: 'Hello from test',
    }),
  })
  expect(res.status).toBe(201)

  // Wait up to 5s for websocket event
  const result = await page.waitForFunction(() => window.__receivedPayload !== undefined, null, {
    timeout: 5000,
  })

  const received = await page.evaluate(() => window.__receivedPayload)
  expect(received.email).toBe('ws@example.com')
})
