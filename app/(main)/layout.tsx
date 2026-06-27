'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [letter, setLetter] = useState('U')
  const [username, setUsername] = useState<string>()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth'); return }
      const { data: profile } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', user.id).single()
      setLetter((profile?.display_name ?? profile?.username ?? 'U')[0].toUpperCase())
      setUsername(profile?.username ?? undefined)
      setAvatarUrl(profile?.avatar_url ?? null)
      setReady(true)
    })()
  }, [])

  if (!ready) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid var(--accent)', borderTopColor:'transparent', animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ paddingBottom: 80 }}>
      {children}
      <BottomNav username={username} avatarLetter={letter} avatarUrl={avatarUrl} />
    </div>
  )
}
