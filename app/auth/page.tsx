'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.replace(/[^a-zA-Z0-9_]/g, ''), display_name: displayName || username } },
      })
      if (error) { setError(error.message || 'エラーが発生しました'); setLoading(false); return }
      if (!data.session) { setEmailSent(true); setLoading(false); return }
      router.push('/'); router.refresh()
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('メールアドレスまたはパスワードが違います'); setLoading(false); return }
      router.push('/'); router.refresh()
    }
  }

  if (emailSent) {
    return (
      <div style={{ minHeight:'100dvh', background:'linear-gradient(170deg,#ff8ec7 0%,#ff4d9d 55%,#c77dff 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
        <div style={{ background:'rgba(255,255,255,.95)', borderRadius:30, padding:'40px 28px', textAlign:'center', boxShadow:'0 20px 60px rgba(255,46,147,.3)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💌</div>
          <h2 style={{ fontFamily:'Mochiy Pop One', color:'var(--accent)', fontSize:20, marginBottom:8 }}>確認メールを送ったよ✨</h2>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7, marginBottom:20 }}>
            <strong style={{ color:'var(--text)' }}>{email}</strong> に届いたリンクをクリックしてね♡
          </p>
          <button onClick={() => { setEmailSent(false); setMode('login') }} className="grad-btn" style={{ padding:'12px 28px', borderRadius:999, fontSize:14, fontFamily:'M PLUS Rounded 1c' }}>
            ログインする
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh', background:'linear-gradient(170deg,#ff8ec7 0%,#ff4d9d 55%,#c77dff 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px', overflowY:'auto' }}>
      {/* スパークル */}
      {['10%','85%','20%','75%'].map((left, i) => (
        <span key={i} className="sparkle" style={{ left, top: ['15%','20%','75%','65%'][i], '--dur': `${2.2+i*.4}s` } as React.CSSProperties}>✦</span>
      ))}

      {/* ロゴ */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <h1 style={{ fontFamily:'Mochiy Pop One', fontSize:48, color:'#fff', textShadow:'0 4px 20px rgba(255,46,147,.5)', letterSpacing:2 }}>kira ✦</h1>
        <p style={{ color:'rgba(255,255,255,.9)', fontSize:14, fontWeight:700, marginTop:4 }}>かわいいをつぶやこう♡ はじめよ✨</p>
      </div>

      {/* フォームカード */}
      <div style={{ background:'rgba(255,255,255,.96)', borderRadius:30, padding:'28px 24px', width:'100%', maxWidth:360, boxShadow:'0 20px 60px rgba(255,46,147,.3)' }}>
        <h2 style={{ fontFamily:'Mochiy Pop One', color:'var(--accent)', fontSize:18, marginBottom:20, textAlign:'center' }}>
          {mode === 'signup' ? 'アカウントをつくる 🎀' : 'おかえり！ログイン♡'}
        </h2>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mode === 'signup' && (
            <>
              <Field label="なまえ 🐰" type="text" value={displayName} onChange={setDisplayName} placeholder="きらり" />
              <Field label="ユーザーID" type="text" value={username} onChange={v => setUsername(v.replace(/[^a-zA-Z0-9_]/g,''))} placeholder="kirari_kira" prefix="@" />
            </>
          )}
          <Field label="メール 💌" type="email" value={email} onChange={setEmail} placeholder="hello@kira.cute" />
          <Field label="パスワード 🔒" type="password" value={password} onChange={setPassword} placeholder="ひみつのことば" />

          {error && (
            <p style={{ color:'var(--accent)', fontSize:12, fontWeight:700, textAlign:'center', background:'#fff0f6', padding:'8px 12px', borderRadius:10 }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="grad-btn" style={{ padding:15, borderRadius:16, fontSize:16, marginTop:4, fontFamily:'M PLUS Rounded 1c', opacity: loading ? .7 : 1 }}>
            {loading ? '...' : mode === 'signup' ? 'アカウントをつくる ✦' : 'ログイン ✦'}
          </button>
        </form>

        {mode === 'signup' && (
          <p style={{ fontSize:11, color:'var(--muted)', textAlign:'center', marginTop:10, lineHeight:1.7 }}>
            つくると<span style={{ color:'var(--accent)' }}>利用規約</span>と<span style={{ color:'var(--accent)' }}>プライバシー</span>に同意したことになるよ♡
          </p>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0', color:'var(--muted)', fontSize:12 }}>
          <div style={{ flex:1, height:1, background:'var(--line)' }}/>
          または
          <div style={{ flex:1, height:1, background:'var(--line)' }}/>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          {['🍎 Apple','🌈 Google'].map(label => (
            <button key={label} style={{ flex:1, padding:'11px 0', borderRadius:16, background:'rgba(255,255,255,.8)', border:'1.5px solid var(--line)', color:'var(--text)', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'M PLUS Rounded 1c' }}>
              {label}
            </button>
          ))}
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--muted)' }}>
          {mode === 'signup' ? 'もうアカウントある？' : 'アカウントない？'}
          <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontWeight:800, textDecoration:'underline', fontSize:13, fontFamily:'M PLUS Rounded 1c', marginLeft:4 }}>
            {mode === 'signup' ? 'ログイン' : '登録'}
          </button>
        </p>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, prefix }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; prefix?: string
}) {
  return (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:800, color:'var(--muted)', marginBottom:4 }}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', background:'#ffeaf5', border:'2px solid #ffd0e8', borderRadius:16, padding:'11px 14px', gap:6 }}>
        {prefix && <span style={{ color:'var(--muted)', fontWeight:700 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:'M PLUS Rounded 1c' }}
        />
      </div>
    </div>
  )
}
