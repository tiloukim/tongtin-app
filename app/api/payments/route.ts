import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const gid = req.nextUrl.searchParams.get('group_id')
  if (!gid) return NextResponse.json({ payments: [] })
  const { data } = await db().from('payments').select('member_id, round_number').eq('group_id', gid)
  return NextResponse.json({ payments: data || [] })
}

export async function POST(req: NextRequest) {
  const { group_id, member_id, round_number, amount, recorded_by } = await req.json()
  const s = db()
  const { data: existing } = await s.from('payments').select('id').eq('group_id', group_id).eq('member_id', member_id).eq('round_number', round_number).single()
  if (existing) {
    await s.from('payments').delete().eq('id', existing.id)
    return NextResponse.json({ toggled: 'unpaid' })
  }
  await s.from('payments').insert({ group_id, member_id, round_number, amount, recorded_by })
  return NextResponse.json({ toggled: 'paid' })
}
