import { violations } from '@/lib/mock/db'
import { fail, getUser, ok, paginate } from '@/lib/mock/http'

export async function GET(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const url = new URL(request.url)
  const list = user.role === 'homeowner' ? violations.filter((v) => v.householdId === user.householdId) : violations
  return ok(paginate(list, url))
}
