import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const font = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'តុងទីន · Tong Tin',
  description: 'Community Savings Pool Manager',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#C9963A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Tong Tin" />
      </head>
      <body className={font.className}>{children}</body>
    </html>
  )
}
