'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Btn } from '@/components/charms/blocks'
import { Field, FormErrorBanner, TextInput } from '@/components/charms/field'
import { canAccess, homeFor } from '@/lib/nav'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { apiErrorOf, useLoginMutation } from '@/lib/store/api'
import { signedIn } from '@/lib/store/auth-slice'
import { hasErrors, validateLogin, type FieldErrors, type LoginInput } from '@/lib/validation'

const DEMO = [
  { label: 'Administrator', email: 'admin@charms.ph' },
  { label: 'Treasurer', email: 'treasurer@charms.ph' },
  { label: 'Homeowner', email: 'ana.reyes@mail.ph' },
]

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const dispatch = useAppDispatch()
  const { user, hydrated } = useAppSelector((s) => s.auth)
  const [login, { isLoading }] = useLoginMutation()
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors<keyof LoginInput>>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!hydrated || !user) return
    const next = params.get('next')
    router.replace(next && next.startsWith('/') && canAccess(user.role, next) ? next : homeFor(user.role))
  }, [hydrated, user, params, router])

  function update<K extends keyof LoginInput>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBanner(null)
    const found = validateLogin(values)
    setErrors(found)
    if (hasErrors(found)) {
      const first = Object.keys(found)[0]
      document.getElementById(first)?.focus()
      return
    }
    try {
      const res = await login({ email: values.email.trim(), password: values.password }).unwrap()
      dispatch(signedIn(res.data))
    } catch (err) {
      const { message, fields } = apiErrorOf(err)
      setErrors(fields as FieldErrors<keyof LoginInput>)
      setBanner(message)
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="text-[1.75rem] font-bold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use the account given to you by the HOA office.</p>

      <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" aria-describedby={banner ? 'login-banner' : undefined}>
        <div id="login-banner">
          <FormErrorBanner message={banner} />
        </div>
        <Field id="email" label="Email address" error={errors.email}>
          <TextInput
            id="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="name@mail.ph"
            value={values.email}
            error={errors.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              error={errors.password}
              onChange={(e) => update('password', e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-brand-wash hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Btn type="submit" loading={isLoading} className="mt-2 w-full">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Btn>
      </form>

      <div className="mt-8 rounded-lg border bg-brand-wash/60 p-4">
        <p className="text-[13px] font-semibold">Demo accounts</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Password for all: <code className="rounded-sm bg-card px-1 font-semibold text-foreground">charms2026</code>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setValues({ email: d.email, password: 'charms2026' })
                setErrors({})
                setBanner(null)
              }}
              className="min-h-9 rounded-md border bg-card px-3 text-[13px] font-semibold text-brand hover:border-brand"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
