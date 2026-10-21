import { nextId, serviceRequests } from '@/lib/mock/db'
import { fail, getUser, ok, paginate } from '@/lib/mock/http'
import type { Priority, ServiceRequest } from '@/lib/types'
import { hasErrors, validateRequest } from '@/lib/validation'

export async function GET(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  let list = user.role === 'homeowner' ? serviceRequests.filter((r) => r.householdId === user.householdId) : serviceRequests
  if (status) list = list.filter((r) => r.status === status)
  return ok(paginate(list, url))
}

export async function POST(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const body = await request.json().catch(() => ({}))
  const input = {
    category: String(body.category ?? ''),
    title: String(body.title ?? ''),
    details: String(body.details ?? ''),
    priority: String(body.priority ?? ''),
  }
  const errors = validateRequest(input)
  if (hasErrors(errors)) return fail(422, 'VALIDATION_FAILED', 'Check the highlighted fields.', errors as Record<string, string>)

  const householdId = user.role === 'homeowner' ? user.householdId : String(body.householdId ?? '')
  if (!householdId) return fail(422, 'VALIDATION_FAILED', 'Choose a household.', { householdId: 'Choose a household.' })

  const item: ServiceRequest = {
    id: nextId('REQ', serviceRequests),
    householdId,
    category: input.category as ServiceRequest['category'],
    title: input.title.trim(),
    details: input.details.trim(),
    priority: input.priority as Priority,
    status: 'open',
    createdAt: new Date().toISOString(),
    assignedTo: null,
  }
  serviceRequests.unshift(item)
  return ok({ data: item }, 201)
}
