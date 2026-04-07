import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auth?uid=xxx — get user profile by auth ID
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return NextResponse.json({ profile: null })
  const { data } = await db().from('profiles').select('*').eq('id', uid).single()
  return NextResponse.json({ profile: data })
}
