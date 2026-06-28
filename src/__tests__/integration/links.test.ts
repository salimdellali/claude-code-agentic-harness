import { describe, it, expect, afterEach } from 'vitest'
import { db } from '@/db'
import { links } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const TEST_USER = 'test_user_vitest'
const createdIds: string[] = []

afterEach(async () => {
  if (createdIds.length > 0) {
    for (const id of createdIds) {
      await db.delete(links).where(eq(links.id, id))
    }
    createdIds.length = 0
  }
})

describe('links DB layer', () => {
  it('inserts a link', async () => {
    const [link] = await db.insert(links).values({
      userId: TEST_USER,
      originalUrl: 'https://example.com',
      slug: `test-slug-${Date.now()}`,
    }).returning()
    createdIds.push(link.id)
    expect(link.id).toBeTruthy()
    expect(link.userId).toBe(TEST_USER)
    expect(link.originalUrl).toBe('https://example.com')
  })

  it('enforces slug uniqueness', async () => {
    const slug = `dup-slug-${Date.now()}`
    const [link] = await db.insert(links).values({ userId: TEST_USER, originalUrl: 'https://a.com', slug }).returning()
    createdIds.push(link.id)
    await expect(
      db.insert(links).values({ userId: TEST_USER, originalUrl: 'https://b.com', slug }).returning()
    ).rejects.toThrow()
  })

  it('deletes a link with ownership check', async () => {
    const [link] = await db.insert(links).values({ userId: TEST_USER, originalUrl: 'https://example.com', slug: `del-${Date.now()}` }).returning()
    await db.delete(links).where(and(eq(links.id, link.id), eq(links.userId, TEST_USER)))
    const [found] = await db.select().from(links).where(eq(links.id, link.id))
    expect(found).toBeUndefined()
  })

  it('updates link title', async () => {
    const [link] = await db.insert(links).values({ userId: TEST_USER, originalUrl: 'https://example.com', slug: `upd-${Date.now()}` }).returning()
    createdIds.push(link.id)
    const [updated] = await db.update(links).set({ title: 'Updated Title' }).where(eq(links.id, link.id)).returning()
    expect(updated.title).toBe('Updated Title')
  })
})
