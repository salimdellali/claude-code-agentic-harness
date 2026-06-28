import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const links = pgTable('links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  originalUrl: text('original_url').notNull(),
  title: text('title'),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
})

export const clicks = pgTable('clicks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
})

export const tags = pgTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
})

export const linksToTags = pgTable('links_to_tags', {
  linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(clicks),
  linksToTags: many(linksToTags),
}))

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  linksToTags: many(linksToTags),
}))

export const linksToTagsRelations = relations(linksToTags, ({ one }) => ({
  link: one(links, { fields: [linksToTags.linkId], references: [links.id] }),
  tag: one(tags, { fields: [linksToTags.tagId], references: [tags.id] }),
}))
