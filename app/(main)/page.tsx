'use client'

import { useEffect, useState } from 'react'
import { createClient, Tweet } from '@/lib/supabase'
import TweetCard from '@/components/TweetCard'
import TweetComposer from '@/components/TweetComposer'

const stories = [
  { label: 'あなた', emoji: null, live: false, isMe: true },
  { label: 'LIVE中🐰', emoji: '🐰', live: true },
  { label: 'ゆめ🎀', emoji: '🎀', live: false },
  { label: 'もも🍓', emoji: '🍓', live: false },
  { label: 'らむ🦄', emoji: '🦄', live: false },
]

export default function HomePage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [avatarLetter, setAvatarLetter] = useState('U')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'following'>('all')
  const [composeOpen, setComposeOpen] = useState(false)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', user.id).single()
      setAvatarLetter((profile?.display_name ?? profile?.username ?? 'U')[0].toUpperCase())
      setAvatarUrl(profile?.avatar_url ?? null)
      fetchTweets(user.id, tab)
    })()
  }, [])

  async function fetchTweets(uid?: string, currentTab?: string) {
    const supabase = createClient()
    const id = uid ?? currentUserId
    const t = currentTab ?? tab
    if (!id) return

    if (t === 'following') {
      // 自分 + フォロー中のIDリストを取得してフィルター
      const { data: followingData } = await supabase
        .from('follows').select('following_id').eq('follower_id', id)
      const ids = [id, ...(followingData?.map((f: { following_id: string }) => f.following_id) ?? [])]
      const { data } = await supabase
        .from('tweets')
        .select('*, profiles!author_id(*), likes(user_id), retweet_source:tweets!retweet_of(*, profiles!author_id(*))')
        .in('author_id', ids)
        .order('created_at', { ascending: false })
        .limit(50)
      setTweets((data as Tweet[]) ?? [])
    } else {
      const { data } = await supabase.from('tweets').select('*, profiles!author_id(*), likes(user_id), retweet_source:tweets!retweet_of(*, profiles!author_id(*))').order('created_at', { ascending: false }).limit(50)
      setTweets((data as Tweet[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!currentUserId) return
    fetchTweets(currentUserId, tab)
    const supabase = createClient()
    const ch = supabase.channel('home-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, () => fetchTweets()).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [tab, currentUserId])

  return (
    <>
      {/* ヘッダー */}
      <header style={{ position:'sticky', top:0, zIndex:40, background:'rgba(255,250,253,.9)', backdropFilter:'blur(14px)', borderBottom:'1px solid var(--line)', padding:'12px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <h1 className="logo-text" style={{ fontFamily:'Mochiy Pop One', fontSize:26 }}>kira ✦</h1>
          <button style={{ width:40, height:40, borderRadius:'50%', background:'var(--chip)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>

        {/* タブ */}
        <div style={{ display:'flex' }}>
          {(['all','following'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'10px 0', background:'none', border:'none', cursor:'pointer',
              fontWeight:700, fontSize:15, fontFamily:'M PLUS Rounded 1c',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
              borderBottom: tab === t ? '3px solid var(--accent)' : '3px solid transparent',
              transition:'all .2s',
            }}>
              {t === 'all' ? 'おすすめ' : 'フォロー中'}
            </button>
          ))}
        </div>
      </header>

      {/* ストーリー行 */}
      <div style={{ display:'flex', gap:14, padding:'14px 16px', overflowX:'auto', borderBottom:'1px solid var(--line)', scrollbarWidth:'none' }}>
        {stories.map((s, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
            {s.isMe ? (
              <div style={{ width:56, height:56, borderRadius:'50%', border:'2.5px dashed var(--accent2)', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--chip)', cursor:'pointer' }} onClick={() => setComposeOpen(true)}>
                <span style={{ fontSize:22, color:'var(--accent)' }}>＋</span>
              </div>
            ) : (
              <div className="story-ring">
                <div className="story-ring-inner">
                  <div style={{ width:52, height:52, borderRadius:'50%', background: s.live ? 'linear-gradient(135deg,#ff5fb0,#c77dff)' : 'linear-gradient(135deg,#ffb3d9,#ff8ec7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, cursor:'pointer' }}>
                    {s.emoji}
                  </div>
                </div>
              </div>
            )}
            <span style={{ fontSize:11, fontWeight:600, color:'var(--muted)', maxWidth:54, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* タイムライン */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid var(--accent)', borderTopColor:'transparent', animation:'spin 1s linear infinite' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : tweets.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--muted)' }}>
          <p style={{ fontSize:32, marginBottom:8 }}>🎀</p>
          <p style={{ fontWeight:700 }}>まだポストがないよ</p>
          <p style={{ fontSize:13, marginTop:4 }}>誰かをフォローしてタイムラインを埋めよう♡</p>
        </div>
      ) : (
        <div style={{ paddingBottom:8 }}>
          {tweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} currentUserId={currentUserId} onDelete={id => setTweets(p => p.filter(t => t.id !== id))} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setComposeOpen(true)} style={{
        position:'fixed', bottom:88, right:'max(16px, calc(50vw - 197px))',
        width:62, height:62, borderRadius:'50%',
        background:'var(--grad-btn)',
        border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 6px 20px var(--glow)',
        animation:'pulseglow 2.4s ease-in-out infinite',
        zIndex:40,
        fontSize:22, color:'#fff',
      }}>✦</button>

      {/* コンポーザー */}
      {composeOpen && currentUserId && (
        <TweetComposer
          userId={currentUserId}
          avatarLetter={avatarLetter}
          avatarUrl={avatarUrl}
          onPosted={() => fetchTweets()}
          onClose={() => setComposeOpen(false)}
        />
      )}
    </>
  )
}
