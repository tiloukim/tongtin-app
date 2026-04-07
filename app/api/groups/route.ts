import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/groups?uid=xxx — get user's groups
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ groups: [], pending: [] })
  const s = db()
  // Approved memberships
  const { data: memberOf } = await s.from('members').select('group_id').eq('user_id', uid).eq('approved', true)
  const memberIds = (memberOf || []).map(m => m.group_id)
  // Led groups
  const { data: led } = await s.from('groups').select('*').eq('leader_id', uid)
  // Joined groups
  const { data: joined } = memberIds.length > 0 ? await s.from('groups').select('*').in('id', memberIds) : { data: [] }
  const map = new Map()
  ;[...(led || []), ...(joined || [])].forEach(g => map.set(g.id, g))
  // Pending
  const { data: pending } = await s.from('members').select('group_id').eq('user_id', uid).eq('approved', false)
  return NextResponse.json({ groups: Array.from(map.values()), pending: (pending || []).map(p => p.group_id) })
}

// POST /api/groups — create group
export async function POST(req: NextRequest) {
  const body = await req.json()
  const s = db()
  const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')
  const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: group, error } = await s.from('groups').insert({
    ...body, invite_code: code, plan: 'free', trial_ends: trialEnds,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Leader auto-joins
  await s.from('members').insert({ group_id: group.id, user_id: body.leader_id, status: 'waiting', approved: true })
  await s.from('profiles').update({ role: 'leader' }).eq('id', body.leader_id)
  return NextResponse.json({ group })
}
