import { auth } from '@clerk/nextjs/server'

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return userId
}
