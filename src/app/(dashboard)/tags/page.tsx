'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

type Tag = { id: string; name: string; userId: string }

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function load() {
    const res = await fetch('/api/tags')
    const d = await res.json()
    setTags(d.data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setCreating(false)
    if (res.ok) { setNewName(''); load(); toast.success('Tag created') }
    else toast.error('Failed to create tag')
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) { setEditingId(null); load(); toast.success('Tag renamed') }
    else toast.error('Failed to rename tag')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tag? Links will not be deleted.')) return
    const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    if (res.ok) { load(); toast.success('Tag deleted') }
    else toast.error('Failed to delete tag')
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-[#202020] text-2xl font-bold tracking-tight mb-6">Tags</h1>

      <div className="bg-white border border-[#202020] rounded-[8px] p-6 mb-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 px-3 py-2 text-sm text-[#202020] bg-white border border-[#202020] rounded-[8px] focus:outline-none focus:border-[#5757f8] placeholder:text-[#333333]"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="bg-[#5757f8] text-white text-sm font-medium px-4 py-2 rounded-[8px] hover:bg-[#4444e0] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? 'Creating…' : 'Create tag'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#202020] rounded-[8px] overflow-hidden">
        {tags.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#333333]">No tags yet. Create one above.</p>
        )}
        {tags.map((tag, i) => (
          <div key={tag.id} className={`flex items-center gap-3 px-4 py-3 ${i < tags.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}>
            {editingId === tag.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(tag.id); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm text-[#202020] bg-white border border-[#5757f8] rounded-[8px] focus:outline-none"
                />
                <button onClick={() => handleRename(tag.id)} className="text-xs text-[#5757f8] font-medium px-2 py-1 hover:underline">Save</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-[#333333] px-2 py-1 hover:underline">Cancel</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-[#202020] font-medium">{tag.name}</span>
                <button
                  onClick={() => { setEditingId(tag.id); setEditName(tag.name) }}
                  className="text-xs text-[#333333] hover:text-[#202020] px-2 py-1 rounded-[8px] hover:bg-[#f5f5f5] border border-transparent hover:border-[#202020] transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-[8px] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
