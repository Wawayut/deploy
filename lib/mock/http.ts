import { NextResponse } from 'next/server'
import { users } from '@/lib/mock/db'
import type { ApiError, Role, User } from '@/lib/types'

export function ok<T>(body: T, status = 200) {
  return NextResponse.json(body, { status })
}

export function fail(status: number, code: string, message: string, fields?: Record<string, string>) {
  const body: ApiError = { error: { code, message, ...(fields ? { fields } : {}) } }
  return NextResponse.json(body, { status })
}

/**
 * Mock bearer token: "mock.<userId>". At the Final this becomes a signed JWT
 * verified with the server secret.
 */
export function tokenFor(user: User) {
  return `mock.${user.id}`
}

export function getUser(request: Request): User | null {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token.startsWith('mock.')) return null
  return users.find((u) => u.id === token.slice(5)) ?? null
}

type Guard = { user: User; error: null } | { user: null; error: NextResponse }

export function requireRole(request: Request, roles: Role[]): Guard {
  const user = getUser(request)
  if (!user) return { user: null, error: fail(401, 'UNAUTHENTICATED', 'Sign in to continue.') }
  if (!roles.includes(user.role)) {
    return { user: null, error: fail(403, 'FORBIDDEN', 'Your role does not have access to this resource.') }
  }
  return { user, error: null }
}

export function paginate<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('perPage') ?? 50) || 50))
  const start = (page - 1) * perPage
  return { data: items.slice(start, start + perPage), meta: { total: items.length, page, perPage } }
}
