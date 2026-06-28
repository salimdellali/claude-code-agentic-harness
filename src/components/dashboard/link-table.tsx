'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

type Tag = { id: string; name: string; userId: string }
type LinkRow = {
  id: string
  slug: string
  originalUrl: string
  title: string | null
  clickCount: number
  tags: Tag[]
  createdAt: Date
  expiresAt: Date | null
}

export function LinkTable({ links, tags, appUrl }: { links: LinkRow[]; tags: Tag[]; appUrl: string }) {
  const router = useRouter()
  const [filterTag, setFilterTag] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'clicks'>('date')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = links
    .filter(l => filterTag === 'all' || l.tags.some(t => t.id === filterTag))
    .sort((a, b) => sortBy === 'clicks'
      ? b.clickCount - a.clickCount
      : b.createdAt.getTime() - a.createdAt.getTime()
    )

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(`${appUrl}/${slug}`)
    toast.success('Copied to clipboard')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return
    setDeleting(id)
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Link deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete')
    }
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterTag === 'all' ? 'bg-[#202020] text-white border-[#202020]' : 'bg-white text-[#202020] border-[#202020] hover:bg-[#f5f5f5]'}`}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setFilterTag(tag.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterTag === tag.id ? 'bg-[#202020] text-white border-[#202020]' : 'bg-white text-[#202020] border-[#202020] hover:bg-[#f5f5f5]'}`}
          >
            {tag.name}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setSortBy('date')}
            className={`px-3 py-1 text-xs rounded-[8px] border ${sortBy === 'date' ? 'bg-[#202020] text-white border-[#202020]' : 'bg-white text-[#202020] border-[#202020]'}`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('clicks')}
            className={`px-3 py-1 text-xs rounded-[8px] border ${sortBy === 'clicks' ? 'bg-[#202020] text-white border-[#202020]' : 'bg-white text-[#202020] border-[#202020]'}`}
          >
            Most clicks
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#202020] rounded-[8px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f5f5f5] border-b border-[#202020]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#333333] uppercase tracking-wide">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#333333] uppercase tracking-wide">Destination</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#333333] uppercase tracking-wide">Clicks</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#333333] uppercase tracking-wide">Tags</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#333333] uppercase tracking-wide">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#333333]">No links yet. <Link href="/links/new" className="text-[#5757f8] hover:underline">Create one →</Link></td>
              </tr>
            )}
            {filtered.map(link => (
              <tr key={link.id} className="border-b border-[#f5f5f5] hover:bg-[#f5f5f5]/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/links/${link.id}`} className="text-[#5757f8] font-medium hover:underline font-mono text-xs">
                    {link.slug}
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-[#202020] truncate">{link.title ?? link.originalUrl}</p>
                  <p className="text-[#333333] text-xs truncate">{link.originalUrl}</p>
                </td>
                <td className="px-4 py-3 text-[#202020] font-semibold">{link.clickCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {link.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-0.5 text-xs bg-[#f5f5f5] border border-[#202020] rounded-full text-[#202020]">{tag.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#333333] text-xs whitespace-nowrap">
                  {new Date(link.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleCopy(link.slug)} className="text-xs text-[#333333] hover:text-[#202020] px-2 py-1 rounded-[8px] hover:bg-[#f5f5f5] border border-transparent hover:border-[#202020] transition-colors">Copy</button>
                    <Link href={`/links/${link.id}`} className="text-xs text-[#333333] hover:text-[#202020] px-2 py-1 rounded-[8px] hover:bg-[#f5f5f5] border border-transparent hover:border-[#202020] transition-colors">Analytics</Link>
                    <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-[8px] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
