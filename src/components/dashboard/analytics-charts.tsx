'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { toast } from 'sonner'

type AnalyticsData = {
  total: number
  last7d: number
  last30d: number
  clicksByDay: { date: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  countryBreakdown: { country: string; count: number }[]
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #202020',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#202020',
}

export function AnalyticsCharts({ analytics, shortUrl, slug, linkId }: {
  analytics: AnalyticsData
  shortUrl: string
  slug: string
  linkId: string
}) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadQR() {
    setDownloading(true)
    const res = await fetch(`/api/links/${linkId}/qr`)
    if (!res.ok) { toast.error('Failed to generate QR'); setDownloading(false); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr.png`
    a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
    toast.success('QR code downloaded')
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#202020] rounded-[8px] p-6">
        <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wide mb-4">Clicks per day (30d)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analytics.clicksByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#333333' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#333333' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#5757f8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#202020] rounded-[8px] p-6">
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wide mb-4">Top referrers</h2>
          {analytics.topReferrers.length === 0 ? (
            <p className="text-sm text-[#333333]">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.topReferrers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#333333' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="referrer" tick={{ fontSize: 11, fill: '#333333' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#5757f8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-[#202020] rounded-[8px] p-6">
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wide mb-4">Country breakdown</h2>
          {analytics.countryBreakdown.length === 0 ? (
            <p className="text-sm text-[#333333]">No data yet</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {analytics.countryBreakdown.slice(0, 6).map(row => (
                  <tr key={row.country} className="border-b border-[#f5f5f5]">
                    <td className="py-1.5 text-[#202020]">{row.country}</td>
                    <td className="py-1.5 text-right font-semibold text-[#202020]">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#202020] rounded-[8px] p-6 flex items-center gap-8">
        <div>
          <h2 className="text-sm font-semibold text-[#333333] uppercase tracking-wide mb-3">QR Code</h2>
          <p className="text-sm text-[#333333] mb-4">{shortUrl}</p>
          <button
            onClick={handleDownloadQR}
            disabled={downloading}
            className="bg-white text-[#202020] text-sm font-medium px-4 py-2 rounded-[8px] border border-[#202020] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            {downloading ? 'Generating…' : 'Download PNG'}
          </button>
        </div>
        <div className="w-32 h-32 bg-[#f5f5f5] border border-[#202020] rounded-[8px] flex items-center justify-center">
          <img
            src={`/api/links/${linkId}/qr`}
            alt="QR code"
            className="w-28 h-28"
          />
        </div>
      </div>
    </div>
  )
}
