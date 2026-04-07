'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

const AUTH_PAGES = ['/app/login', '/app/signup', '/app/forgot-password']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !AUTH_PAGES.includes(pathname)) {
      router.replace('/app/login')
    }
  }, [user, loading, pathname, router])

  // Auth pages — no shell
  if (AUTH_PAGES.includes(pathname)) return <>{children}</>

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading...</div>
  if (!user) return null

  const nav = [
    { href: '/app/groups', icon: '🏠', label: 'Home' },
    { href: '/app/groups/join', icon: '🔑', label: 'Join' },
    { href: '/app/groups/new', icon: '➕', label: 'Create' },
  ]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', boxShadow: '0 0 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
        <span style={{ fontWeight: 700, fontSize: 17 }}>តុងទីន</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{profile?.full_name}</span>
          <button onClick={signOut} style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Sign Out</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: 16, paddingBottom: 80 }}>{children}</main>
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 40, paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {nav.map(n => (
          <Link key={n.href} href={n.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', textDecoration: 'none', color: pathname.startsWith(n.href) && pathname !== '/app/groups/join' && pathname !== '/app/groups/new' ? 'var(--gold)' : n.href === pathname ? 'var(--gold)' : 'var(--muted)', fontSize: 10, fontWeight: 500 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>{n.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
