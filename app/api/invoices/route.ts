import { invoices } from '@/lib/mock/db'
import { fail, getUser, ok, paginate } from '@/lib/mock/http'

export async function GET(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const householdId = user.role === 'homeowner' ? user.householdId : url.searchParams.get('householdId')

  let list = invoices
  if (householdId) list = list.filter((i) => i.householdId === householdId)
  if (status === 'unpaid') list = list.filter((i) => i.status !== 'paid')
  else if (status) list = list.filter((i) => i.status === status)
  list = [...list].sort((a, b) => b.period.localeCompare(a.period) || a.householdId.localeCompare(b.householdId))
  return ok(paginate(list, url))
}
