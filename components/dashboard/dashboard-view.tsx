'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { btnClass, EmptyState, ErrorState, PageHeader, Panel, PanelHeader, Skeleton } from '@/components/charms/blocks'
import { CharmsIcon, type CharmsIconName } from '@/components/charms/icons'
import { DuesStatusLabel } from '@/components/charms/status'
import { formatPeso, formatPesoShort, formatRelative, lotLabel } from '@/lib/format'
import { useAppSelector } from '@/lib/store'
import { apiErrorOf, useGetDashboardQuery, useGetHouseholdsQuery } from '@/lib/store/api'
import type { ActivityItem, DashboardSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function DashboardView() {
  const user = useAppSelector((s) => s.auth.user)
  const { data, isLoading, error, refetch } = useGetDashboardQuery()
  const summary = data?.data

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`}
        description="Where the association stands this month: collections, overdue accounts, and what residents are asking for."
        actions={
          <>
            <Link href="/households?new=1" className={btnClass('ghost')}>
              Add household
            </Link>
            <Link href="/billing?record=1" className={btnClass('primary')}>
              Record payment
            </Link>
          </>
        }
      />
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        {error ? (
          <Panel>
            <ErrorState message={apiErrorOf(error).message} onRetry={refetch} />
          </Panel>
        ) : (
          <>
            <StatGrid summary={summary} loading={isLoading} />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <CollectionsChart summary={summary} loading={isLoading} />
              <OverdueList />
            </div>
            <ActivityFeed items={summary?.activity} loading={isLoading} />
          </>
        )}
      </div>
    </>
  )
}

function StatGrid({ summary, loading }: { summary?: DashboardSummary; loading: boolean }) {
  const pct = summary ? Math.round((summary.dues.collected / Math.max(summary.dues.target, 1)) * 100) : 0
  const stats: { label: string; icon: CharmsIconName; value: string; sub: React.ReactNode; href: string; accent?: boolean }[] = summary
    ? [
        {
          label: 'Households',
          icon: 'lot',
          value: summary.households.total.toLocaleString('en-PH'),
          sub: `${summary.households.newThisYear} moved in this year`,
          href: '/households',
        },
        {
          label: 'Dues collected',
          icon: 'dues',
          value: formatPesoShort(summary.dues.collected),
          sub: (
            <span className="flex flex-col gap-1.5">
              <span>
                {pct}% of {formatPesoShort(summary.dues.target)} billed
              </span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-brand-tint" role="presentation">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(pct, 100)}%` }} />
              </span>
            </span>
          ),
          href: '/billing',
        },
        {
          label: 'Overdue accounts',
          icon: 'violation',
          value: String(summary.overdue.accounts),
          sub: `${summary.overdue.over90Days} past 90 days`,
          href: '/households?status=overdue',
          accent: summary.overdue.accounts > 0,
        },
        {
          label: 'Open requests',
          icon: 'request',
          value: String(summary.requests.open),
          sub: `${summary.requests.dueToday} filed in the last 24 hours`,
          href: '/requests',
        },
      ]
    : []

  return (
    <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {loading || !summary
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-3 h-3 w-36" />
            </div>
          ))
        : stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group relative rounded-lg border bg-card p-4 transition-colors hover:border-brand/50"
            >
              {s.accent && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] rounded-t-lg bg-burgundy" />}
              <span className="flex items-center justify-between text-[13px] font-semibold text-muted-foreground">
                {s.label}
                <CharmsIcon name={s.icon} className={cn('size-5', s.accent ? 'text-burgundy' : 'text-brand')} />
              </span>
              <span className="mt-2 block font-heading text-[1.85rem] font-bold leading-none tabular-nums">{s.value}</span>
              <span className="mt-2 block text-[13px] text-muted-foreground">{s.sub}</span>
            </Link>
          ))}
    </section>
  )
}

function CollectionsChart({ summary, loading }: { summary?: DashboardSummary; loading: boolean }) {
  const months = summary?.collectionsByMonth ?? []
  const max = Math.max(1, ...months.map((m) => m.billed))
  return (
    <Panel aria-labelledby="collections-title">
      <PanelHeader
        id="collections-title"
        title="Collections, last 6 months"
        action={
          <span className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-sm bg-brand" /> Collected
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-sm border border-brand/40 bg-brand-tint" /> Billed
            </span>
          </span>
        }
      />
      <div className="p-4">
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <>
            <div aria-hidden="true" className="flex h-56 items-end gap-3 sm:gap-5">
              {months.map((m) => {
                const pct = Math.round((m.collected / Math.max(m.billed, 1)) * 100)
                return (
                  <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{pct}%</span>
                    <div className="relative w-full max-w-14 rounded-t-sm border border-b-0 border-brand/30 bg-brand-tint" style={{ height: `${(m.billed / max) * 85}%` }}>
                      <div className="absolute inset-x-0 bottom-0 rounded-t-sm bg-brand" style={{ height: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{m.month}</span>
                  </div>
                )
              })}
            </div>
            <table className="sr-only">
              <caption>Monthly dues collected versus billed</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Collected</th>
                  <th scope="col">Billed</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month}>
                    <th scope="row">{m.month}</th>
                    <td>{formatPeso(m.collected)}</td>
                    <td>{formatPeso(m.billed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Panel>
  )
}

function OverdueList() {
  const { data, isLoading } = useGetHouseholdsQuery({ status: 'overdue' })
  const rows = [...(data?.data ?? [])].sort((a, b) => b.balance - a.balance).slice(0, 6)
  return (
    <Panel aria-labelledby="overdue-title">
      <PanelHeader
        id="overdue-title"
        title="Largest overdue balances"
        action={
          <Link href="/households?status=overdue" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline">
            See all <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      {isLoading ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="dues" title="No overdue accounts" body="Every household is paid up or within its due date." />
      ) : (
        <ul className="divide-y">
          {rows.map((h) => (
            <li key={h.id}>
              <Link href={`/households/${h.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-wash/50 in-data-[density=compact]:py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{h.ownerName}</span>
                  <span className="block text-xs text-muted-foreground">{lotLabel(h.block, h.lot)}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold tabular-nums">{formatPeso(h.balance)}</span>
                  <DuesStatusLabel status={h.duesStatus} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

const KIND_ICON: Record<ActivityItem['kind'], CharmsIconName> = {
  payment: 'dues',
  request: 'request',
  violation: 'violation',
  announcement: 'announcement',
  household: 'lot',
}

function ActivityFeed({ items, loading }: { items?: ActivityItem[]; loading: boolean }) {
  return (
    <Panel aria-labelledby="activity-title">
      <PanelHeader id="activity-title" title="Recent activity" />
      {loading ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <ol className="divide-y">
          {(items ?? []).map((a) => (
            <li key={`${a.kind}-${a.id}`} className="flex items-start gap-3 px-4 py-3 in-data-[density=compact]:py-2">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-wash text-brand">
                <CharmsIcon name={KIND_ICON[a.kind]} className={cn('size-4', a.kind === 'violation' && 'text-burgundy')} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{a.summary}</span>
                <span className="block text-xs text-muted-foreground">{a.actor}</span>
              </span>
              <time dateTime={a.at} className="shrink-0 text-xs text-muted-foreground">
                {formatRelative(a.at)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}
