'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.search)
        .then(() => router.replace('/'))
        .catch(() => router.replace('/auth'))
    } else {
      router.replace('/auth')
    }
  }, [router])

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(170deg,#ff8ec7 0%,#ff4d9d 55%,#c77dff 100%)' }}>
      <div style={{ fontSize:48, marginBottom:16, animation:'spin 1.2s linear infinite' }}>✦</div>
      <p style={{ fontFamily:'Mochiy Pop One', fontSize:20, color:'#fff', letterSpacing:1 }}>ログイン中...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
