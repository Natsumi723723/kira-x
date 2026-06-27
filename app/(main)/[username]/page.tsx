import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import ProfileClient from './ProfileClient'

export async function generateStaticParams() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.from('profiles').select('username')
    if (data?.length) return data.map((p: { username: string }) => ({ username: p.username }))
  } catch {}
  return []
}

export default function ProfilePage() {
  return <ProfileClient />
}
