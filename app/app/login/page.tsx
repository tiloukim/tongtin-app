'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function LoginPage() {
  const { supabase, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (user) router.replace('/app/groups') }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', maxWidth: 400, width: '100%', boxShadow: '0 4px 24px rgba(26,22,18,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: 'var(--gold)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🪙</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>តុងទីន</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Community Savings Pool</p>
        </div>
        {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">EMAIL</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <div><label className="label">PASSWORD</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required /></div>
          <button className="btn btn-gold" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/app/forgot-password" style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--muted)' }}>
          No account? <Link href="/app/signup" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
        </div>
      </div>
    </div>
  )
}
