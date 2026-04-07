import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { id, full_name, phone, language } = await req.json()
    if (!id || !full_name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const { error } = await db().from('profiles').upsert({
      id, full_name, phone: phone || `user-${id.slice(0, 8)}`, language: language || 'en',
    }, { onConflict: 'id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
