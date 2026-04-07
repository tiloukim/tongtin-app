'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function GroupsPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [pending, setPending] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    fetch(`/api/groups?uid=${profile.id}`).then(r => r.json()).then(d => {
      setGroups(d.groups || [])
      setPending(d.pending || [])
    }).finally(() => setLoading(false))
  }, [profile])

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</div>

  const getPlan = (g: any) => {
    if (g.plan === 'active' && g.paid_until && new Date(g.paid_until) > new Date()) return 'active'
    if (g.trial_ends && new Date(g.trial_ends) > new Date()) return 'trial'
    return 'expired'
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: 'var(--gold-pale)', borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500, textTransform: 'uppercase' }}>Groups</div><div style={{ fontSize: 22, fontWeight: 600 }}>{groups.length}</div></div>
        <div style={{ background: 'var(--gold-pale)', borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500, textTransform: 'uppercase' }}>Total Pot</div><div style={{ fontSize: 22, fontWeight: 600 }}>${groups.reduce((s, g) => s + Number(g.contribution) * g.num_players, 0)}</div></div>
        <div style={{ background: 'var(--gold-pale)', borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500, textTransform: 'uppercase' }}>Leading</div><div style={{ fontSize: 22, fontWeight: 600 }}>{groups.filter(g => g.leader_id === profile?.id).length}</div></div>
      </div>

      {groups.length === 0 && pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪙</div>
          <div style={{ fontSize: 14 }}>No groups yet. Create or join one!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map(g => {
            const plan = getPlan(g)
            const isLeader = g.leader_id === profile?.id
            return (
              <div key={g.id} className="card" onClick={() => router.push(`/app/groups/${g.id}`)} style={{ cursor: 'pointer', opacity: plan === 'expired' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🪙</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{isLeader ? '👑 Leader' : '👤 Member'} · ${g.contribution}/mo</div>
                  </div>
                  <span className={`badge ${plan === 'active' ? 'badge-green' : plan === 'trial' ? 'badge-gold' : 'badge-red'}`}>{plan}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
                  <span>💰 ${Number(g.contribution) * g.num_players}</span>
                  <span>👥 {g.num_players}</span>
                  {isLeader && g.invite_code && <span style={{ color: 'var(--gold)' }}>🔑 {g.invite_code}</span>}
                </div>
              </div>
            )
          })}
          {pending.map(gid => (
            <div key={gid} className="card" style={{ opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>⏳</span>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Pending approval</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>ID: {gid.slice(0, 8)}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
