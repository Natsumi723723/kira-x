import ProfileClient from './ProfileClient'

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=username`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    )
    const data = await res.json()
    if (Array.isArray(data) && data.length) {
      return data.map((p: { username: string }) => ({ username: p.username }))
    }
  } catch {}
  return [{ username: '_' }]
}

export default function ProfilePage() {
  return <ProfileClient />
}
