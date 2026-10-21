import { households, invoices, nextId, payments } from '@/lib/mock/db'
import { fail, getUser, ok, paginate, requireRole } from '@/lib/mock/http'
import type { Payment, PaymentMethod } from '@/lib/types'
import { hasErrors, validatePayment } from '@/lib/validation'

export async function GET(request: Request) {
  const user = getUser(request)
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  const url = new URL(request.url)
  const householdId = user.role === 'homeowner' ? user.householdId : url.searchParams.get('householdId')
  const list = householdId ? payments.filter((p) => p.householdId === householdId) : payments
  return ok(paginate(list, url))
}

export async function POST(request: Request) {
  const guard = requireRole(request, ['admin', 'treasurer'])
  if (guard.error) return guard.error

  const body = await request.json().catch(() => ({}))
  const input = {
    householdId: String(body.householdId ?? ''),
    invoiceId: String(body.invoiceId ?? ''),
    amount: String(body.amount ?? ''),
    method: String(body.method ?? ''),
    reference: String(body.reference ?? ''),
    paidAt: String(body.paidAt ?? ''),
  }

  const invoice = invoices.find((i) => i.id === input.invoiceId && i.householdId === input.householdId)
  const outstanding = invoice ? invoice.amount - invoice.amountPaid : undefined
  const errors = validatePayment(input, outstanding)
  if (!invoice && input.invoiceId) errors.invoiceId = 'That billing period does not belong to this household.'
  if (hasErrors(errors)) return fail(422, 'VALIDATION_FAILED', 'Check the highlighted fields.', errors as Record<string, string>)

  if (payments.some((p) => p.reference.toLowerCase() === input.reference.trim().toLowerCase())) {
    return fail(409, 'DUPLICATE_REFERENCE', 'This receipt number was already recorded.', {
      reference: 'This receipt number was already recorded.',
    })
  }

  const amount = Number(input.amount)
  const payment: Payment = {
    id: nextId('PAY', payments),
    householdId: input.householdId,
    invoiceId: input.invoiceId,
    amount,
    method: input.method as PaymentMethod,
    reference: input.reference.trim().toUpperCase(),
    paidAt: new Date(input.paidAt).toISOString(),
    recordedBy: guard.user.name,
  }
  payments.unshift(payment)

  invoice!.amountPaid += amount
  if (invoice!.amountPaid >= invoice!.amount) invoice!.status = 'paid'

  const household = households.find((h) => h.id === input.householdId)!
  household.balance = Math.max(0, household.balance - amount)
  household.lastPaymentAt = payment.paidAt
  const remaining = invoices.filter((i) => i.householdId === household.id && i.status !== 'paid')
  if (remaining.length === 0) household.duesStatus = 'paid'
  else if (remaining.every((i) => i.status === 'due_soon')) household.duesStatus = 'due_soon'

  return ok({ data: { payment, invoice, household } }, 201)
}
