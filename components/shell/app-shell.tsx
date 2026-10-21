'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { sidebarToggled } from '@/lib/store/ui-slice'
import { canAccess, homeFor } from '@/lib/nav'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user, hydrated } = useAppSelector((s) => s.auth)
  const density = useAppSelector((s) => s.ui.density)
  const allowed = user ? canAccess(user.role, pathname) : false

  useEffect(() => {
    if (!hydrated) return
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    else if (!allowed) router.replace(homeFor(user.role))
  }, [hydrated, user, allowed, pathname, router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (e.key === '[' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) dispatch(sidebarToggled())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  if (!hydrated || !user || !allowed) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        <span aria-hidden="true" className="mr-2 size-4 animate-spin rounded-full border-2 border-brand border-r-transparent" />
        Checking your session…
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main id="main" data-density={density} className="flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}
