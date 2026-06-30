'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Tag = { id: string; name: string }

export default function NewLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(d => setTags(d.data ?? []))
  }, [])

  function validateUrl(value: string) {
    try {
      new URL(value)
      setUrlError('')
      return true
    } catch {
      setUrlError('Enter a valid URL including https://')
      return false
    }
  }

  function toggleTag(id: string) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateUrl(url)) return

    setLoading(true)
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        customSlug: customSlug || undefined,
        expiresAt: expiresAt || undefined,
        tagIds: selectedTagIds,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error ?? 'Failed to create link')
      return
    }

    toast.success('Link created!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-[#202020] text-2xl font-bold tracking-tight mb-6">New link</h1>

      <div className="bg-white border border-[#202020] rounded-[8px] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#202020] mb-1.5">
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); if (urlError) validateUrl(e.target.value) }}
              onBlur={e => validateUrl(e.target.value)}
              placeholder="https://example.com/long-url"
              className="w-full px-3 py-2 text-sm text-[#202020] bg-white border border-[#202020] rounded-[8px] focus:outline-none focus:border-[#5757f8] placeholder:text-[#333333]"
              required
            />
            {urlError && <p className="mt-1 text-xs text-red-500">{urlError}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#202020] mb-1.5">
              Custom slug <span className="text-[#333333] font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2 text-sm text-[#333333] bg-[#f5f5f5] border border-r-0 border-[#202020] rounded-l-[8px] whitespace-nowrap">linkgoes.vercel.app/</span>
              <input
                type="text"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-link"
                className="flex-1 px-3 py-2 text-sm text-[#202020] bg-white border border-[#202020] rounded-r-[8px] focus:outline-none focus:border-[#5757f8] placeholder:text-[#333333]"
              />
            </div>
            <p className="mt-1 text-xs text-[#333333]">Leave blank to auto-generate (e.g. fast-cloud)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#202020] mb-1.5">
              Expiry date <span className="text-[#333333] font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2 text-sm text-[#202020] bg-white border border-[#202020] rounded-[8px] focus:outline-none focus:border-[#5757f8]"
            />
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-[#202020] mb-2">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-[#202020] text-white border-[#202020]'
                        : 'bg-white text-[#202020] border-[#202020] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#5757f8] text-white text-sm font-medium px-5 py-2 rounded-[8px] hover:bg-[#4444e0] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create link →'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white text-[#202020] text-sm font-medium px-5 py-2 rounded-[8px] border border-[#202020] hover:bg-[#f5f5f5] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
