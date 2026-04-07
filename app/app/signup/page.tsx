'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function SignupPage() {
  const { supabase, user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (user) router.replace('/app/groups') }, [user, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || password.length < 6) { setError('Fill all fields. Password min 6 chars.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, phone: phone || null } } })
    if (err) { setError(err.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', maxWidth: 400, width: '100%', boxShadow: '0 4px 24px rgba(26,22,18,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: 'var(--gold)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✨</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create Account</h1>
        </div>
        {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">FULL NAME</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Sokha Chan" required /></div>
          <div><label className="label">PHONE (OPTIONAL)</label><input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+855 12 345 678" /></div>
          <div><label className="label">EMAIL</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <div><label className="label">PASSWORD</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required /></div>
          <button className="btn btn-gold" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--muted)' }}>
          Have an account? <Link href="/app/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
