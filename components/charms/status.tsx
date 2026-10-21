import type { DuesStatus, Priority, RequestStatus, ViolationStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tone = 'ok' | 'warn' | 'bad' | 'info'

const TONE_COLOR: Record<Tone, string> = {
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  bad: 'var(--bad)',
  info: 'var(--info)',
}

/** Status is never color-only: each tone has its own glyph shape (style guide rule). */
function Glyph({ tone }: { tone: Tone }) {
  const c = TONE_COLOR[tone]
  const common = { fill: 'none', stroke: c, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] shrink-0">
      {tone === 'ok' && (
        <g {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l3 3 5-6" />
        </g>
      )}
      {tone === 'warn' && (
        <g {...common}>
          <path d="M7 3.5h10M7 20.5h10M8 3.5v4L12 12l-4 4.5v4M16 3.5v4L12 12l4 4.5v4" />
        </g>
      )}
      {tone === 'bad' && (
        <>
          <path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill={c} />
          <path d="M12 7.5v5M12 16h.01" stroke="var(--card)" strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
      {tone === 'info' && (
        <g {...common}>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3.5 7.5 12 13.5l8.5-6" />
        </g>
      )}
    </svg>
  )
}

export function StatusLabel({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-sm', tone === 'bad' ? 'font-semibold' : 'font-medium', className)}>
      <Glyph tone={tone} />
      {children}
    </span>
  )
}

const DUES: Record<DuesStatus, [Tone, string]> = {
  paid: ['ok', 'Paid'],
  due_soon: ['warn', 'Due soon'],
  overdue: ['bad', 'Overdue'],
  notice_sent: ['info', 'Notice sent'],
}
export function DuesStatusLabel({ status }: { status: DuesStatus }) {
  const [tone, label] = DUES[status]
  return <StatusLabel tone={tone}>{label}</StatusLabel>
}

const REQ: Record<RequestStatus, [Tone, string]> = {
  open: ['info', 'Open'],
  in_progress: ['warn', 'In progress'],
  resolved: ['ok', 'Resolved'],
}
export function RequestStatusLabel({ status }: { status: RequestStatus }) {
  const [tone, label] = REQ[status]
  return <StatusLabel tone={tone}>{label}</StatusLabel>
}
export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' }

const VIO: Record<ViolationStatus, [Tone, string]> = {
  open: ['bad', 'Open'],
  notice_sent: ['info', 'Notice sent'],
  resolved: ['ok', 'Resolved'],
}
export function ViolationStatusLabel({ status }: { status: ViolationStatus }) {
  const [tone, label] = VIO[status]
  return <StatusLabel tone={tone}>{label}</StatusLabel>
}

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        priority === 'high' && 'border-bad/40 text-bad',
        priority === 'normal' && 'border-border text-muted-foreground',
        priority === 'low' && 'border-transparent text-muted-foreground',
      )}
    >
      {priority}
    </span>
  )
}
