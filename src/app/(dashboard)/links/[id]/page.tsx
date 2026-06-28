import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { links, clicks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'

type AnalyticsData = {
  total: number
  last7d: number
  last30d: number
  clicksByDay: { date: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  countryBreakdown: { country: string; count: number }[]
}

export default async function LinkAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const [link] = await db.select().from(links).where(and(eq(links.id, id), eq(links.userId, userId)))
  if (!link) notFound()

  const allClicks = await db.select().from(clicks).where(eq(clicks.linkId, id))

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

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

  const analytics: AnalyticsData = {
    total,
    last7d,
    last30d,
    clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
    topReferrers,
    countryBreakdown,
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const shortUrl = `${appUrl}/${link.slug}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-[#333333] hover:text-[#202020] mb-1 inline-block">← Dashboard</Link>
          <h1 className="text-[#202020] text-2xl font-bold tracking-tight font-mono">{link.slug}</h1>
          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5757f8] hover:underline truncate max-w-lg inline-block">{link.originalUrl}</a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TOTAL CLICKS', value: analytics.total },
          { label: 'LAST 7 DAYS', value: analytics.last7d },
          { label: 'LAST 30 DAYS', value: analytics.last30d },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-[#202020] rounded-[8px] p-6">
            <p className="text-xs font-semibold text-[#333333] uppercase tracking-wide mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-[#202020] tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts analytics={analytics} shortUrl={shortUrl} slug={link.slug} linkId={link.id} />
    </div>
  )
}
