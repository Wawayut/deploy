import { announcements, collectionsByMonth, households, invoices, payments, serviceRequests, violations } from '@/lib/mock/db'
import { ok, requireRole } from '@/lib/mock/http'
import type { ActivityItem, DashboardSummary } from '@/lib/types'

export async function GET(request: Request) {
  const guard = requireRole(request, ['admin', 'treasurer'])
  if (guard.error) return guard.error

  const ownerOf = (id: string) => households.find((h) => h.id === id)?.ownerName ?? id
  const octoberBilled = invoices.filter((i) => i.period === '2026-10')
  const collected = invoices.reduce((sum, i) => sum + i.amountPaid, 0)
  const target = invoices.reduce((sum, i) => sum + i.amount, 0)
  const overdue = households.filter((h) => h.duesStatus === 'overdue')

  const activity: ActivityItem[] = [
    ...payments.slice(0, 5).map((p) => ({
      id: p.id,
      kind: 'payment' as const,
      summary: `₱${p.amount.toLocaleString('en-PH')} received from ${ownerOf(p.householdId)} (${p.householdId})`,
      actor: p.recordedBy,
      at: p.paidAt,
    })),
    ...serviceRequests.slice(0, 4).map((r) => ({
      id: r.id,
      kind: 'request' as const,
      summary: `${r.id} filed: ${r.title}`,
      actor: ownerOf(r.householdId),
      at: r.createdAt,
    })),
    ...violations.slice(0, 2).map((v) => ({
      id: v.id,
      kind: 'violation' as const,
      summary: `${v.id} issued to ${v.householdId}: ${v.type}`,
      actor: 'Property Office',
      at: `${v.issuedAt}T09:00:00+08:00`,
    })),
    ...announcements.slice(0, 2).map((a) => ({
      id: a.id,
      kind: 'announcement' as const,
      summary: `Posted "${a.title}"`,
      actor: a.author,
      at: a.publishedAt,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8)

  const summary: DashboardSummary = {
    households: { total: households.length, newThisYear: households.filter((h) => h.moveInDate.startsWith('2026') || h.moveInDate.startsWith('2025')).length },
    dues: { collected, target },
    overdue: { accounts: overdue.length, over90Days: overdue.filter((h) => h.balance >= 3600).length },
    requests: {
      open: serviceRequests.filter((r) => r.status !== 'resolved').length,
      dueToday: serviceRequests.filter((r) => r.status !== 'resolved' && r.priority === 'high').length,
    },
    collectionsByMonth: collectionsByMonth.map((m) =>
      m.month === 'Oct'
        ? { ...m, collected: octoberBilled.reduce((s, i) => s + i.amountPaid, 0), billed: octoberBilled.reduce((s, i) => s + i.amount, 0) }
        : m,
    ),
    activity,
  }
  return ok({ data: summary })
}
