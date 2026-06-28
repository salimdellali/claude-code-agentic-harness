import { test, expect } from '@playwright/test'

test.describe('public pages', () => {
  test('home page loads without 500 error', async ({ page }) => {
    const response = await page.goto('/')
    expect(response!.status()).toBeLessThan(500)
  })

  test('sign-in page loads', async ({ page }) => {
    const response = await page.goto('/sign-in')
    expect(response!.status()).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('unknown slug shows 404 content', async ({ page }) => {
    await page.goto('/xyz-slug-that-never-exists-abc')
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/404|not found/i)
  })
})
