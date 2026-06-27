'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function FollowButton({ currentUserId, targetUserId, initialFollowing }: {
  currentUserId: string
  targetUserId: string
  initialFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)

  async function toggle() {
    // ① 先にStateを反転
    const nextFollowing = !following
    setFollowing(nextFollowing)

    // ② 裏でAPIを叩く（失敗したらロールバック）
    const supabase = createClient()
    const { error } = nextFollowing
      ? await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId })
      : await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: targetUserId })

    if (error) setFollowing(!nextFollowing)
  }

  return (
    <button
      onClick={toggle}
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
        transition: 'all .2s',
      }}
    >
      {following ? 'フォロー中' : 'フォロー ♡'}
    </button>
  )
}
