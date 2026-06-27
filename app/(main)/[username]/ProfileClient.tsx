'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient, Profile } from '@/lib/supabase'
import Timeline from '@/components/Timeline'
import FollowButton from '@/components/FollowButton'
import EditProfileButton from '@/components/EditProfileButton'
import ProfileFAB from '@/components/ProfileFAB'

export default function ProfileClient() {
  const params = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [initialFollowing, setInitialFollowing] = useState(false)
  const [tweetCount, setTweetCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // GitHub Pages の 404 リダイレクト経由で来た場合、URL から username を読む
  const username = params?.username
    ?? (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : '')

  useEffect(() => {
    if (!username) return
    ;(async () => {
      const supabase = createClient()
      const [{ data: { user } }, { data: profileData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('*').eq('username', username).single(),
      ])

      if (!profileData) { setNotFound(true); setLoading(false); return }

      setCurrentUserId(user?.id)
      setProfile(profileData)

      const [{ count: fc }, { count: fgc }, { data: followRow }, { count: tc }] = await Promise.all([
        supabase.from('follows').select('*', { count:'exact', head:true }).eq('following_id', profileData.id),
        supabase.from('follows').select('*', { count:'exact', head:true }).eq('follower_id', profileData.id),
        user
          ? supabase.from('follows').select('*').match({ follower_id: user.id, following_id: profileData.id }).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from('tweets').select('*', { count:'exact', head:true }).eq('author_id', profileData.id),
      ])

      setFollowersCount(fc ?? 0)
      setFollowingCount(fgc ?? 0)
      setInitialFollowing(!!followRow)
      setTweetCount(tc ?? 0)
      setLoading(false)
    })()
  }, [username])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid var(--accent)', borderTopColor:'transparent', animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--muted)' }}>
      <p style={{ fontSize:40, marginBottom:12 }}>🤷</p>
      <p style={{ fontWeight:800, fontSize:16 }}>ユーザーが見つからないよ</p>
      <Link href="/" style={{ display:'inline-block', marginTop:16, color:'var(--accent)', fontWeight:700 }}>← ホームへ</Link>
    </div>
  )

  const isOwn = currentUserId === profile.id
  const letter = (profile.display_name ?? profile.username)[0].toUpperCase()

  return (
    <>
      {/* サブヘッダー */}
      <header style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--line)', position:'sticky', top:0, zIndex:40, background:'rgba(255,250,253,.9)', backdropFilter:'blur(14px)' }}>
        <Link href="/" style={{ width:36, height:36, borderRadius:'50%', background:'var(--chip)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', color:'var(--muted)', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div>
          <p style={{ fontWeight:800, fontSize:17, color:'var(--text)', lineHeight:1.2 }}>{profile.display_name ?? profile.username}</p>
          <p style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>{tweetCount} 投稿</p>
        </div>
      </header>

      {/* バナー */}
      <div style={{ position:'relative', height:124, background:'var(--grad-banner)', overflow:'hidden' }}>
        {['12%','55%','80%','35%','68%'].map((left, i) => (
          <span key={i} className="sparkle" style={{ left, top:['20%','60%','30%','80%','10%'][i], '--dur':`${2+i*.3}s`, color:'rgba(255,255,255,.8)', fontSize:16 } as React.CSSProperties}>✦</span>
        ))}
      </div>

      {/* プロフィール情報 */}
      <div style={{ padding:'0 16px 16px', borderBottom:'1px solid var(--line)' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{
            width:88, height:88, borderRadius:'50%', marginTop:-44,
            background:'var(--grad-btn)',
            border:'4px solid var(--card)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:800, fontSize:32,
            boxShadow:'0 8px 24px var(--glow)',
            overflow:'hidden', flexShrink:0,
            position:'relative', zIndex:2,
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name ?? profile.username} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : letter
            }
          </div>
          {isOwn ? (
            <EditProfileButton profile={profile} />
          ) : currentUserId && (
            <FollowButton currentUserId={currentUserId} targetUserId={profile.id} initialFollowing={initialFollowing} />
          )}
        </div>

        <h2 style={{ fontFamily:'Mochiy Pop One', fontSize:21, color:'var(--text)', display:'flex', alignItems:'center', gap:6 }}>
          {profile.display_name ?? profile.username}
          <span style={{ width:19, height:19, borderRadius:'50%', background:'var(--grad-btn)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✦</span>
        </h2>
        <p style={{ color:'var(--muted)', fontSize:14, fontWeight:600, marginTop:2 }}>@{profile.username}</p>

        {profile.bio && <p style={{ fontSize:14, lineHeight:1.65, color:'var(--text)', marginTop:8, whiteSpace:'pre-wrap' }}>{profile.bio}</p>}

        <p style={{ display:'flex', alignItems:'center', gap:5, color:'var(--muted)', fontSize:13, fontWeight:600, marginTop:8 }}>
          📅 {new Date(profile.created_at).toLocaleDateString('ja-JP', { year:'numeric', month:'long' })}からキラキラしてる
        </p>

        <div style={{ display:'flex', gap:16, marginTop:10, fontSize:14 }}>
          <span><strong style={{ color:'var(--text)', fontWeight:800 }}>{followingCount}</strong> <span style={{ color:'var(--muted)' }}>フォロー中</span></span>
          <span><strong style={{ color:'var(--text)', fontWeight:800 }}>{followersCount >= 10000 ? ((followersCount / 10000).toFixed(1) + '万') : followersCount}</strong> <span style={{ color:'var(--muted)' }}>フォロワー</span></span>
        </div>
      </div>

      {/* タブ */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--line)' }}>
        {['投稿','メディア','いいね'].map((t, i) => (
          <button key={t} style={{
            flex:1, padding:'12px 0', background:'none', border:'none', cursor:'pointer',
            fontWeight:700, fontSize:14, fontFamily:'M PLUS Rounded 1c',
            color: i === 0 ? 'var(--text)' : 'var(--muted)',
            borderBottom: i === 0 ? '3px solid var(--accent)' : '3px solid transparent',
          }}>{t}</button>
        ))}
      </div>

      <Timeline currentUserId={currentUserId} profileUserId={profile.id} />

      {currentUserId && <ProfileFAB userId={currentUserId} avatarLetter={letter} avatarUrl={profile.avatar_url} />}
    </>
  )
}
