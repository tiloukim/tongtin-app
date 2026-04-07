'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function JoinPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [code, setCode] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', invite_code: code.trim().toUpperCase(), user_id: profile?.id, full_name: profile?.full_name, phone: profile?.phone })
    })
    const data = await res.json()
    if (data.ok) { alert('Join request sent! Waiting for leader approval.'); router.push('/app/groups') }
    else setError(data.error || 'Failed')
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Join Group</h2>
      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Enter the invite code from your group leader</p>
        {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}
        <form onSubmit={handle}>
          <div style={{ marginBottom: 16 }}><label className="label">INVITE CODE</label>
            <input className="input" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ textTransform: 'uppercase', letterSpacing: 3, fontSize: 20, textAlign: 'center', fontWeight: 700, fontFamily: 'monospace' }} required />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading}>{loading ? 'Joining...' : 'Join Group →'}</button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()} style={{ marginTop: 10 }}>Cancel</button>
        </form>
      </div>
    </div>
  )
}
