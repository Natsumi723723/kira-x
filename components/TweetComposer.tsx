'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const MAX = 140

export default function TweetComposer({ userId, avatarLetter, avatarUrl, onPosted, onClose }: {
  userId: string
  avatarLetter?: string
  avatarUrl?: string | null
  onPosted?: () => void
  onClose?: () => void
}) {
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const remaining = MAX - content.length
  const canPost = content.trim().length > 0 && remaining >= 0

  async function post() {
    if (!canPost) return
    setPosting(true)
    const supabase = createClient()
    await supabase.from('tweets').insert({ author_id: userId, content: content.trim() })
    setContent('')
    setPosting(false)
    onPosted?.()
    onClose?.()
  }

  return (
    <div className="composer-overlay" style={{
      position:'fixed', inset:0, zIndex:100,
      background:'rgba(58,20,48,.45)',
      backdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="composer-sheet" style={{
        width:'100%', maxWidth:430, margin:'0 auto',
        background:'var(--card)',
        borderRadius:'34px 34px 0 0',
        padding:'20px 16px 40px',
      }}>
        {/* ヘッダー */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontWeight:700, fontSize:14, fontFamily:'M PLUS Rounded 1c' }}>
            とじる
          </button>
          <span style={{ fontFamily:'Mochiy Pop One', fontSize:15, color:'var(--accent)' }}>いまのきもち ✦</span>
          <span style={{ fontSize:13, fontWeight:700, color: remaining < 20 ? 'var(--accent)' : 'var(--muted)' }}>
            {remaining}/{MAX}
          </span>
        </div>

        {/* 入力エリア */}
        <div style={{ display:'flex', gap:11 }}>
          <div style={{
            width:48, height:48, borderRadius:'50%', flexShrink:0,
            background:'var(--grad-btn)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:800, fontSize:18,
            overflow:'hidden',
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt={avatarLetter ?? 'U'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : (avatarLetter ?? 'U')
            }
          </div>
          <textarea
            autoFocus
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="いまどうしてる？かわいくつぶやこ♡"
            maxLength={MAX}
            rows={4}
            style={{
              flex:1, border:'none', outline:'none', resize:'none',
              fontSize:16, lineHeight:1.6, color:'var(--text)',
              background:'transparent', fontFamily:'M PLUS Rounded 1c',
            }}
          />
        </div>

        {/* 下部 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16, paddingTop:12, borderTop:'1px solid var(--line)' }}>
          <div style={{ display:'flex', gap:16, fontSize:20 }}>
            <span style={{ cursor:'pointer' }}>🖼️</span>
            <span style={{ cursor:'pointer' }}>✨</span>
            <span style={{ cursor:'pointer' }}>🎀</span>
            <span style={{ cursor:'pointer' }}>📍</span>
          </div>
          <button
            onClick={post}
            disabled={!canPost || posting}
            className="grad-btn"
            style={{
              padding:'10px 22px', borderRadius:999,
              fontSize:14, fontFamily:'M PLUS Rounded 1c',
            }}
          >
            {posting ? '投稿中…' : '投稿 ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}
