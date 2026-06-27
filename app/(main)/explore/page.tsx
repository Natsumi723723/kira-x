'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient, Profile } from '@/lib/supabase'

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searched, setSearched] = useState(false)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20)
    setResults(data ?? [])
    setSearched(true)
  }

  return (
    <>
      <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-[#222] px-4 py-4 z-10">
        <h1 className="text-xl font-bold mb-3">検索</h1>
        <form onSubmit={search} className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-[#111] border border-[#333] rounded-full px-4 py-2 focus-within:border-[#E91E8C] transition-colors">
            <Search size={16} className="text-[#888] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ユーザーを検索"
              className="flex-1 bg-transparent text-white placeholder-[#555] outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-full font-bold text-white text-sm"
            style={{ background: '#E91E8C' }}
          >
            検索
          </button>
        </form>
      </header>

      <div>
        {!searched ? (
          <p className="text-center text-[#555] py-16">ユーザー名や表示名で検索できます</p>
        ) : results.length === 0 ? (
          <p className="text-center text-[#888] py-16">「{query}」に一致するユーザーが見つかりません</p>
        ) : (
          results.map((profile) => (
            <Link
              key={profile.id}
              href={`/${profile.username}`}
              className="flex items-center gap-3 px-4 py-4 border-b border-[#222] hover:bg-[#080808] transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: '#E91E8C' }}>
                {(profile.display_name ?? profile.username)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{profile.display_name ?? profile.username}</p>
                <p className="text-[#888] text-sm">@{profile.username}</p>
                {profile.bio && <p className="text-sm mt-0.5 text-[#aaa]">{profile.bio}</p>}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
