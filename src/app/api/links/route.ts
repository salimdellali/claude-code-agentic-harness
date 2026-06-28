import { getCurrentUserId } from '@/lib/auth'
import { generateSlug } from '@/lib/slug'
import { db } from '@/db'
import { links, linksToTags } from '@/db/schema'
import { PostHog } from 'posthog-node'

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  const { url, customSlug, expiresAt, tagIds } = await req.json()

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  let title: string | undefined
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    const html = await res.text()
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    title = match?.[1]?.trim()
  } catch {}

  let slug: string
  try {
    slug = await generateSlug(customSlug)
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 409 })
  }

  const [link] = await db.insert(links).values({
    slug,
    originalUrl: url,
    title,
    userId,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  }).returning()

  if (tagIds?.length) {
    await db.insert(linksToTags).values(
      tagIds.map((tagId: string) => ({ linkId: link.id, tagId }))
    )
  }

  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (phKey) {
    const ph = new PostHog(phKey, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' })
    ph.capture({ distinctId: userId, event: 'link_created', properties: { slug: link.slug, hasCustomSlug: !!customSlug } })
    await ph.shutdown()
  }

  return Response.json({ data: link })
}
