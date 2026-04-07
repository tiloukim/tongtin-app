import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const gid = req.nextUrl.searchParams.get('group_id')
  if (!gid) return NextResponse.json({ messages: [] })
  const { data } = await db().from('announcements').select('*, profiles:author_id(full_name)').eq('group_id', gid).order('created_at', { ascending: true }).limit(100)
  return NextResponse.json({ messages: data || [] })
}

export async function POST(req: NextRequest) {
  const { group_id, author_id, message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Empty' }, { status: 400 })
  await db().from('announcements').insert({ group_id, author_id, message: message.trim() })
  return NextResponse.json({ ok: true })
}
