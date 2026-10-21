import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Logo } from '@/components/brand/logo'
import { LoginForm } from '@/components/auth/login-form'
import { CharmsIcon, type CharmsIconName } from '@/components/charms/icons'

export const metadata: Metadata = { title: 'Sign in' }

const POINTS: { icon: CharmsIconName; title: string; body: string }[] = [
  { icon: 'lot', title: 'Every lot on record', body: 'Owners, occupants and contact details by Blk/Lot.' },
  { icon: 'dues', title: 'Dues without the ledger book', body: 'Bill monthly, record OR numbers, see who is overdue.' },
  { icon: 'request', title: 'Requests that get closed', body: 'Homeowners file; the office assigns and resolves.' },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-primary-foreground lg:flex dark:bg-[#1f4553]">
        <Logo tone="reversed" className="w-36" />
        <div>
          <p className="max-w-sm font-heading text-[1.9rem] font-bold leading-tight">
            Records for the whole subdivision, in one place.
          </p>
          <ul className="mt-8 flex max-w-sm flex-col gap-5">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <CharmsIcon name={p.icon} className="text-white" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{p.title}</span>
                  <span className="block text-sm text-white/75">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/60">CHARMS · Community &amp; HOA Records Management System</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <Logo className="mb-10 w-28 lg:hidden" />
        <div className="flex flex-1 items-center justify-center lg:justify-start lg:pl-[12%]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
