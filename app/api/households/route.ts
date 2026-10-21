import { households, nextId, residents } from '@/lib/mock/db'
import { fail, ok, paginate, requireRole } from '@/lib/mock/http'
import type { Household } from '@/lib/types'
import { hasErrors, normalizeMobile, validateHousehold } from '@/lib/validation'

export async function GET(request: Request) {
  const guard = requireRole(request, ['admin', 'treasurer'])
  if (guard.error) return guard.error

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.toLowerCase().trim()
  const status = url.searchParams.get('status')
  let list = households
  if (q) list = list.filter((h) => `${h.id} ${h.ownerName} block ${h.block} lot ${h.lot}`.toLowerCase().includes(q))
  if (status) list = list.filter((h) => h.duesStatus === status)
  return ok(paginate(list, url))
}

export async function POST(request: Request) {
  const guard = requireRole(request, ['admin'])
  if (guard.error) return guard.error

  const body = await request.json().catch(() => ({}))
  const input = {
    ownerName: String(body.ownerName ?? ''),
    block: String(body.block ?? ''),
    lot: String(body.lot ?? ''),
    contactNumber: String(body.contactNumber ?? ''),
    email: String(body.email ?? ''),
    occupants: String(body.occupants ?? ''),
    moveInDate: String(body.moveInDate ?? ''),
  }
  const errors = validateHousehold(input)
  if (hasErrors(errors)) return fail(422, 'VALIDATION_FAILED', 'Check the highlighted fields.', errors as Record<string, string>)

  const taken = households.some((h) => h.block === Number(input.block) && h.lot === Number(input.lot))
  if (taken) {
    return fail(409, 'LOT_TAKEN', 'A household is already registered on this block and lot.', {
      lot: `Block ${input.block}, Lot ${input.lot} already has a household.`,
    })
  }

  const household: Household = {
    id: nextId('HH', households),
    block: Number(input.block),
    lot: Number(input.lot),
    ownerName: input.ownerName.trim(),
    contactNumber: normalizeMobile(input.contactNumber),
    email: input.email.trim(),
    occupants: Number(input.occupants),
    moveInDate: input.moveInDate,
    balance: 0,
    duesStatus: 'paid',
    lastPaymentAt: null,
  }
  households.unshift(household)
  residents.push({
    id: nextId('R', residents),
    householdId: household.id,
    name: household.ownerName,
    relation: 'Owner',
    contactNumber: household.contactNumber,
  })
  return ok({ data: household }, 201)
}
