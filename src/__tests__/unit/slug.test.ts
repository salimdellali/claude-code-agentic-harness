import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockWhere = vi.fn().mockResolvedValue([])
const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

vi.mock('@/db', () => ({
  db: {
    select: mockSelect,
  },
}))

vi.mock('@/db/schema', () => ({
  links: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => val),
  and: vi.fn((...args) => args),
}))

const { generateSlug } = await import('@/lib/slug')

describe('generateSlug', () => {
  beforeEach(() => {
    mockWhere.mockResolvedValue([])
  })

  it('returns a string', async () => {
    const slug = await generateSlug()
    expect(typeof slug).toBe('string')
  })

  it('generated slug matches adjective-noun pattern', async () => {
    const slug = await generateSlug()
    expect(slug).toMatch(/^[a-z]+-[a-z]+$/)
  })

  it('generated slug contains exactly one hyphen', async () => {
    const slug = await generateSlug()
    const parts = slug.split('-')
    expect(parts).toHaveLength(2)
  })

  it('both parts of the slug are non-empty', async () => {
    const slug = await generateSlug()
    const [adj, noun] = slug.split('-')
    expect(adj.length).toBeGreaterThan(0)
    expect(noun.length).toBeGreaterThan(0)
  })

  it('returns custom slug as-is when no collision', async () => {
    const slug = await generateSlug('my-custom-link')
    expect(slug).toBe('my-custom-link')
  })

  it('throws when custom slug is already taken', async () => {
    mockWhere.mockResolvedValueOnce([{ id: 'existing' }])
    await expect(generateSlug('taken-slug')).rejects.toThrow('Slug already taken')
  })

  it('throws after 10 failed attempts to find unique slug', async () => {
    mockWhere.mockResolvedValue([{ id: 'existing' }])
    await expect(generateSlug()).rejects.toThrow('Could not generate unique slug after 10 attempts')
  })

  it('multiple calls produce different slugs (probabilistic)', async () => {
    const slugs = await Promise.all(Array.from({ length: 10 }, () => generateSlug()))
    const unique = new Set(slugs)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('generated slug only contains lowercase letters and one hyphen', async () => {
    for (let i = 0; i < 5; i++) {
      const slug = await generateSlug()
      expect(slug).toMatch(/^[a-z]+-[a-z]+$/)
    }
  })
})
