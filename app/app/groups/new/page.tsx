'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function NewGroupPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [name, setName] = useState(''); const [contrib, setContrib] = useState(''); const [players, setPlayers] = useState(''); const [start, setStart] = useState(''); const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !contrib || !players) { setError('Fill all required fields'); return }
    setLoading(true)
    const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contribution: parseFloat(contrib), num_players: parseInt(players), start_date: start || new Date().toISOString().slice(0, 10), status: 'active', leader_id: profile?.id, description: desc || null })
    })
    const data = await res.json()
    if (data.group) router.push(`/app/groups/${data.group.id}`)
    else { setError(data.error || 'Failed'); setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>+ Create Group</h2>
      {error && <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}
      <form onSubmit={handle} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="label">GROUP NAME</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Family Pool 2026" required /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label className="label">CONTRIBUTION ($)</label><input className="input" type="number" value={contrib} onChange={e => setContrib(e.target.value)} placeholder="50" required /></div>
          <div><label className="label">PLAYERS</label><input className="input" type="number" value={players} onChange={e => setPlayers(e.target.value)} placeholder="10" min="2" required /></div>
        </div>
        <div><label className="label">START DATE</label><input className="input" type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div><label className="label">DESCRIPTION</label><input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional notes" /></div>
        <button className="btn btn-gold" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Group'}</button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
      </form>
    </div>
  )
}
