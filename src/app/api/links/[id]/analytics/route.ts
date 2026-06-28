import { getCurrentUserId } from '@/lib/auth'
import { db } from '@/db'
import { links, clicks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params

  const [link] = await db.select().from(links).where(
    and(eq(links.id, id), eq(links.userId, userId))
  )
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const allClicks = await db.select().from(clicks).where(eq(clicks.linkId, id))

  const total = allClicks.length
  const last7d = allClicks.filter(c => c.timestamp >= sevenDaysAgo).length
  const last30d = allClicks.filter(c => c.timestamp >= thirtyDaysAgo).length

  const clicksByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    clicksByDay[d.toISOString().slice(0, 10)] = 0
  }
  for (const click of allClicks) {
    if (click.timestamp >= thirtyDaysAgo) {
      const day = click.timestamp.toISOString().slice(0, 10)
      if (day in clicksByDay) clicksByDay[day]++
    }
  }

  const referrerMap: Record<string, number> = {}
  for (const click of allClicks) {
    const ref = click.referrer ?? 'Direct'
    referrerMap[ref] = (referrerMap[ref] ?? 0) + 1
  }
  const topReferrers = Object.entries(referrerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, count]) => ({ referrer, count }))

  const countryMap: Record<string, number> = {}
  for (const click of allClicks) {
    const country = click.country ?? 'Unknown'
    countryMap[country] = (countryMap[country] ?? 0) + 1
  }
  const countryBreakdown = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }))

  return Response.json({
    data: {
      total,
      last7d,
      last30d,
      clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
      topReferrers,
      countryBreakdown,
    },
  })
}
