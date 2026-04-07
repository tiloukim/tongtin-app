'use client'
import { useState, useEffect } from 'react'

const PASS = 'tongtin2026'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false); const [pw, setPw] = useState('')
  const [tab, setTab] = useState<'groups'|'users'>('groups')
  const [groups, setGroups] = useState<any[]>([]); const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (authed) { fetch('/api/admin/groups').then(r=>r.json()).then(d=>setGroups(d.groups||[])); fetch('/api/admin/users').then(r=>r.json()).then(d=>setUsers(d.users||[])).finally(()=>setLoading(false)) } }, [authed])

  const activate = (id: string, months: number) => { const d = new Date(); d.setMonth(d.getMonth()+months); fetch('/api/admin/groups',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,plan:'active',paid_until:d.toISOString()})}).then(()=>fetch('/api/admin/groups').then(r=>r.json()).then(d=>setGroups(d.groups||[]))) }
  const deactivate = (id: string) => fetch('/api/admin/groups',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,plan:'expired',paid_until:null})}).then(()=>fetch('/api/admin/groups').then(r=>r.json()).then(d=>setGroups(d.groups||[])))

  if (!authed) return (
    <div style={{minHeight:'100vh',background:'var(--surface)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:20,padding:40,maxWidth:360,width:'100%',textAlign:'center'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:20}}>Tong Tin Admin</h1>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(pw===PASS?setAuthed(true):alert('Wrong'))} placeholder="Password" style={{width:'100%',padding:12,borderRadius:8,border:'1px solid var(--border)',marginBottom:12,boxSizing:'border-box'}} />
        <button className="btn btn-gold" onClick={()=>pw===PASS?setAuthed(true):alert('Wrong')}>Sign In</button>
      </div>
    </div>
  )

  if (loading) return <div style={{textAlign:'center',padding:60}}>Loading...</div>

  const getStatus = (g:any) => { if(g.plan==='active'&&g.paid_until&&new Date(g.paid_until)>new Date()) return 'active'; if(g.trial_ends&&new Date(g.trial_ends)>new Date()) return 'trial'; return 'expired' }

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px'}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:8}}>Tong Tin Admin</h1>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        <button onClick={()=>setTab('groups')} style={{padding:'10px 24px',borderRadius:10,border:'none',fontSize:14,fontWeight:700,cursor:'pointer',background:tab==='groups'?'var(--gold)':'#E8DFD0',color:tab==='groups'?'#fff':'var(--muted)'}}>Groups ({groups.length})</button>
        <button onClick={()=>setTab('users')} style={{padding:'10px 24px',borderRadius:10,border:'none',fontSize:14,fontWeight:700,cursor:'pointer',background:tab==='users'?'var(--gold)':'#E8DFD0',color:tab==='users'?'#fff':'var(--muted)'}}>Users ({users.length})</button>
      </div>
      {tab==='groups'&&groups.map(g=>{const st=getStatus(g);return(
        <div key={g.id} className="card" style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div><div style={{fontWeight:700,fontSize:16}}>{g.name}</div><div style={{fontSize:13,color:'var(--muted)'}}>Leader: {g.leader?.full_name||'?'} · Code: {g.invite_code||'—'}</div></div>
            <span className={`badge ${st==='active'?'badge-green':st==='trial'?'badge-gold':'badge-red'}`}>{st}</span></div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>activate(g.id,1)} style={{padding:'8px 14px',borderRadius:8,background:'var(--green)',color:'#fff',fontWeight:600,fontSize:12,border:'none',cursor:'pointer'}}>+1 Mo</button>
            <button onClick={()=>activate(g.id,12)} style={{padding:'8px 14px',borderRadius:8,background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:12,border:'none',cursor:'pointer'}}>+1 Yr</button>
            {st!=='expired'&&<button onClick={()=>deactivate(g.id)} style={{padding:'8px 14px',borderRadius:8,background:'#FCEBEB',color:'var(--red)',fontWeight:600,fontSize:12,border:'1px solid var(--red)',cursor:'pointer'}}>Deactivate</button>}
          </div>
        </div>
      )})}
      {tab==='users'&&<div style={{background:'#fff',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Name','Phone','Role','Joined'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase'}}>{h}</th>)}</tr></thead><tbody>{users.map((u:any)=><tr key={u.id} style={{borderBottom:'1px solid #f0f0f0'}}><td style={{padding:'12px 14px',fontWeight:600}}>{u.full_name}</td><td style={{padding:'12px 14px',fontSize:13,color:'var(--muted)'}}>{u.phone||'—'}</td><td style={{padding:'12px 14px'}}><span className="badge badge-gold">{u.role||'player'}</span></td><td style={{padding:'12px 14px',fontSize:13,color:'var(--muted)'}}>{u.created_at?new Date(u.created_at).toLocaleDateString():'—'}</td></tr>)}</tbody></table></div>}
    </div>
  )
}
