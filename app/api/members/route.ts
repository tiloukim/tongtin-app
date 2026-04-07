import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/members?group_id=xxx
export async function GET(req: NextRequest) {
  const gid = req.nextUrl.searchParams.get('group_id')
  if (!gid) return NextResponse.json({ members: [], pending: [] })
  const { data } = await db().from('members').select('*, profiles(id, full_name, phone)').eq('group_id', gid).order('joined_at')
  const all = data || []
  return NextResponse.json({ members: all.filter((m: any) => m.approved), pending: all.filter((m: any) => !m.approved) })
}

// POST /api/members — join group or approve/reject
export async function POST(req: NextRequest) {
  const { action, group_id, user_id, invite_code, full_name, phone } = await req.json()
  const s = db()

  if (action === 'join') {
    // Find group by invite code
    const { data: group } = await s.from('groups').select('*').eq('invite_code', invite_code).single()
    if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    // Check existing
    const { data: existing } = await s.from('members').select('id, approved').eq('group_id', group.id).eq('user_id', user_id).single()
    if (existing) return NextResponse.json({ error: existing.approved ? 'Already a member' : 'Pending approval' })
    // Check capacity
    const { count } = await s.from('members').select('id', { count: 'exact', head: true }).eq('group_id', group.id).eq('approved', true)
    if ((count || 0) >= group.num_players) return NextResponse.json({ error: 'Group is full' }, { status: 400 })
    // Ensure profile exists
    await s.from('profiles').upsert({ id: user_id, full_name: full_name || 'User', phone: phone || `user-${user_id.slice(0, 8)}` }, { onConflict: 'id' })
    await s.from('members').insert({ group_id: group.id, user_id, status: 'waiting', approved: false })
    return NextResponse.json({ ok: true, group_name: group.name })
  }

  if (action === 'approve') {
    await s.from('members').update({ approved: true }).eq('group_id', group_id).eq('user_id', user_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    await s.from('members').delete().eq('group_id', group_id).eq('user_id', user_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'edit') {
    // Leader edits player phone/name
    const updates: any = {}
    if (full_name) updates.full_name = full_name
    if (phone) updates.phone = phone
    await s.from('profiles').update(updates).eq('id', user_id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
