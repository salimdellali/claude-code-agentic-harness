import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/links/new', label: 'New Link' },
  { href: '/tags', label: 'Tags' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 bg-[#f5f5f5]">
      <aside className="w-60 shrink-0 bg-white border-r border-[#202020]">
        <nav className="p-3 space-y-0.5">
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
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
