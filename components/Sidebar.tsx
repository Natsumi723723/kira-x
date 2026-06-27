'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Search, Bell, User, LogOut, Feather } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/explore', icon: Search, label: '検索' },
  { href: '/notifications', icon: Bell, label: '通知' },
]

export default function Sidebar({ username }: { username?: string }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col px-4 py-6 border-r border-[#222] z-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 px-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#E91E8C' }}>
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="text-xl font-bold tracking-tight">PINK X</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-3 py-3 rounded-full text-white hover:bg-[#111] transition-colors text-lg font-medium"
          >
            <Icon size={22} />
            {label}
          </Link>
        ))}
        {username && (
          <Link
            href={`/${username}`}
            className="flex items-center gap-4 px-3 py-3 rounded-full text-white hover:bg-[#111] transition-colors text-lg font-medium"
          >
            <User size={22} />
            プロフィール
          </Link>
        )}
      </nav>

      {/* Tweet button */}
      <button
        onClick={() => document.getElementById('tweet-composer')?.focus()}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-white transition-opacity hover:opacity-90 mb-4"
        style={{ background: '#E91E8C' }}
      >
        <Feather size={18} />
        ポスト
      </button>

      {/* Sign out */}
      {username && (
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-3 rounded-full text-[#888] hover:bg-[#111] transition-colors text-sm"
        >
          <LogOut size={18} />
          ログアウト
        </button>
      )}
    </aside>
  )
}
