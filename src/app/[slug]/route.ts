import { NextRequest } from 'next/server'
import { db } from '@/db'
import { links, clicks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PostHog } from 'posthog-node'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [link] = await db.select().from(links).where(eq(links.slug, slug))

  if (!link) return Response.redirect(new URL('/not-found', request.url), 302)

  if (link.expiresAt && link.expiresAt < new Date()) {
    return Response.redirect(new URL('/not-found', request.url), 302)
  }

  const referrer = request.headers.get('referer') ?? undefined
  const country = request.headers.get('x-vercel-ip-country') ?? undefined
  const city = request.headers.get('x-vercel-ip-city') ?? undefined
  const ua = request.headers.get('user-agent') ?? ''
  const device = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop'

  await db.insert(clicks).values({ linkId: link.id, referrer, country, city, device })

  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (phKey) {
    const ph = new PostHog(phKey, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' })
    ph.capture({ distinctId: link.userId, event: 'link_clicked', properties: { slug, country: country ?? 'unknown' } })
    await ph.shutdown()
  }

  const statusCode = link.expiresAt ? 302 : 301
  return Response.redirect(link.originalUrl, statusCode)
}
