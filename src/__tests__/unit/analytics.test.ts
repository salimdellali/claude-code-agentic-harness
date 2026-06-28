import { describe, it, expect } from 'vitest'

type ClickRecord = { timestamp: Date; referrer?: string | null; country?: string | null }

function groupByDay(clicks: ClickRecord[], days: number): Record<string, number> {
  const result: Record<string, number> = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result[d.toISOString().slice(0, 10)] = 0
  }
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  for (const click of clicks) {
    if (click.timestamp >= cutoff) {
      const day = click.timestamp.toISOString().slice(0, 10)
      if (day in result) result[day]++
    }
  }
  return result
}

function topReferrers(clicks: ClickRecord[], limit: number): { referrer: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const click of clicks) {
    const ref = click.referrer ?? 'Direct'
    map[ref] = (map[ref] ?? 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([referrer, count]) => ({ referrer, count }))
}

function countryBreakdown(clicks: ClickRecord[]): { country: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const click of clicks) {
    const country = click.country ?? 'Unknown'
    map[country] = (map[country] ?? 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }))
}

describe('groupByDay', () => {
  it('returns 30 day keys for 30 days', () => {
    const result = groupByDay([], 30)
    expect(Object.keys(result)).toHaveLength(30)
  })

  it('returns 7 day keys for 7 days', () => {
    const result = groupByDay([], 7)
    expect(Object.keys(result)).toHaveLength(7)
  })

  it('all values are zero when no clicks', () => {
    const result = groupByDay([], 30)
    const total = Object.values(result).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })

  it('counts a click on today', () => {
    const today = new Date()
    const result = groupByDay([{ timestamp: today }], 30)
    const todayKey = today.toISOString().slice(0, 10)
    expect(result[todayKey]).toBe(1)
  })

  it('counts multiple clicks on the same day', () => {
    const today = new Date()
    const clicks = [{ timestamp: today }, { timestamp: today }, { timestamp: today }]
    const result = groupByDay(clicks, 30)
    const todayKey = today.toISOString().slice(0, 10)
    expect(result[todayKey]).toBe(3)
  })

  it('ignores clicks older than the window', () => {
    const oldClick = { timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) }
    const result = groupByDay([oldClick], 30)
    const total = Object.values(result).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })

  it('keys are in ISO date format YYYY-MM-DD', () => {
    const result = groupByDay([], 7)
    for (const key of Object.keys(result)) {
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('keys are in ascending chronological order', () => {
    const result = groupByDay([], 7)
    const keys = Object.keys(result)
    const sorted = [...keys].sort()
    expect(keys).toEqual(sorted)
  })

  it('counts clicks spread across multiple days', () => {
    const now = Date.now()
    const clicks = [
      { timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000) },
      { timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000) },
      { timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000) },
    ]
    const result = groupByDay(clicks, 30)
    const total = Object.values(result).reduce((a, b) => a + b, 0)
    expect(total).toBe(3)
  })
})

describe('topReferrers', () => {
  it('returns empty array when no clicks', () => {
    expect(topReferrers([], 5)).toEqual([])
  })

  it('null referrer is counted as Direct', () => {
    const result = topReferrers([{ timestamp: new Date(), referrer: null }], 5)
    expect(result[0].referrer).toBe('Direct')
    expect(result[0].count).toBe(1)
  })

  it('counts referrers correctly', () => {
    const clicks = [
      { timestamp: new Date(), referrer: 'google.com' },
      { timestamp: new Date(), referrer: 'google.com' },
      { timestamp: new Date(), referrer: 'twitter.com' },
    ]
    const result = topReferrers(clicks, 5)
    expect(result[0]).toEqual({ referrer: 'google.com', count: 2 })
    expect(result[1]).toEqual({ referrer: 'twitter.com', count: 1 })
  })

  it('respects limit — returns at most 5 referrers', () => {
    const clicks = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(),
      referrer: `ref${i}.com`,
    }))
    const result = topReferrers(clicks, 5)
    expect(result).toHaveLength(5)
  })

  it('results are sorted descending by count', () => {
    const clicks = [
      { timestamp: new Date(), referrer: 'a.com' },
      { timestamp: new Date(), referrer: 'b.com' },
      { timestamp: new Date(), referrer: 'b.com' },
      { timestamp: new Date(), referrer: 'b.com' },
    ]
    const result = topReferrers(clicks, 5)
    expect(result[0].referrer).toBe('b.com')
    expect(result[0].count).toBe(3)
  })
})

describe('countryBreakdown', () => {
  it('returns empty array when no clicks', () => {
    expect(countryBreakdown([])).toEqual([])
  })

  it('null country is counted as Unknown', () => {
    const result = countryBreakdown([{ timestamp: new Date(), country: null }])
    expect(result[0].country).toBe('Unknown')
    expect(result[0].count).toBe(1)
  })

  it('counts countries correctly', () => {
    const clicks = [
      { timestamp: new Date(), country: 'US' },
      { timestamp: new Date(), country: 'US' },
      { timestamp: new Date(), country: 'FR' },
    ]
    const result = countryBreakdown(clicks)
    expect(result[0]).toEqual({ country: 'US', count: 2 })
    expect(result[1]).toEqual({ country: 'FR', count: 1 })
  })

  it('results are sorted descending by count', () => {
    const clicks = [
      { timestamp: new Date(), country: 'DE' },
      { timestamp: new Date(), country: 'US' },
      { timestamp: new Date(), country: 'US' },
    ]
    const result = countryBreakdown(clicks)
    expect(result[0].country).toBe('US')
  })

  it('returns all countries without limit', () => {
    const countries = ['US', 'FR', 'DE', 'JP', 'BR', 'CA', 'AU']
    const clicks = countries.map(country => ({ timestamp: new Date(), country }))
    const result = countryBreakdown(clicks)
    expect(result).toHaveLength(countries.length)
  })
})
