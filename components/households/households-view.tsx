'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDeferredValue, useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Btn, EmptyState, ErrorState, PageHeader, Panel, TableSkeleton } from '@/components/charms/blocks'
import { SelectInput } from '@/components/charms/field'
import { DuesStatusLabel } from '@/components/charms/status'
import { DataTable, Td, Th, Tr } from '@/components/charms/table'
import { formatDate, formatPeso, lotLabel } from '@/lib/format'
import { useAppSelector } from '@/lib/store'
import { apiErrorOf, useGetHouseholdsQuery } from '@/lib/store/api'
import type { DuesStatus } from '@/lib/types'
import { HouseholdFormDialog } from './household-form-dialog'

const STATUS_OPTIONS: { value: DuesStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'due_soon', label: 'Due soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'notice_sent', label: 'Notice sent' },
]

export function HouseholdsView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const role = useAppSelector((s) => s.auth.user?.role)
  const urlQ = params.get('q') ?? ''
  const [q, setQ] = useState(urlQ)
  const status = (params.get('status') ?? '') as DuesStatus | ''
  const deferredQ = useDeferredValue(q.trim())
  const addOpen = params.get('new') === '1'

  useEffect(() => setQ(urlQ), [urlQ])

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const { data, isFetching, isLoading, error, refetch } = useGetHouseholdsQuery({ q: deferredQ, status })
  const rows = data?.data ?? []
  const totalBalance = rows.reduce((s, h) => s + h.balance, 0)

  return (
    <>
      <PageHeader
        title="Households"
        description="Every lot in the subdivision, its owner, and where their dues stand."
        crumbs={[{ label: 'Records' }, { label: 'Households' }]}
        actions={
          role === 'admin' && (
            <Btn onClick={() => setParam('new', '1')}>
              <Plus className="size-4" aria-hidden="true" />
              Add household
            </Btn>
          )
        }
      />
      <div className="px-4 py-6 md:px-8">
        <Panel>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="hh-search" className="sr-only">
                Search by owner, Blk/Lot or ID
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="hh-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => setParam('q', q.trim() || null)}
                placeholder="Search owner, “Blk 4 Lot 12” or ID"
                className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-brand"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="hh-status" className="sr-only">
                Filter by dues status
              </label>
              <SelectInput id="hh-status" value={status} onChange={(e) => setParam('status', e.target.value || null)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-2 text-[13px] text-muted-foreground" aria-live="polite">
            <span>
              <span className="font-semibold text-foreground">{data?.meta.total ?? '—'}</span> households
            </span>
            <span>
              Outstanding: <span className="font-semibold tabular-nums text-foreground">{formatPeso(totalBalance)}</span>
            </span>
            {isFetching && !isLoading && <span>Updating…</span>}
          </p>

          {error ? (
            <ErrorState message={apiErrorOf(error).message} onRetry={refetch} />
          ) : isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon="residents"
              title={q || status ? 'No households match' : 'No households yet'}
              body={q || status ? 'Try a different name, or clear the status filter.' : 'Add the first lot to start tracking dues.'}
              action={
                (q || status) && (
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setQ('')
                      router.replace(pathname)
                    }}
                  >
                    Clear filters
                  </Btn>
                )
              }
            />
          ) : (
            <DataTable caption="Households">
              <thead>
                <tr>
                  <Th>Owner</Th>
                  <Th>Blk / Lot</Th>
                  <Th className="hidden md:table-cell">Contact</Th>
                  <Th numeric>Balance</Th>
                  <Th>Dues status</Th>
                  <Th className="hidden lg:table-cell">Last payment</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <Tr key={h.id} className="cursor-pointer" onClick={() => router.push(`/households/${h.id}`)}>
                    <Td>
                      <Link href={`/households/${h.id}`} className="font-semibold hover:text-brand hover:underline" onClick={(e) => e.stopPropagation()}>
                        {h.ownerName}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{h.id}</span>
                    </Td>
                    <Td className="whitespace-nowrap">{lotLabel(h.block, h.lot)}</Td>
                    <Td className="hidden whitespace-nowrap tabular-nums text-muted-foreground md:table-cell">{h.contactNumber}</Td>
                    <Td numeric className="font-semibold">
                      {formatPeso(h.balance)}
                    </Td>
                    <Td>
                      <DuesStatusLabel status={h.duesStatus} />
                    </Td>
                    <Td className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">{formatDate(h.lastPaymentAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </Panel>
      </div>
      {role === 'admin' && <HouseholdFormDialog open={addOpen} onOpenChange={(o) => setParam('new', o ? '1' : null)} />}
    </>
  )
}
