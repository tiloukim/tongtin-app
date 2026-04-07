'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [tab, setTab] = useState<'members'|'rounds'|'payments'|'chat'>('members')
  const [members, setMembers] = useState<any[]>([])
  const [pendingMembers, setPendingMembers] = useState<any[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [payments, setPayments] = useState<Set<string>>(new Set())
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bidRate, setBidRate] = useState(''); const [hideBid, setHideBid] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [expandedRound, setExpandedRound] = useState<string|null>(null)
  const [editMember, setEditMember] = useState<any>(null); const [editName, setEditName] = useState(''); const [editPhone, setEditPhone] = useState('')

  const uid = profile?.id
  const isLeader = group?.leader_id === uid

  const loadAll = useCallback(async () => {
    const [gRes, mRes, rRes, pRes, cRes] = await Promise.all([
      fetch(`/api/groups?uid=${uid}`),
      fetch(`/api/members?group_id=${id}`),
      fetch(`/api/rounds?group_id=${id}`),
      fetch(`/api/payments?group_id=${id}`),
      fetch(`/api/chat?group_id=${id}`),
    ])
    const [gData, mData, rData, pData, cData] = await Promise.all([gRes.json(), mRes.json(), rRes.json(), pRes.json(), cRes.json()])
    const g = (gData.groups || []).find((x: any) => x.id === id)
    if (!g) { const { data } = await fetch(`/api/admin/groups`).then(r => r.json()); setGroup((data?.groups || []).find((x: any) => x.id === id)) }
    else setGroup(g)
    setMembers(mData.members || []); setPendingMembers(mData.pending || [])
    setRounds(rData.rounds || []); setBids(rData.bids || [])
    setPayments(new Set((pData.payments || []).map((p: any) => `${p.member_id}-${p.round_number}`)))
    setMessages(cData.messages || [])
    setLoading(false)
  }, [id, uid])

  useEffect(() => { if (uid) loadAll() }, [uid, loadAll])

  if (loading || !group) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</div>

  const openRound = rounds.find((r: any) => r.status === 'open')
  const closedRounds = rounds.filter((r: any) => r.status === 'closed')
  const myBid = bids.find((b: any) => b.bidder_id === uid)
  const contribution = Number(group.contribution)
  const totalRounds = group.num_players

  // Actions
  const approve = (userId: string) => fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', group_id: id, user_id: userId }) }).then(() => loadAll())
  const reject = (userId: string) => fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', group_id: id, user_id: userId }) }).then(() => loadAll())
  const saveEdit = () => fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'edit', user_id: editMember.user_id, full_name: editName, phone: editPhone }) }).then(() => { setEditMember(null); loadAll() })
  const openNewRound = () => fetch('/api/rounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'open', group_id: id }) }).then(() => loadAll())
  const submitBid = () => { if (!openRound || !bidRate) return; fetch('/api/rounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'bid', round_id: openRound.id, group_id: id, bidder_id: uid, rate: parseFloat(bidRate), hide_bid: hideBid }) }).then(() => { setBidRate(''); loadAll() }) }
  const closeRound = () => { if (!openRound) return; fetch('/api/rounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close', round_id: openRound.id }) }).then(() => loadAll()) }
  const togglePay = (memberId: string, roundNum: number) => { if (!isLeader) return; fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group_id: id, member_id: memberId, round_number: roundNum, amount: contribution, recorded_by: uid }) }).then(() => loadAll()) }
  const sendChat = () => { if (!chatInput.trim()) return; fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group_id: id, author_id: uid, message: chatInput }) }).then(() => { setChatInput(''); loadAll() }) }

  const tabs = [{ key: 'members' as const, icon: '👥', label: 'Members' }, { key: 'rounds' as const, icon: '🎯', label: 'Rounds' }, { key: 'payments' as const, icon: '💰', label: 'Pay' }, { key: 'chat' as const, icon: '💬', label: 'Chat' }]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={() => router.push('/app/groups')} style={{ fontSize: 18, color: 'var(--gold)' }}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{group.name}</h2>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px', fontSize: 10, fontWeight: 500, borderBottom: `2px solid ${tab === tb.key ? 'var(--gold)' : 'transparent'}`, color: tab === tb.key ? 'var(--gold)' : 'var(--muted)' }}>
            <span style={{ fontSize: 18 }}>{tb.icon}</span>{tb.label}
          </button>
        ))}
      </div>

      {/* MEMBERS */}
      {tab === 'members' && (<div>
        {isLeader && group.invite_code && (
          <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold-light)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div className="label" style={{ color: 'var(--gold)', margin: 0 }}>INVITE CODE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, fontFamily: 'monospace' }}>{group.invite_code}</span>
              <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(group.invite_code); alert('Copied!') }}>Copy</button>
            </div>
          </div>
        )}
        {isLeader && pendingMembers.length > 0 && (<div style={{ marginBottom: 16 }}>
          <div className="label" style={{ color: 'var(--gold)' }}>PENDING APPROVALS</div>
          {pendingMembers.map((m: any) => (
            <div key={m.id} className="card" style={{ borderColor: '#F59E0B', background: '#FFFBEB', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⏳</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{m.profiles?.full_name}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.profiles?.phone}</div></div>
                <button className="btn btn-gold" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }} onClick={() => approve(m.user_id)}>Approve</button>
                <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => reject(m.user_id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>)}
        {members.map((m: any) => (
          <div key={m.id} className="card" style={{ marginBottom: 8, borderColor: m.user_id === uid ? 'var(--gold)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>{(m.profiles?.full_name||'??').slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{m.profiles?.full_name}{m.user_id === uid ? ' (You)' : ''}{group.leader_id === m.user_id ? ' 👑' : ''}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.profiles?.phone}</div></div>
              <span className={`badge ${m.status === 'taker' ? 'badge-red' : 'badge-green'}`}>{m.status === 'taker' ? `Took R${m.round_won}` : 'Waiting'}</span>
              {isLeader && m.user_id !== uid && <button onClick={() => { setEditMember(m); setEditName(m.profiles?.full_name||''); setEditPhone(m.profiles?.phone||'') }} style={{ fontSize: 12, color: 'var(--gold)' }}>✏️</button>}
            </div>
          </div>
        ))}
        {editMember && (
          <div onClick={() => setEditMember(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Player</h3>
              <div style={{ marginBottom: 12 }}><label className="label">NAME</label><input className="input" value={editName} onChange={e => setEditName(e.target.value)} /></div>
              <div style={{ marginBottom: 16 }}><label className="label">PHONE</label><input className="input" value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
              <button className="btn btn-gold" onClick={saveEdit}>Save</button>
              <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => setEditMember(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>)}

      {/* ROUNDS */}
      {tab === 'rounds' && (<div>
        {openRound && (
          <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold-light)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 16, fontWeight: 700 }}>Round {openRound.round_number}</span><span className="badge badge-gold">Bidding Open</span></div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Pot: ${Number(openRound.pot_amount)}</div>
            {isLeader && <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4 }}>{bids.length} bids</div>}
            {!isLeader && !myBid && (
              <div style={{ marginTop: 14 }}>
                <label className="label">YOUR RATE (%)</label>
                <input className="input" type="number" value={bidRate} onChange={e => setBidRate(e.target.value)} step="0.1" min="0" max="100" placeholder="5.0" style={{ fontSize: 20, textAlign: 'center', fontWeight: 700, marginBottom: 8 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}><input type="checkbox" checked={hideBid} onChange={e => setHideBid(e.target.checked)} />Hide my bid if I lose</label>
                <button className="btn btn-gold" onClick={submitBid}>Submit Bid →</button>
              </div>
            )}
            {!isLeader && myBid && (
              <div style={{ marginTop: 14, background: '#E8F5EE', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--green)' }}>Bid submitted!</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>{myBid.rate}%{myBid.hide_bid ? ' 🔒' : ''}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Waiting for leader...</div>
              </div>
            )}
            {isLeader && bids.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {[...bids].sort((a: any, b: any) => b.rate - a.rate).map((b: any, i: number) => (
                  <div key={b.id} className="card" style={{ marginBottom: 6, borderColor: i === 0 ? 'var(--gold)' : undefined, background: i === 0 ? 'var(--gold-pale)' : undefined, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ flex: 1, fontWeight: 600 }}>{b.profiles?.full_name}</span><span style={{ fontSize: 18, fontWeight: 800 }}>{b.rate}%</span>{i === 0 && <span>👑</span>}</div>
                  </div>
                ))}
                <button className="btn btn-gold" onClick={closeRound} style={{ marginTop: 12 }}>Close Round & Reveal Winner →</button>
              </div>
            )}
          </div>
        )}
        {closedRounds.length > 0 && (<><div className="label">COMPLETED ROUNDS</div>
          {closedRounds.map((r: any) => (
            <div key={r.id} className="card" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => setExpandedRound(expandedRound === r.id ? null : r.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>R{r.round_number}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{r.winner?.full_name || 'Unknown'} 🏆</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Bid: {r.winning_rate}%</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, color: 'var(--green)' }}>${Number(r.net_pot||0).toFixed(2)}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>net pot</div></div>
                <span style={{ color: 'var(--muted)' }}>{expandedRound === r.id ? '▲' : '▼'}</span>
              </div>
              {expandedRound === r.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
                  <div className="label">PLAYER BREAKDOWN</div>
                  {members.map((m: any) => {
                    const isW = m.user_id === r.winner_id
                    const earlyTaker = m.status === 'taker' && m.round_won && m.round_won < r.round_number
                    const pp = Number(r.per_player_interest || 0)
                    if (isW) return <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span>🏆 <strong>{m.profiles?.full_name}</strong></span><span style={{ fontWeight: 700, color: 'var(--green)' }}>Collects ${Number(r.net_pot||0).toFixed(2)}</span></div>
                    if (earlyTaker) return <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span>{m.profiles?.full_name} <span style={{ fontSize: 11, color: 'var(--red)' }}>(took R{m.round_won})</span></span><span>pays ${contribution.toFixed(2)}</span></div>
                    return <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span>{m.profiles?.full_name}</span><span>${contribution} - ${pp.toFixed(2)} = <strong>pays ${(contribution - pp).toFixed(2)}</strong></span></div>
                  })}
                </div>
              )}
            </div>
          ))}
        </>)}
        {!openRound && isLeader && <button className="btn btn-outline" onClick={openNewRound} style={{ marginTop: 12 }}>+ Open New Round</button>}
        {rounds.length === 0 && !isLeader && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>🎯 No rounds yet</div>}
      </div>)}

      {/* PAYMENTS */}
      {tab === 'payments' && (<div>
        <div className="label">PAYMENT TRACKER{isLeader ? ' — tap to toggle' : ''}</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontSize: 11 }}>Player</th>
              {Array.from({ length: totalRounds }, (_, i) => <th key={i} style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--muted)', fontSize: 11 }}>R{i+1}</th>)}
            </tr></thead>
            <tbody>{members.map((m: any) => (
              <tr key={m.id}><td style={{ padding: '6px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{m.profiles?.full_name?.split(' ')[0]}</td>
                {Array.from({ length: totalRounds }, (_, i) => {
                  const paid = payments.has(`${m.user_id}-${i+1}`)
                  return <td key={i} style={{ textAlign: 'center', padding: 4 }}><div onClick={() => togglePay(m.user_id, i+1)} style={{ width: 28, height: 28, borderRadius: '50%', margin: '0 auto', background: paid ? 'var(--green)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLeader ? 'pointer' : 'default', fontSize: 12, color: '#fff', fontWeight: 700 }}>{paid ? '✓' : ''}</div></td>
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>)}

      {/* CHAT */}
      {tab === 'chat' && (<div>
        <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No messages yet</div>}
          {messages.map((m: any) => {
            const own = m.author_id === uid
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{own ? 'You' : m.profiles?.full_name}</div>
                <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: 12, background: own ? 'var(--gold)' : '#E8E8E4', color: own ? '#fff' : 'var(--ink)', fontSize: 14, lineHeight: 1.4, wordBreak: 'break-word', borderBottomRightRadius: own ? 4 : 12, borderBottomLeftRadius: own ? 12 : 4 }}>{m.message}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." style={{ flex: 1 }} />
          <button className="btn btn-gold" onClick={sendChat} style={{ width: 'auto', padding: '10px 18px' }}>Send</button>
        </div>
      </div>)}
    </div>
  )
}
