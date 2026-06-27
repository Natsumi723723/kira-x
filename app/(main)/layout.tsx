import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import BottomNav from '@/components/BottomNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const letter = (profile?.display_name ?? profile?.username ?? 'U')[0].toUpperCase()

  return (
    <div style={{ paddingBottom: 80 }}>
      {children}
      <BottomNav username={profile?.username} avatarLetter={letter} avatarUrl={profile?.avatar_url ?? null} />
    </div>
  )
}
