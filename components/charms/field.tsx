import { cn } from '@/lib/utils'

const control =
  'w-full min-h-11 rounded-md border bg-card px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-brand/50 focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-bad'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}

export function Field({ id, label, error, hint, optional, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="mb-1.5 text-sm font-semibold">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[13px] font-medium text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hint?: string }
export function TextInput({ id, error, hint, className, ...props }: InputProps) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(control, className)}
      {...props}
    />
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { id: string; error?: string; hint?: string }
export function SelectInput({ id, error, hint, className, children, ...props }: SelectProps) {
  return (
    <select
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(control, 'appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6B72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hint?: string }
export function TextArea({ id, error, hint, className, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(control, 'min-h-28 resize-y', className)}
      {...props}
    />
  )
}

export function FormErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-bad/30 bg-burgundy-tint/60 px-3 py-2.5 text-sm text-foreground">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-4 shrink-0">
        <path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="var(--bad)" />
        <path d="M12 7.5v5M12 16h.01" stroke="var(--card)" strokeWidth={1.8} strokeLinecap="round" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
