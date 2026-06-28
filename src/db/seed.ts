import { db } from './index'
import { links, tags, linksToTags } from './schema'

const TEST_USER_ID = 'seed_user_001'

async function seed() {
  const techTag = await db.insert(tags).values({ name: 'tech', userId: TEST_USER_ID }).returning()
  const designTag = await db.insert(tags).values({ name: 'design', userId: TEST_USER_ID }).returning()

  const link1 = await db.insert(links).values({
    slug: 'brave-river',
    originalUrl: 'https://nextjs.org',
    title: 'Next.js — The React Framework',
    userId: TEST_USER_ID,
  }).returning()

  const link2 = await db.insert(links).values({
    slug: 'calm-forest',
    originalUrl: 'https://tailwindcss.com',
    title: 'Tailwind CSS',
    userId: TEST_USER_ID,
  }).returning()

  await db.insert(linksToTags).values([
    { linkId: link1[0].id, tagId: techTag[0].id },
    { linkId: link2[0].id, tagId: techTag[0].id },
    { linkId: link2[0].id, tagId: designTag[0].id },
  ])

  console.log('Seeded successfully')
  process.exit(0)
}

seed().catch(console.error)
