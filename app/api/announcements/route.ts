import { announcements } from '@/lib/mock/db'
import { fail, getUser, ok, paginate } from '@/lib/mock/http'

export async function GET(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const sorted = [...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt))
  return ok(paginate(sorted, new URL(request.url)))
}
