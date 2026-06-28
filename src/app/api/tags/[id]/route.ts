import { getCurrentUserId } from '@/lib/auth'
import { db } from '@/db'
import { tags } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'name is required' }, { status: 400 })

  const [tag] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)))
  if (!tag) return Response.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await db.update(tags).set({ name: name.trim() }).where(eq(tags.id, id)).returning()
  return Response.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  const { id } = await params

  const [tag] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)))
  if (!tag) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.delete(tags).where(eq(tags.id, id))
  return Response.json({ data: { deleted: true } })
}
