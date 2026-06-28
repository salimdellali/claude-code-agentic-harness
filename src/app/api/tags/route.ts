import { getCurrentUserId } from '@/lib/auth'
import { db } from '@/db'
import { tags } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const userId = await getCurrentUserId()
  const userTags = await db.select().from(tags).where(eq(tags.userId, userId))
  return Response.json({ data: userTags })
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'name is required' }, { status: 400 })
  const [tag] = await db.insert(tags).values({ name: name.trim(), userId }).returning()
  return Response.json({ data: tag })
}
