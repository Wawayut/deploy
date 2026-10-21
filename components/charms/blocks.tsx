import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CharmsIcon, type CharmsIconName } from './icons'

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string
  description?: string
  crumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b bg-card px-4 py-5 md:flex-row md:items-end md:justify-between md:px-8">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-foreground hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-pretty text-[1.6rem] font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-[68ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('rounded-lg border bg-card', className)} {...props}>
      {children}
    </section>
  )
}

export function PanelHeader({ title, action, id }: { title: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <h2 id={id} className="text-[15px] font-semibold">
        {title}
      </h2>
      {action}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: CharmsIconName
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <CharmsIcon name={icon} className="mb-2 size-12 text-brand" />
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-10 text-center">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="mb-2 size-10">
        <path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="var(--bad)" />
        <path d="M12 7.5v5M12 16h.01" stroke="var(--card)" strokeWidth={1.8} strokeLinecap="round" />
      </svg>
      <h3 className="mb-1 text-base font-semibold">Couldn&apos;t load this list</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="min-h-10 rounded-md border px-4 text-sm font-semibold hover:bg-brand-wash">
          Try again
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-sm bg-brand-tint/60', className)} />
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading" className="divide-y">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-6 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 ? 'w-40' : 'w-20')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border bg-background px-1 font-sans text-[11px] font-semibold text-muted-foreground">
      {children}
    </kbd>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-brand text-primary-foreground hover:bg-brand-dark active:translate-y-px',
  secondary: 'border-brand text-brand hover:bg-brand-wash',
  ghost: 'border-border text-foreground hover:bg-brand-wash',
  danger: 'border-bad text-bad hover:bg-burgundy-tint/50',
}

export function btnClass(variant: BtnVariant = 'primary', size: 'md' | 'sm' = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md border border-transparent font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
    size === 'md' ? 'min-h-11 px-4 text-sm' : 'min-h-9 px-3 text-[13px]',
    BTN[variant],
  )
}

export function Btn({
  variant = 'primary',
  size = 'md',
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'md' | 'sm'; loading?: boolean }) {
  return (
    <button
      type="button"
      className={cn(btnClass(variant, size), className)}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  )
}
