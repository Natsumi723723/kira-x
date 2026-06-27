'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('画像は5MB以下にしてね'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function save() {
    if (!username.trim()) { setError('ユーザーIDは必須だよ'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('ユーザーIDは英数字とアンダースコアのみ使えるよ'); return }
    setLoading(true)
    setUploading(!!avatarFile)
    setError('')

    const supabase = createClient()
    let avatarUrl = profile.avatar_url

    // 画像アップロード
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop() || 'jpg'
      const path = `${profile.id}/avatar.${ext}`
      console.log('[avatar upload] path:', path, 'size:', avatarFile.size, 'type:', avatarFile.type)
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
      if (upErr) {
        console.error('[avatar upload] error:', upErr)
        setError(`画像のアップロードに失敗したよ… (${upErr.message})`)
        setLoading(false)
        setUploading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      console.log('[avatar upload] publicUrl:', publicUrl)
      avatarUrl = publicUrl + '?t=' + Date.now()
    }

    setUploading(false)

    const { error: err } = await supabase.from('profiles').update({
      display_name: displayName.trim() || null,
      username: username.trim(),
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
    }).eq('id', profile.id)

    if (err) {
      setError(err.message.includes('unique') ? 'そのユーザーIDはもう使われてるよ' : '保存に失敗したよ…もう一度試してね')
      setLoading(false)
      return
    }

    router.replace(`/${username.trim()}`)
    router.refresh()
    onClose()
  }

  const letter = (displayName || username || 'U')[0].toUpperCase()

  return (
    <div
      className="composer-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(58,20,48,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="composer-sheet"
        style={{
          width: '100%', maxWidth: 430,
          background: 'var(--card)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          maxHeight: '92dvh', overflowY: 'auto',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid var(--line)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 22, lineHeight: 1, padding: 4 }}>✕</button>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>プロフィールを編集</span>
          <button
            onClick={save}
            disabled={loading}
            className="grad-btn"
            style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontFamily: 'M PLUS Rounded 1c', opacity: loading ? .6 : 1 }}
          >
            {uploading ? 'アップロード中…' : loading ? '保存中…' : '保存'}
          </button>
        </div>

        {/* バナープレビュー */}
        <div style={{ height: 80, background: 'var(--grad-banner)', position: 'relative', overflow: 'hidden' }}>
          {['15%','55%','80%'].map((left, i) => (
            <span key={i} style={{ position: 'absolute', left, top: ['30%','60%','20%'][i], color: 'rgba(255,255,255,.5)', fontSize: 14, pointerEvents: 'none' }}>✦</span>
          ))}
        </div>

        {/* アバター（タップで変更） */}
        <div style={{ padding: '0 16px', marginTop: -32, marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 64 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'var(--grad-btn)',
                border: '3px solid var(--card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 24,
                boxShadow: '0 4px 16px var(--glow)',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
              }}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : letter
              }
              {/* オーバーレイ */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20 }}>📷</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 6 }}>タップして写真を変更</p>
        </div>

        {/* フォーム */}
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="表示名" value={displayName} onChange={setDisplayName} placeholder="kira ✦ ガール" maxLength={50} />
          <Field label="ユーザーID (@)" value={username} onChange={setUsername} placeholder="username" maxLength={30} mono />
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>自己紹介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="ひとこと書いてね✦"
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid var(--line)', borderRadius: 14,
                fontSize: 14, color: 'var(--text)', background: '#fff',
                fontFamily: 'M PLUS Rounded 1c', resize: 'none', outline: 'none',
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{bio.length}/160</p>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ff4466', fontWeight: 700, background: '#fff0f3', borderRadius: 10, padding: '10px 14px' }}>
              ⚠️ {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, maxLength, mono }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; maxLength?: number; mono?: boolean
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%', padding: '12px 14px',
          border: '1.5px solid var(--line)', borderRadius: 14,
          fontSize: 14, color: 'var(--text)', background: '#fff',
          fontFamily: mono ? 'monospace' : 'M PLUS Rounded 1c',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--line)')}
      />
    </div>
  )
}
