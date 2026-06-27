'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectHandler() {
  const router = useRouter()
  useEffect(() => {
    const redirect = sessionStorage.getItem('gh-pages-redirect')
    if (redirect) {
      sessionStorage.removeItem('gh-pages-redirect')
      // basePath '/kira-x' は Next.js が自動で処理するので除去
      const path = redirect.replace(/^\/kira-x/, '') || '/'
      router.replace(path)
    }
  }, [router])
  return null
}
