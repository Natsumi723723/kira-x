'use client'

import { useEffect, useState } from 'react'
import { createClient, Tweet } from '@/lib/supabase'
import TweetCard from './TweetCard'

export default function Timeline({ currentUserId, profileUserId }: {
  currentUserId?: string
  profileUserId?: string
}) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTweets() {
    const supabase = createClient()

    if (profileUserId) {
      const { data } = await supabase
        .from('tweets')
        .select('*, profiles!author_id(*), likes(user_id), retweet_source:tweets!retweet_of(*, profiles!author_id(*))')
        .eq('author_id', profileUserId)
        .order('created_at', { ascending: false })
        .limit(50)
      setTweets((data as Tweet[]) ?? [])
    } else if (currentUserId) {
      // RPC: サーバーサイドで JOIN → 1往復で取得（フォロー数が増えても安全）
      const { data } = await supabase
        .rpc('get_home_timeline', { p_user_id: currentUserId, p_limit: 50 })
      setTweets((data as Tweet[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTweets()
    const supabase = createClient()
    const ch = supabase.channel('tl-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, fetchTweets)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [profileUserId, currentUserId])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid var(--accent)', borderTopColor:'transparent', animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (tweets.length === 0) return (
    <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--muted)' }}>
      <p style={{ fontSize:32, marginBottom:8 }}>🎀</p>
      <p style={{ fontWeight:700 }}>まだポストがないよ</p>
    </div>
  )

  return (
    <div>
      {tweets.map(tweet => (
        <TweetCard key={tweet.id} tweet={tweet} currentUserId={currentUserId}
          onDelete={id => setTweets(p => p.filter(t => t.id !== id))} />
      ))}
    </div>
  )
}
