import { households, invoices, payments, residents, serviceRequests, violations } from '@/lib/mock/db'
import { fail, getUser, ok } from '@/lib/mock/http'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  if (user.role === 'homeowner' && user.householdId !== id) {
    return fail(403, 'FORBIDDEN', 'You can only view your own household.')
  }

  const household = households.find((h) => h.id === id)
  if (!household) return fail(404, 'NOT_FOUND', `No household found with ID ${id}.`)

  return ok({
    data: {
      ...household,
      residents: residents.filter((r) => r.householdId === id),
      invoices: invoices.filter((i) => i.householdId === id).sort((a, b) => b.period.localeCompare(a.period)),
      payments: payments.filter((p) => p.householdId === id),
      requests: serviceRequests.filter((r) => r.householdId === id),
      violations: violations.filter((v) => v.householdId === id),
    },
  })
}
