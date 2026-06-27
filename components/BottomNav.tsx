'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'none'} stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
)

const SearchIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
  </svg>
)

const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'none'} stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)

const MailIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
  </svg>
)

export default function BottomNav({ username, avatarLetter, avatarUrl }: { username?: string; avatarLetter?: string; avatarUrl?: string | null }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isExplore = pathname === '/explore'
  const isProfile = username ? pathname === `/${username}` : false

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'var(--navbg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: '1px solid var(--line)',
      padding: '12px 14px 24px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 50,
    }}>
      <Link href="/" style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center' }}>
        <HomeIcon active={isHome} />
      </Link>

      <Link href="/explore" style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center' }}>
        <SearchIcon active={isExplore} />
      </Link>

      <Link href="/notifications" style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center', position:'relative' }}>
        <BellIcon active={false} />
        <span style={{
          position:'absolute', top:6, right:6,
          width:9, height:9, borderRadius:'50%',
          background:'var(--accent)',
          border:'1.5px solid var(--card)',
        }}/>
      </Link>

      <Link href="/messages" style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center' }}>
        <MailIcon active={false} />
      </Link>

      {username && (
        <Link href={`/${username}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', minWidth:44, minHeight:44 }}>
          <div style={{
            width:28, height:28, borderRadius:'50%',
            background:'var(--grad-btn)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:800, fontSize:13,
            outline: isProfile ? '2.5px solid var(--accent)' : 'none',
            outlineOffset:2,
            overflow:'hidden',
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt={avatarLetter} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : avatarLetter
            }
          </div>
        </Link>
      )}
    </nav>
  )
}
