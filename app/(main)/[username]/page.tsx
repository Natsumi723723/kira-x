import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import Timeline from '@/components/Timeline'
import FollowButton from '@/components/FollowButton'
import EditProfileButton from '@/components/EditProfileButton'
import ProfileFAB from '@/components/ProfileFAB'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const [{ count: followersCount }, { count: followingCount }, { data: followRow }] = await Promise.all([
    supabase.from('follows').select('*', { count:'exact', head:true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count:'exact', head:true }).eq('follower_id', profile.id),
    user ? supabase.from('follows').select('*').match({ follower_id: user.id, following_id: profile.id }).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const isOwn = user?.id === profile.id
  const letter = (profile.display_name ?? profile.username)[0].toUpperCase()
  const tweetCount = (await supabase.from('tweets').select('*', { count:'exact', head:true }).eq('author_id', profile.id)).count ?? 0

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
          ) : user && (
            <FollowButton currentUserId={user.id} targetUserId={profile.id} initialFollowing={!!followRow} />
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
          <span><strong style={{ color:'var(--text)', fontWeight:800 }}>{followingCount ?? 0}</strong> <span style={{ color:'var(--muted)' }}>フォロー中</span></span>
          <span><strong style={{ color:'var(--text)', fontWeight:800 }}>{(followersCount ?? 0) >= 10000 ? ((followersCount! / 10000).toFixed(1) + '万') : followersCount}</strong> <span style={{ color:'var(--muted)' }}>フォロワー</span></span>
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

      <Timeline currentUserId={user?.id} profileUserId={profile.id} />

      {user && <ProfileFAB userId={user.id} avatarLetter={letter} avatarUrl={profile.avatar_url} />}
    </>
  )
}
