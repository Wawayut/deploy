'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { LogOut, Menu, Moon, Rows3, Rows4, Search, Sun } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Kbd } from '@/components/charms/blocks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ROLE_LABEL } from '@/lib/nav'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { signedOut } from '@/lib/store/auth-slice'
import { densityChanged } from '@/lib/store/ui-slice'
import type { User } from '@/lib/types'
import { NavList } from './sidebar'

const iconBtn =
  'inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand-wash hover:text-foreground'

export function Topbar({ user }: { user: User }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const density = useAppSelector((s) => s.ui.density)
  const { resolvedTheme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const canSearch = user.role !== 'homeowner'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/households?q=${encodeURIComponent(q)}` : '/households')
    searchRef.current?.blur()
  }

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 md:px-6">
      <button type="button" className={`${iconBtn} lg:hidden`} aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
        <Menu className="size-5" />
      </button>
      <Logo className="w-24 lg:hidden" />

      {canSearch && (
        <form role="search" onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-sm md:block lg:ml-0">
          <label htmlFor="global-search" className="sr-only">
            Search households by owner or Blk/Lot
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            ref={searchRef}
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search owner or Blk/Lot"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-16 text-sm placeholder:text-muted-foreground focus-visible:border-brand"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </form>
      )}

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className={`${iconBtn} hidden sm:inline-flex`}
          onClick={() => dispatch(densityChanged(density === 'compact' ? 'comfortable' : 'compact'))}
          aria-label={density === 'compact' ? 'Switch to comfortable rows' : 'Switch to compact rows'}
          title={density === 'compact' ? 'Comfortable rows' : 'Compact rows'}
        >
          {density === 'compact' ? <Rows3 className="size-5" /> : <Rows4 className="size-5" />}
        </button>
        <button
          type="button"
          className={iconBtn}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
        >
          <Sun className="hidden size-5 dark:block" />
          <Moon className="size-5 dark:hidden" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="ml-1 flex min-h-10 items-center gap-2.5 rounded-md px-1.5 hover:bg-brand-wash" aria-label="Account menu" />
            }
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-semibold">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                dispatch(signedOut())
                router.replace('/login')
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <div className="flex h-14 items-center border-b px-5">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Logo className="w-28" />
          </div>
          <NavList role={user.role} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
