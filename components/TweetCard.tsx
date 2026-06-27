'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient, Tweet } from '@/lib/supabase'

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function timeDiff(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'たった今'
  if (diff < 3600) return Math.floor(diff / 60) + '分'
  if (diff < 86400) return Math.floor(diff / 3600) + '時間'
  return Math.floor(diff / 86400) + '日'
}

export default function TweetCard({ tweet, currentUserId, onDelete }: {
  tweet: Tweet
  currentUserId?: string
  onDelete?: (id: string) => void
}) {
  const isLiked = tweet.likes?.some(l => l.user_id === currentUserId)
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(tweet.likes?.length ?? 0)
  const [heartAnim, setHeartAnim] = useState(false)
  const [reposted, setReposted] = useState(false)
  const [particles, setParticles] = useState<{ id: number; bx: string; by: string }[]>([])
  const heartRef = useRef<HTMLButtonElement>(null)

  async function toggleLike() {
    if (!currentUserId) return
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount(n => n + (nextLiked ? 1 : -1))
    if (nextLiked) {
      setHeartAnim(true)
      setTimeout(() => setHeartAnim(false), 500)
      const dirs = [
        ['−30px','−36px'],['10px','−40px'],['36px','−20px'],
        ['36px','16px'],['4px','40px'],['−32px','24px'],
      ]
      setParticles(dirs.map((d, i) => ({ id: Date.now() + i, bx: d[0], by: d[1] })))
      setTimeout(() => setParticles([]), 700)
    }
    const supabase = createClient()
    const { error } = nextLiked
      ? await supabase.from('likes').insert({ user_id: currentUserId, tweet_id: tweet.id })
      : await supabase.from('likes').delete().match({ user_id: currentUserId, tweet_id: tweet.id })
    if (error) {
      setLiked(!nextLiked)
      setLikeCount(n => n + (nextLiked ? -1 : 1))
    }
  }

  async function toggleRepost() {
    if (!currentUserId || reposted) return
    setReposted(true)
    const supabase = createClient()
    const { error } = await supabase.from('tweets').insert({
      author_id: currentUserId,
      content: null,
      retweet_of: tweet.retweet_of ?? tweet.id,
    })
    if (error) setReposted(false)
  }

  async function deleteTweet() {
    const supabase = createClient()
    await supabase.from('tweets').delete().eq('id', tweet.id)
    onDelete?.(tweet.id)
  }

  const isRepost = !!tweet.retweet_of && tweet.content === null
  const displayTweet = isRepost && tweet.retweet_source ? tweet.retweet_source : tweet
  const reposter = tweet.profiles
  const displayAuthor = displayTweet.profiles
  const avatarLetter = (displayAuthor?.display_name ?? displayAuthor?.username ?? '?')[0].toUpperCase()

  return (
    <article style={{ padding:'15px 16px 8px', borderBottom:'1px solid var(--line)' }}>

      {/* リポストバッジ */}
      {isRepost && (
        <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--muted)', fontSize:12, fontWeight:700, marginBottom:6, paddingLeft:59 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
          <Link href={`/${reposter?.username}`} style={{ color:'var(--muted)', textDecoration:'none' }}>
            {reposter?.display_name ?? reposter?.username} がリポスト
          </Link>
        </div>
      )}

      <div style={{ display:'flex', gap:11 }}>
        {/* アバター */}
        <Link href={`/${displayAuthor?.username}`} style={{ flexShrink:0 }}>
          <div style={{
            width:48, height:48, borderRadius:'50%',
            background:'var(--grad-btn)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:800, fontSize:18,
            boxShadow:'0 4px 12px var(--glow)',
            overflow:'hidden',
          }}>
            {displayAuthor?.avatar_url
              ? <img src={displayAuthor.avatar_url} alt={avatarLetter} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : avatarLetter
            }
          </div>
        </Link>

        <div style={{ flex:1, minWidth:0 }}>
          {/* ヘッダー */}
          <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap', marginBottom:4 }}>
            <Link href={`/${displayAuthor?.username}`} style={{ fontWeight:800, fontSize:15, color:'var(--text)', textDecoration:'none' }}>
              {displayAuthor?.display_name ?? displayAuthor?.username}
            </Link>
            <span style={{ width:15, height:15, borderRadius:'50%', background:'var(--grad-btn)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff' }}>✦</span>
            <span style={{ color:'var(--muted)', fontSize:13, fontWeight:600 }}>@{displayAuthor?.username}</span>
            <span style={{ color:'var(--muted)', fontSize:13 }}>· {timeDiff(displayTweet.created_at)}</span>
            {currentUserId === tweet.author_id && (
              <button onClick={deleteTweet} style={{ marginLeft:'auto', color:'var(--muted)', fontSize:12, background:'none', border:'none', cursor:'pointer' }}>×</button>
            )}
          </div>

          {/* 本文（元ツイートから取得） */}
          <p style={{ fontSize:15, lineHeight:1.7, color:'var(--text)', whiteSpace:'pre-wrap', marginBottom:10 }}>
            {displayTweet.content}
          </p>

          {/* アクション */}
          <div style={{ display:'flex', gap:0, alignItems:'center', maxWidth:288 }}>
            <button style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:13, fontWeight:700, flex:1, padding:'4px 0' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>

            <button onClick={toggleRepost} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color: reposted ? '#2bd49a' : 'var(--muted)', fontSize:13, fontWeight:700, flex:1, padding:'4px 0' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            </button>

            <button ref={heartRef} onClick={toggleLike} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color: liked ? 'var(--accent)' : 'var(--muted)', fontSize:13, fontWeight:700, flex:1, padding:'4px 0', position:'relative' }}>
              <span style={{ display:'inline-block' }} className={heartAnim ? 'heart-anim' : ''}>
                {liked
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                }
              </span>
              {likeCount > 0 && <span>{fmt(likeCount)}</span>}
              {particles.map(p => (
                <span key={p.id} className="burst-particle" style={{ '--bx': p.bx, '--by': p.by } as React.CSSProperties} />
              ))}
            </button>

            <button style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:13, fontWeight:700, flex:1, padding:'4px 0' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
