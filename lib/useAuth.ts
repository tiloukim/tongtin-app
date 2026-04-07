'use client'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string; full_name: string; phone: string; language: string; role: string
}

export function useAuth() {
  const [supabase] = useState(() => getSupabase())
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u: User) => {
    // All queries go through API — no RLS issues
    const res = await fetch(`/api/auth?uid=${u.id}`)
    if (res.ok) {
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        return
      }
    }
    // Profile doesn't exist — create it
    const meta = u.user_metadata || {}
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, full_name: meta.full_name || u.email?.split('@')[0] || 'User', phone: meta.phone || '' }),
    }).catch(() => {})
    // Fetch again
    const res2 = await fetch(`/api/auth?uid=${u.id}`)
    if (res2.ok) {
      const data2 = await res2.json()
      if (data2.profile) setProfile(data2.profile)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [supabase])

  return { supabase, user, profile, loading, signOut, refreshProfile: () => user ? loadProfile(user) : Promise.resolve() }
}
