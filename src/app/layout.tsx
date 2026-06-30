import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from 'sonner'
import { PHProvider } from '@/providers/posthog'
import { AuthNavButtons } from '@/components/auth-nav-buttons'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkGoes",
  description: "Personal URL shortener with click analytics",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <PHProvider>
            <header className="flex h-14 shrink-0 items-center justify-between px-6 bg-white border-b border-[#202020]">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/android-chrome-192x192.png" alt="LinkGoes" width={24} height={24} />
                <span className="text-[#202020] font-bold text-lg tracking-tight">LinkGoes</span>
              </Link>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <AuthNavButtons />
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
          </PHProvider>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}