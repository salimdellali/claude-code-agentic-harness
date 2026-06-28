import { getCurrentUserId } from '@/lib/auth'
import { db } from '@/db'
import { links, linksToTags } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params

  const [link] = await db.select().from(links).where(
    and(eq(links.id, id), eq(links.userId, userId))
  )
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.delete(links).where(eq(links.id, id))
  return Response.json({ data: { deleted: true } })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params
  const { title, expiresAt, tagIds } = await req.json()

  const [link] = await db.select().from(links).where(
    and(eq(links.id, id), eq(links.userId, userId))
  )
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await db.update(links)
    .set({
      ...(title !== undefined && { title }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    })
    .where(eq(links.id, id))
    .returning()

  if (tagIds !== undefined) {
    await db.delete(linksToTags).where(eq(linksToTags.linkId, id))
    if (tagIds.length) {
      await db.insert(linksToTags).values(
        tagIds.map((tagId: string) => ({ linkId: id, tagId }))
      )
    }
  }

  return Response.json({ data: updated })
}
