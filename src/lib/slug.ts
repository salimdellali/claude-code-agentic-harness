import { db } from '@/db'
import { links } from '@/db/schema'
import { eq } from 'drizzle-orm'

const adjectives = [
  'brave', 'calm', 'fast', 'bold', 'bright', 'clean', 'cool', 'dark',
  'deep', 'dry', 'fair', 'fine', 'firm', 'flat', 'free', 'full', 'glad',
  'good', 'grand', 'gray', 'great', 'green', 'hard', 'high', 'huge',
  'keen', 'kind', 'late', 'lean', 'light', 'long', 'loud', 'low', 'mild',
  'neat', 'new', 'nice', 'odd', 'old', 'open', 'pale', 'plain', 'prime',
  'pure', 'quick', 'rare', 'raw', 'real', 'rich', 'safe', 'sharp', 'short',
  'slim', 'slow', 'small', 'smart', 'soft', 'still', 'strong', 'sure',
  'tall', 'thick', 'thin', 'tight', 'tiny', 'true', 'vast', 'warm', 'wide',
  'wild', 'wise', 'young',
]

const nouns = [
  'bird', 'blade', 'bloom', 'boat', 'bolt', 'bone', 'book', 'brook',
  'cave', 'cliff', 'cloud', 'coast', 'comet', 'coral', 'creek', 'crown',
  'dawn', 'deer', 'delta', 'dune', 'dust', 'eagle', 'earth', 'field',
  'flame', 'flash', 'fleet', 'flood', 'flora', 'flux', 'fog', 'force',
  'forge', 'form', 'frost', 'gale', 'gate', 'gem', 'glade', 'glow',
  'grove', 'gulf', 'hail', 'hawk', 'hill', 'horizon', 'hue', 'jade',
  'jet', 'lake', 'lark', 'leaf', 'ledge', 'light', 'luna', 'marsh',
  'mist', 'moon', 'moss', 'moth', 'mount', 'oak', 'ocean', 'path',
  'peak', 'pine', 'pond', 'pool', 'prism', 'rain', 'reef', 'ridge',
  'rift', 'rise', 'river', 'rock', 'root', 'rose', 'rune', 'rush',
  'sand', 'sea', 'seed', 'shade', 'shore', 'sky', 'slate', 'snow',
  'soil', 'spark', 'spire', 'spring', 'star', 'stem', 'stone', 'storm',
  'stream', 'sun', 'surf', 'tide', 'trail', 'tree', 'vale', 'vine',
  'void', 'wave', 'wind', 'wolf', 'wood',
]

function randomSlug(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}-${noun}`
}

export async function generateSlug(customSlug?: string): Promise<string> {
  if (customSlug) {
    const [existing] = await db.select().from(links).where(eq(links.slug, customSlug))
    if (existing) throw new Error('Slug already taken')
    return customSlug
  }

  for (let i = 0; i < 10; i++) {
    const slug = randomSlug()
    const [existing] = await db.select().from(links).where(eq(links.slug, slug))
    if (!existing) return slug
  }

  throw new Error('Could not generate unique slug after 10 attempts')
}
