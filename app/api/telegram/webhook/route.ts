import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendTG(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const msg = body.message
  if (!msg?.text || !msg?.chat) return NextResponse.json({ ok: true })
  const chatId = String(msg.chat.id)
  const text = msg.text.trim()

  if (text === '/start') {
    await sendTG(chatId, '🪙 <b>តុងទីន · Tong Tin Bot</b>\n\nCommands:\n/link CODE — Link to your group\n/status — Check linked group')
    return NextResponse.json({ ok: true })
  }

  if (text.startsWith('/link')) {
    const code = text.split(' ')[1]?.trim().toUpperCase()
    if (!code) { await sendTG(chatId, '❌ Usage: /link YOUR_CODE'); return NextResponse.json({ ok: true }) }
    const s = db()
    const { data: group } = await s.from('groups').select('id, name').eq('invite_code', code).single()
    if (!group) { await sendTG(chatId, '❌ Invalid code.'); return NextResponse.json({ ok: true }) }
    await s.from('groups').update({ telegram_chat_id: chatId }).eq('id', group.id)
    await sendTG(chatId, `✅ Linked to <b>${group.name}</b>!\n\nYou'll receive round notifications here.`)
    return NextResponse.json({ ok: true })
  }

  if (text === '/status') {
    const { data: group } = await db().from('groups').select('name, num_players, status').eq('telegram_chat_id', chatId).single()
    if (group) await sendTG(chatId, `📊 <b>${group.name}</b>\nPlayers: ${group.num_players}\nStatus: ${group.status}`)
    else await sendTG(chatId, '❌ No group linked. Use /link CODE')
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
