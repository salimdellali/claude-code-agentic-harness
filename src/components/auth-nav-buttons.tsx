'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AuthNavButtons() {
  const pathname = usePathname()

  if (pathname === '/sign-up') {
    return (
      <Link
        href="/sign-in"
        className="px-4 py-2 text-sm font-medium text-[#202020] border border-[#202020] rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
      >
        Sign in
      </Link>
    )
  }

  return (
    <Link
      href="/sign-up"
      className="px-4 py-2 text-sm font-medium text-white bg-[#5757f8] rounded-[8px] hover:opacity-90 transition-opacity"
    >
      Sign up
    </Link>
  )
}
