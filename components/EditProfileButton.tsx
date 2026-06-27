'use client'

import { useState } from 'react'
import EditProfileModal from './EditProfileModal'

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default function EditProfileButton({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding:'8px 16px', borderRadius:999, border:'2px solid var(--accent)', background:'transparent', color:'var(--accent)', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'M PLUS Rounded 1c' }}
      >
        プロフィールを編集
      </button>
      {open && <EditProfileModal profile={profile} onClose={() => setOpen(false)} />}
    </>
  )
}
