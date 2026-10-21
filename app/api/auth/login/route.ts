import { DEMO_PASSWORD, users } from '@/lib/mock/db'
import { fail, ok, tokenFor } from '@/lib/mock/http'
import { hasErrors, validateLogin } from '@/lib/validation'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const input = { email: String(body?.email ?? ''), password: String(body?.password ?? '') }
  const errors = validateLogin(input)
  if (hasErrors(errors)) return fail(422, 'VALIDATION_FAILED', 'Check the highlighted fields.', errors as Record<string, string>)

  const user = users.find((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())
  if (!user || input.password !== DEMO_PASSWORD) {
    return fail(401, 'INVALID_CREDENTIALS', 'That email and password do not match an account.')
  }
  return ok({ data: { token: tokenFor(user), user } })
}
