'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function FollowButton({ currentUserId, targetUserId, initialFollowing }: {
  currentUserId: string
  targetUserId: string
  initialFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    if (following) {
      await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={following ? '' : 'grad-btn'}
      style={{
        padding: '8px 20px',
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'M PLUS Rounded 1c',
        ...(following ? {
          border: '2px solid var(--line)',
          background: 'transparent',
          color: 'var(--muted)',
        } : {
          border: 'none',
        }),
        opacity: loading ? .6 : 1,
        transition: 'all .2s',
      }}
    >
      {following ? 'フォロー中' : 'フォロー ♡'}
    </button>
  )
}
