import { describe, it, expect, afterEach } from 'vitest'
import { db } from '@/db'
import { links, clicks } from '@/db/schema'
import { eq } from 'drizzle-orm'

const TEST_USER = 'test_user_vitest_analytics'
const createdLinkIds: string[] = []

afterEach(async () => {
  for (const id of createdLinkIds) {
    await db.delete(links).where(eq(links.id, id))
  }
  createdLinkIds.length = 0
})

describe('analytics DB queries', () => {
  it('counts clicks for a link', async () => {
    const [link] = await db.insert(links).values({
      userId: TEST_USER,
      originalUrl: 'https://example.com',
      slug: `analytics-test-${Date.now()}`,
    }).returning()
    createdLinkIds.push(link.id)

    await db.insert(clicks).values([
      { linkId: link.id, country: 'US', device: 'desktop', referrer: 'google.com' },
      { linkId: link.id, country: 'FR', device: 'mobile', referrer: null },
      { linkId: link.id, country: 'US', device: 'tablet', referrer: 'twitter.com' },
    ])

    const allClicks = await db.select().from(clicks).where(eq(clicks.linkId, link.id))
    expect(allClicks).toHaveLength(3)

    const usCounts = allClicks.filter(c => c.country === 'US').length
    expect(usCounts).toBe(2)
  })
})
