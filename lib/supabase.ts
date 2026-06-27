import { createBrowserClient } from '@supabase/ssr'

export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export type Tweet = {
  id: string
  author_id: string
  content: string | null  // リポスト時は null
  retweet_of: string | null
  created_at: string
  profiles: Profile
  likes: { user_id: string }[]
  retweet_source?: Tweet
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
