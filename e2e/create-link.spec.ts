import { test, expect } from '@playwright/test'

test.describe('redirect handler', () => {
  test('unknown slug returns 404 page', async ({ page }) => {
    await page.goto('/definitely-not-a-real-slug-xyzabc')
    await expect(page.locator('body')).toContainText('404')
  })

  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('dashboard redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/sign-in|sign-up/)
  })
})
