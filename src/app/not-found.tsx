import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white border border-[#202020] rounded-[8px] p-12 text-center max-w-md w-full mx-4">
        <p className="text-[#5757f8] text-sm font-medium mb-2">404</p>
        <h1 className="text-[#202020] text-3xl font-bold mb-3">Link not found</h1>
        <p className="text-[#333333] text-base mb-8">
          This link doesn&apos;t exist or has expired.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-[#5757f8] text-white text-sm font-medium px-5 py-2.5 rounded-[8px] hover:bg-[#4444e0] transition-colors"
        >
          Go home →
        </Link>
      </div>
    </div>
  )
}
