import { serviceRequests } from '@/lib/mock/db'
import { fail, ok, requireRole } from '@/lib/mock/http'
import type { RequestStatus } from '@/lib/types'

const STATUSES: RequestStatus[] = ['open', 'in_progress', 'resolved']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = requireRole(request, ['admin'])
  if (guard.error) return guard.error
  const { id } = await params
  const item = serviceRequests.find((r) => r.id === id)
  if (!item) return fail(404, 'NOT_FOUND', `No request found with ID ${id}.`)

  const body = await request.json().catch(() => ({}))
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return fail(422, 'VALIDATION_FAILED', 'Unknown status.', { status: 'Unknown status.' })
    item.status = body.status
  }
  if (body.assignedTo !== undefined) item.assignedTo = body.assignedTo ? String(body.assignedTo).slice(0, 60) : null
  return ok({ data: item })
}
