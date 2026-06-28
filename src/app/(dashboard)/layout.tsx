import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/links/new', label: 'New Link' },
  { href: '/tags', label: 'Tags' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <aside className="w-60 shrink-0 bg-white border-r border-[#202020] flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-[#202020]">
          <span className="text-[#202020] font-bold text-lg tracking-tight">LinkTo</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm text-[#202020] rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#202020]">
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
