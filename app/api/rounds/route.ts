import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/rounds?group_id=xxx
export async function GET(req: NextRequest) {
  const gid = req.nextUrl.searchParams.get('group_id')
  if (!gid) return NextResponse.json({ rounds: [], bids: [] })
  const s = db()
  const { data: rounds } = await s.from('rounds').select('*, winner:profiles!winner_id(full_name)').eq('group_id', gid).order('round_number')
  const openRound = (rounds || []).find((r: any) => r.status === 'open')
  let bids: any[] = []
  if (openRound) {
    const { data } = await s.from('bids').select('*, profiles:bidder_id(full_name)').eq('round_id', openRound.id)
    bids = data || []
  }
  return NextResponse.json({ rounds: rounds || [], bids })
}

// POST /api/rounds — open round, submit bid, close round
export async function POST(req: NextRequest) {
  const { action, group_id, round_id, bidder_id, rate, hide_bid, uid } = await req.json()
  const s = db()

  if (action === 'open') {
    const { data: existing } = await s.from('rounds').select('round_number').eq('group_id', group_id).order('round_number', { ascending: false }).limit(1)
    const nextNum = existing?.length ? existing[0].round_number + 1 : 1
    const { data: group } = await s.from('groups').select('contribution, num_players, telegram_chat_id').eq('id', group_id).single()
    const pot = Number(group?.contribution || 0) * (group?.num_players || 0)
    await s.from('rounds').insert({ group_id, round_number: nextNum, pot_amount: pot, status: 'open' })
    // Telegram
    if (group?.telegram_chat_id) {
      fetch(process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('supabase.co', 'supabase.co') + '/../api/telegram/notify', { method: 'POST' }).catch(() => {})
      // Direct Telegram API call
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: group.telegram_chat_id, text: `🎯 Round ${nextNum} is OPEN!\n\n💰 Pot: $${pot}\n\nSubmit your bid at tongtinkh.com/app`, parse_mode: 'HTML' })
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true, round_number: nextNum })
  }

  if (action === 'bid') {
    // Check if already bid
    const { data: existing } = await s.from('bids').select('id').eq('round_id', round_id).eq('bidder_id', bidder_id).limit(1)
    if (existing?.length) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    await s.from('bids').insert({ round_id, group_id, bidder_id, rate, hide_bid: hide_bid || false })
    return NextResponse.json({ ok: true })
  }

  if (action === 'close') {
    const { data: round } = await s.from('rounds').select('*').eq('id', round_id).single()
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    const { data: bids } = await s.from('bids').select('*').eq('round_id', round_id).order('rate', { ascending: false })
    if (!bids?.length) return NextResponse.json({ error: 'No bids' }, { status: 400 })
    const winner = bids[0]
    const pot = Number(round.pot_amount)
    const interest = parseFloat((pot * winner.rate / 100).toFixed(2))
    const netPot = parseFloat((pot - interest).toFixed(2))
    const { data: waiting } = await s.from('members').select('user_id').eq('group_id', round.group_id).eq('approved', true).eq('status', 'waiting').neq('user_id', winner.bidder_id)
    const waitCount = waiting?.length || 1
    const perPlayer = parseFloat((interest / waitCount).toFixed(2))
    await s.from('rounds').update({ status: 'closed', winner_id: winner.bidder_id, winning_rate: winner.rate, interest_paid: interest, net_pot: netPot, per_player_interest: perPlayer, closed_at: new Date().toISOString() }).eq('id', round_id)
    await s.from('members').update({ status: 'taker', round_won: round.round_number }).eq('group_id', round.group_id).eq('user_id', winner.bidder_id)
    await s.from('bids').update({ is_winner: true }).eq('id', winner.id)
    // Telegram
    const { data: group } = await s.from('groups').select('telegram_chat_id').eq('id', round.group_id).single()
    if (group?.telegram_chat_id) {
      const { data: wp } = await s.from('profiles').select('full_name').eq('id', winner.bidder_id).single()
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: group.telegram_chat_id, text: `🏆 <b>Round ${round.round_number} Results!</b>\n\nWinner: <b>${wp?.full_name || 'Unknown'}</b>\nBid: ${winner.rate}%\nNet pot: $${netPot}\nPer player: +$${perPlayer}`, parse_mode: 'HTML' })
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
