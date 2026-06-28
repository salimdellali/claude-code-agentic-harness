import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { links, tags } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { LinkTable } from '@/components/dashboard/link-table'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, userId),
    with: {
      clicks: { columns: { id: true } },
      linksToTags: { with: { tag: true } },
    },
    orderBy: [desc(links.createdAt)],
  })

  const userTags = await db.select().from(tags).where(eq(tags.userId, userId))

  const tableData = userLinks.map(link => ({
    id: link.id,
    slug: link.slug,
    originalUrl: link.originalUrl,
    title: link.title,
    clickCount: link.clicks.length,
    tags: link.linksToTags.map(lt => lt.tag),
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
  }))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#202020] text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link
          href="/links/new"
          className="inline-flex items-center bg-[#5757f8] text-white text-sm font-medium px-4 py-2 rounded-[8px] hover:bg-[#4444e0] transition-colors"
        >
          New link →
        </Link>
      </div>
      <LinkTable links={tableData} tags={userTags} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'} />
    </div>
  )
}
