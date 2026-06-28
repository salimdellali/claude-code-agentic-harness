import { getCurrentUserId } from '@/lib/auth'
import { db } from '@/db'
import { links } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import QRCode from 'qrcode'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params

  const [link] = await db.select().from(links).where(
    and(eq(links.id, id), eq(links.userId, userId))
  )
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const shortUrl = `${appUrl}/${link.slug}`

  const buffer = await QRCode.toBuffer(shortUrl, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#202020', light: '#ffffff' },
  })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${link.slug}-qr.png"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
