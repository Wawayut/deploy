import type { CharmsIconName } from '@/components/charms/icons'
import type { Role } from '@/lib/types'

export interface NavItem {
  href: string
  label: string
  icon: CharmsIconName
  roles: Role[]
  shortcut?: string
}

export const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'reports', roles: ['admin', 'treasurer'], shortcut: 'G D' },
      { href: '/my-home', label: 'My household', icon: 'lot', roles: ['homeowner'], shortcut: 'G H' },
    ],
  },
  {
    section: 'Records',
    items: [
      { href: '/households', label: 'Households', icon: 'residents', roles: ['admin', 'treasurer'], shortcut: 'G R' },
      { href: '/billing', label: 'Dues & payments', icon: 'dues', roles: ['admin', 'treasurer'], shortcut: 'G B' },
      { href: '/requests', label: 'Service requests', icon: 'request', roles: ['admin', 'treasurer', 'homeowner'], shortcut: 'G S' },
      { href: '/violations', label: 'Violations', icon: 'violation', roles: ['admin'] },
    ],
  },
  {
    section: 'Community',
    items: [{ href: '/announcements', label: 'Announcements', icon: 'announcement', roles: ['admin', 'treasurer', 'homeowner'], shortcut: 'G A' }],
  },
]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'HOA Administrator',
  treasurer: 'Treasurer',
  homeowner: 'Homeowner',
}

export const homeFor = (role: Role) => (role === 'homeowner' ? '/my-home' : '/dashboard')

export function canAccess(role: Role, pathname: string) {
  const item = NAV.flatMap((s) => s.items).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
  return item ? item.roles.includes(role) : true
}
