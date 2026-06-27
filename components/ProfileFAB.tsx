'use client'

import { useState } from 'react'
import TweetComposer from './TweetComposer'

export default function ProfileFAB({ userId, avatarLetter, avatarUrl }: { userId: string; avatarLetter: string; avatarUrl?: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 88, right: 'max(16px, calc(50vw - 197px))',
          width: 62, height: 62, borderRadius: '50%',
          background: 'var(--grad-btn)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px var(--glow)',
          animation: 'pulseglow 2.4s ease-in-out infinite',
          zIndex: 40,
          fontSize: 22, color: '#fff',
        }}
      >✦</button>
      {open && (
        <TweetComposer
          userId={userId}
          avatarLetter={avatarLetter}
          avatarUrl={avatarUrl}
          onPosted={() => {}}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
