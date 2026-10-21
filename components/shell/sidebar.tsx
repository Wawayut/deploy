'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/logo'
import { CharmsIcon } from '@/components/charms/icons'
import { NAV } from '@/lib/nav'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { sidebarToggled } from '@/lib/store/ui-slice'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

export function NavList({ role, collapsed = false, onNavigate }: { role: Role; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-4">
      {NAV.map((section) => {
        const items = section.items.filter((i) => i.roles.includes(role))
        if (items.length === 0) return null
        return (
          <div key={section.section}>
            <p className={cn('mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground', collapsed && 'sr-only')}>
              {section.section}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-wash hover:text-foreground',
                        active && 'bg-brand-tint/70 font-semibold text-brand-dark hover:bg-brand-tint/70 dark:text-foreground',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-brand" />}
                      <CharmsIcon name={item.icon} className={cn(active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground')} />
                      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export function Sidebar({ role }: { role: Role }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed)
  const dispatch = useAppDispatch()
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center border-b', collapsed ? 'justify-center' : 'px-5')}>
        <Link href="/" aria-label="CHARMS home">
          {collapsed ? <LogoMark className="h-7 w-7" /> : <Logo className="w-28" />}
        </Link>
      </div>
      <NavList role={role} collapsed={collapsed} />
      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => dispatch(sidebarToggled())}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-brand-wash hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          <span className={cn(collapsed && 'sr-only')}>Collapse</span>
          {!collapsed && <span className="ml-auto text-[11px] font-semibold">[</span>}
        </button>
      </div>
    </aside>
  )
}
