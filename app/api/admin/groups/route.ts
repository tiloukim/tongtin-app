import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { data } = await db().from('groups').select('*, leader:profiles!leader_id(full_name, phone)').order('created_at', { ascending: false })
  return NextResponse.json({ groups: data || [] })
}

export async function PATCH(req: NextRequest) {
  const { id, plan, paid_until } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updates: any = {}
  if (plan !== undefined) updates.plan = plan
  if (paid_until !== undefined) updates.paid_until = paid_until
  await db().from('groups').update(updates).eq('id', id)
  return NextResponse.json({ ok: true })
}
