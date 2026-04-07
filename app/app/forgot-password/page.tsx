'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function ForgotPage() {
  const { supabase } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/app/login' })
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Reset Password</h1>
        {sent ? (
          <div style={{ background: '#E8F5EE', borderRadius: 8, padding: 16, color: 'var(--green)', marginBottom: 20 }}>
            Reset link sent to <strong>{email}</strong>
          </div>
        ) : (
          <form onSubmit={handle}>
            {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 14 }} required />
            <button className="btn btn-gold" type="submit">Send Reset Link</button>
          </form>
        )}
        <div style={{ marginTop: 20 }}><Link href="/app/login" style={{ color: 'var(--gold)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Back to Sign In</Link></div>
      </div>
    </div>
  )
}
