import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { data } = await db().from('profiles').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ users: data || [] })
}

export async function PATCH(req: NextRequest) {
  const { id, full_name, phone, language, role, new_password } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const s = db()
  const updates: any = {}
  if (full_name !== undefined) updates.full_name = full_name
  if (phone !== undefined) updates.phone = phone
  if (language !== undefined) updates.language = language
  if (role !== undefined) updates.role = role
  await s.from('profiles').update(updates).eq('id', id)
  if (new_password) await s.auth.admin.updateUserById(id, { password: new_password })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await db().auth.admin.deleteUser(id)
  return NextResponse.json({ ok: true })
}
