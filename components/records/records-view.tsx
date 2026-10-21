'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Btn, EmptyState, ErrorState, PageHeader, Panel, PanelHeader, TableSkeleton } from '@/components/charms/blocks'
import { Field, FormErrorBanner, SelectInput, TextArea, TextInput } from '@/components/charms/field'
import { DuesStatusLabel, PriorityTag, RequestStatusLabel, ViolationStatusLabel } from '@/components/charms/status'
import { DataTable, Td, Th, Tr } from '@/components/charms/table'
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog'
import { formatDate, formatPeriod, formatPeso, lotLabel, PAYMENT_METHOD_LABEL } from '@/lib/format'
import { useAppSelector } from '@/lib/store'
import {
  apiErrorOf,
  useCreateRequestMutation,
  useGetAnnouncementsQuery,
  useGetHouseholdQuery,
  useGetHouseholdsQuery,
  useGetInvoicesQuery,
  useGetPaymentsQuery,
  useGetRequestsQuery,
  useGetViolationsQuery,
  useUpdateRequestMutation,
} from '@/lib/store/api'
import type { RequestStatus } from '@/lib/types'
import { hasErrors, validateRequest, type FieldErrors, type RequestInput } from '@/lib/validation'

export function BillingView() {
  const params = useSearchParams()
  const [recordOpen, setRecordOpen] = useState(params.get('record') === '1')
  const [invoicePage, setInvoicePage] = useState(1)
  const role = useAppSelector((s) => s.auth.user?.role)
  const invoices = useGetInvoicesQuery({ page: invoicePage })
  const payments = useGetPaymentsQuery()
  const invoiceRows = invoices.data?.data ?? []
  const paymentRows = payments.data?.data ?? []
  const invoiceTotal = invoices.data?.meta.total ?? 0
  const invoicePages = Math.max(1, Math.ceil(invoiceTotal / 100))
  const firstInvoice = invoiceTotal === 0 ? 0 : (invoicePage - 1) * 100 + 1
  const lastInvoice = Math.min(invoicePage * 100, invoiceTotal)
  const loading = invoices.isLoading || payments.isLoading
  const error = invoices.error ?? payments.error
  const refetch = () => {
    void invoices.refetch()
    void payments.refetch()
  }
  const balance = invoiceRows.reduce((sum, invoice) => sum + invoice.amount - invoice.amountPaid, 0)

  return (
    <>
      <PageHeader
        title="Dues & payments"
        description="Review billed association dues and payment records."
        crumbs={[{ label: 'Records' }, { label: 'Dues & payments' }]}
        actions={role !== 'homeowner' ? <Btn onClick={() => setRecordOpen(true)}>Record payment</Btn> : undefined}
      />
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        {error ? (
          <Panel><ErrorState message={apiErrorOf(error).message} onRetry={refetch} /></Panel>
        ) : loading ? (
          <Panel><TableSkeleton /></Panel>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Panel className="p-4">
                <p className="text-sm text-muted-foreground">Outstanding on this page</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{formatPeso(balance)}</p>
              </Panel>
              <Panel className="p-4">
                <p className="text-sm text-muted-foreground">Payments recorded</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{payments.data?.meta.total ?? paymentRows.length}</p>
              </Panel>
            </div>
            <Panel>
              <PanelHeader title="Billing periods" />
              {invoiceRows.length === 0 ? (
                <EmptyState icon="dues" title="No billing periods" body="Billing records will appear here when they are issued." />
              ) : (
                <DataTable caption="Billing periods">
                  <thead><tr><Th>Period</Th><Th>Description</Th><Th>Due date</Th><Th numeric>Amount</Th><Th numeric>Paid</Th><Th>Status</Th></tr></thead>
                  <tbody>{invoiceRows.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td className="font-semibold">{formatPeriod(invoice.period)}</Td>
                      <Td>{invoice.description}</Td>
                      <Td>{formatDate(invoice.dueDate)}</Td>
                      <Td numeric>{formatPeso(invoice.amount)}</Td>
                      <Td numeric>{formatPeso(invoice.amountPaid)}</Td>
                      <Td><DuesStatusLabel status={invoice.status} /></Td>
                    </Tr>
                  ))}</tbody>
                </DataTable>
              )}
              {invoiceTotal > 100 && <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">Showing {firstInvoice}–{lastInvoice} of {invoiceTotal} billing periods</p>
                <div className="flex gap-2">
                  <Btn variant="ghost" size="sm" disabled={invoicePage <= 1} onClick={() => setInvoicePage((page) => page - 1)}>Previous</Btn>
                  <Btn variant="ghost" size="sm" disabled={invoicePage >= invoicePages} onClick={() => setInvoicePage((page) => page + 1)}>Next</Btn>
                </div>
              </div>}
            </Panel>
            <Panel>
              <PanelHeader title="Payment history" />
              {paymentRows.length === 0 ? (
                <EmptyState icon="document" title="No payments yet" body="Payments will appear here once recorded." />
              ) : (
                <DataTable caption="Payment history">
                  <thead><tr><Th>Date</Th><Th>Receipt / reference</Th><Th>Method</Th><Th>Billing period</Th><Th numeric>Amount</Th></tr></thead>
                  <tbody>{paymentRows.map((payment) => {
                    const invoice = invoiceRows.find((item) => item.id === payment.invoiceId)
                    return <Tr key={payment.id}>
                      <Td>{formatDate(payment.paidAt)}</Td>
                      <Td className="font-semibold">{payment.reference}</Td>
                      <Td>{PAYMENT_METHOD_LABEL[payment.method]}</Td>
                      <Td>{invoice ? formatPeriod(invoice.period) : payment.invoiceId}</Td>
                      <Td numeric className="font-semibold">{formatPeso(payment.amount)}</Td>
                    </Tr>
                  })}</tbody>
                </DataTable>
              )}
            </Panel>
          </>
        )}
      </div>
      {role !== 'homeowner' && <RecordPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />}
    </>
  )
}

export function RequestsView() {
  const user = useAppSelector((s) => s.auth.user)
  const requests = useGetRequestsQuery()
  const households = useGetHouseholdsQuery(undefined, { skip: user?.role === 'homeowner' })
  const [createRequest, createState] = useCreateRequestMutation()
  const [updateRequest] = useUpdateRequestMutation()
  const [formOpen, setFormOpen] = useState(false)
  const [values, setValues] = useState<RequestInput & { householdId: string }>({
    category: 'Maintenance',
    title: '',
    details: '',
    priority: 'normal',
    householdId: '',
  })
  const [errors, setErrors] = useState<FieldErrors<keyof RequestInput | 'householdId'>>({})
  const [banner, setBanner] = useState<string | null>(null)
  const rows = requests.data?.data ?? []
  const householdById = new Map((households.data?.data ?? []).map((household) => [household.id, household]))

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBanner(null)
    const nextErrors: FieldErrors<keyof RequestInput | 'householdId'> = validateRequest(values)
    if (user?.role !== 'homeowner' && !values.householdId) nextErrors.householdId = 'Choose a household.'
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    try {
      await createRequest({
        category: values.category,
        title: values.title,
        details: values.details,
        priority: values.priority,
        ...(user?.role === 'homeowner' ? {} : { householdId: values.householdId }),
      }).unwrap()
      toast.success('Service request submitted')
      setValues({ category: 'Maintenance', title: '', details: '', priority: 'normal', householdId: '' })
      setErrors({})
      setFormOpen(false)
    } catch (error) {
      const result = apiErrorOf(error)
      setBanner(result.message)
      setErrors(result.fields)
    }
  }

  async function changeStatus(id: string, status: RequestStatus) {
    try {
      await updateRequest({ id, status }).unwrap()
      toast.success('Request status updated')
    } catch (error) {
      toast.error(apiErrorOf(error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Service requests"
        description="Submit requests to the HOA office and follow their progress."
        crumbs={[{ label: 'Records' }, { label: 'Service requests' }]}
        actions={<Btn onClick={() => setFormOpen((open) => !open)}>{formOpen ? 'Close form' : 'New request'}</Btn>}
      />
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        {formOpen && <Panel className="p-4 md:p-6">
          <h2 className="mb-4 text-base font-semibold">Submit a service request</h2>
          <form noValidate onSubmit={submitRequest} className="flex flex-col gap-4">
            <FormErrorBanner message={banner} />
            {user?.role !== 'homeowner' && <Field id="request-householdId" label="Household" error={errors.householdId}>
              <SelectInput id="request-householdId" value={values.householdId} error={errors.householdId} onChange={(event) => update('householdId', event.target.value)}>
                <option value="">Choose a household</option>
                {(households.data?.data ?? []).map((household) => <option key={household.id} value={household.id}>{lotLabel(household.block, household.lot)} · {household.ownerName}</option>)}
              </SelectInput>
              {households.error && <p role="alert" className="mt-1 text-sm text-bad">{apiErrorOf(households.error).message}</p>}
            </Field>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="request-category" label="Category" error={errors.category}>
                <SelectInput id="request-category" value={values.category} error={errors.category} onChange={(event) => update('category', event.target.value)}>
                  {['Maintenance', 'Security', 'Clearance', 'Sticker', 'Other'].map((category) => <option key={category}>{category}</option>)}
                </SelectInput>
              </Field>
              <Field id="request-priority" label="Priority" error={errors.priority}>
                <SelectInput id="request-priority" value={values.priority} error={errors.priority} onChange={(event) => update('priority', event.target.value)}>
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                </SelectInput>
              </Field>
            </div>
            <Field id="request-title" label="Request title" error={errors.title}>
              <TextInput id="request-title" value={values.title} error={errors.title} maxLength={80} onChange={(event) => update('title', event.target.value)} />
            </Field>
            <Field id="request-details" label="Details" error={errors.details}>
              <TextArea id="request-details" value={values.details} error={errors.details} onChange={(event) => update('details', event.target.value)} />
            </Field>
            <div className="flex justify-end"><Btn type="submit" loading={createState.isLoading}>Submit request</Btn></div>
          </form>
        </Panel>}
        <Panel>
          <PanelHeader title="Request list" />
          {requests.error ? <ErrorState message={apiErrorOf(requests.error).message} onRetry={() => void requests.refetch()} /> : requests.isLoading ? <TableSkeleton /> : rows.length === 0 ? (
            <EmptyState icon="request" title="No service requests" body="New and past requests will show up here." />
          ) : (
            <DataTable caption="Service requests">
              <thead><tr><Th>Request</Th><Th>Household</Th><Th>Filed</Th><Th>Priority</Th><Th>Status</Th></tr></thead>
              <tbody>{rows.map((request) => {
                const household = householdById.get(request.householdId)
                return <Tr key={request.id}>
                  <Td><span className="font-semibold">{request.title}</span><span className="block text-xs text-muted-foreground">{request.category} · {request.id}</span><span className="mt-1 block max-w-xl text-xs text-muted-foreground">{request.details}</span></Td>
                  <Td>{household ? `${lotLabel(household.block, household.lot)} · ${household.ownerName}` : request.householdId}</Td>
                  <Td className="whitespace-nowrap">{formatDate(request.createdAt)}</Td>
                  <Td><PriorityTag priority={request.priority} /></Td>
                  <Td>{user?.role === 'admin' ? (
                    <SelectInput id={`request-status-${request.id}`} aria-label={`Status for ${request.title}`} className="min-h-9 min-w-32 text-sm" value={request.status} onChange={(event) => void changeStatus(request.id, event.target.value as RequestStatus)}>
                      <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
                    </SelectInput>
                  ) : <RequestStatusLabel status={request.status} />}</Td>
                </Tr>
              })}</tbody>
            </DataTable>
          )}
        </Panel>
      </div>
    </>
  )
}

export function ViolationsView() {
  const result = useGetViolationsQuery()
  const rows = result.data?.data ?? []
  return (
    <>
      <PageHeader title="Violations" description="Review notices and reported covenant violations." crumbs={[{ label: 'Records' }, { label: 'Violations' }]} />
      <div className="px-4 py-6 md:px-8"><Panel>
        <PanelHeader title="Violation register" />
        {result.error ? <ErrorState message={apiErrorOf(result.error).message} onRetry={() => void result.refetch()} /> : result.isLoading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon="violation" title="No violations" body="There are no violation records to display." />
        ) : (
          <DataTable caption="Violation register">
            <thead><tr><Th>Violation</Th><Th>Household</Th><Th>Issued</Th><Th numeric>Fine</Th><Th>Status</Th></tr></thead>
            <tbody>{rows.map((violation) => <Tr key={violation.id}>
              <Td><span className="font-semibold">{violation.type}</span><span className="block text-xs text-muted-foreground">{violation.description}</span><span className="block text-xs text-muted-foreground">{violation.id}</span></Td>
              <Td>{violation.householdId}</Td><Td>{formatDate(violation.issuedAt)}</Td><Td numeric>{formatPeso(violation.fine)}</Td><Td><ViolationStatusLabel status={violation.status} /></Td>
            </Tr>)}</tbody>
          </DataTable>
        )}
      </Panel></div>
    </>
  )
}

export function AnnouncementsView() {
  const result = useGetAnnouncementsQuery()
  const rows = result.data?.data ?? []
  return (
    <>
      <PageHeader title="Announcements" description="News and updates from your homeowners association." crumbs={[{ label: 'Community' }, { label: 'Announcements' }]} />
      <div className="flex flex-col gap-4 px-4 py-6 md:px-8">
        {result.error ? <Panel><ErrorState message={apiErrorOf(result.error).message} onRetry={() => void result.refetch()} /></Panel> : result.isLoading ? <Panel><TableSkeleton rows={3} cols={2} /></Panel> : rows.length === 0 ? (
          <Panel><EmptyState icon="announcement" title="No announcements yet" body="Association updates will appear here." /></Panel>
        ) : rows.map((announcement) => <Panel key={announcement.id} className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="mb-2 flex flex-wrap items-center gap-2">
              {announcement.pinned && <span className="rounded-sm bg-brand-wash px-2 py-1 text-xs font-semibold text-brand">Pinned</span>}
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{announcement.audience}</span>
            </div><h2 className="text-lg font-bold">{announcement.title}</h2></div>
            <time className="text-sm text-muted-foreground" dateTime={announcement.publishedAt}>{formatDate(announcement.publishedAt)}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{announcement.body}</p>
          <p className="mt-4 text-xs text-muted-foreground">Posted by {announcement.author} · {announcement.id}</p>
        </Panel>)}
      </div>
    </>
  )
}

export function MyHomeView() {
  const user = useAppSelector((s) => s.auth.user)
  const result = useGetHouseholdQuery(user?.householdId ?? '', { skip: !user?.householdId })
  const household = result.data?.data
  return (
    <>
      <PageHeader title="My household" description="Your household profile, dues, and recent activity." crumbs={[{ label: 'Overview' }, { label: 'My household' }]} />
      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        {!user?.householdId ? <Panel><EmptyState icon="lot" title="No household linked" body="Contact the HOA office to link your account to a household." /></Panel> : result.error ? (
          <Panel><ErrorState message={apiErrorOf(result.error).message} onRetry={() => void result.refetch()} /></Panel>
        ) : result.isLoading ? <Panel><TableSkeleton /></Panel> : household ? (
          <>
            <Panel className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-sm text-muted-foreground">{lotLabel(household.block, household.lot)} · {household.id}</p><h2 className="mt-1 text-xl font-bold">{household.ownerName}</h2><p className="mt-1 text-sm text-muted-foreground">{household.contactNumber}{household.email ? ` · ${household.email}` : ''}</p></div>
                <div className="text-left sm:text-right"><p className="text-sm text-muted-foreground">Outstanding balance</p><p className="text-xl font-bold tabular-nums">{formatPeso(household.balance)}</p><DuesStatusLabel status={household.duesStatus} /></div>
              </div>
            </Panel>
            <Panel>
              <PanelHeader title="Residents" />
              <DataTable caption="Household residents"><thead><tr><Th>Name</Th><Th>Relationship</Th><Th>Contact</Th></tr></thead><tbody>
                {household.residents.map((resident) => <Tr key={resident.id}><Td className="font-semibold">{resident.name}</Td><Td>{resident.relation}</Td><Td>{resident.contactNumber ?? '—'}</Td></Tr>)}
              </tbody></DataTable>
            </Panel>
            <Panel>
              <PanelHeader title="Billing periods" />
              {household.invoices.length === 0 ? <EmptyState icon="dues" title="No billing periods" body="Your issued dues will appear here." /> : (
                <DataTable caption="Household billing periods"><thead><tr><Th>Period</Th><Th>Due date</Th><Th numeric>Amount</Th><Th numeric>Paid</Th><Th>Status</Th></tr></thead><tbody>
                  {household.invoices.map((invoice) => <Tr key={invoice.id}><Td className="font-semibold">{formatPeriod(invoice.period)}</Td><Td>{formatDate(invoice.dueDate)}</Td><Td numeric>{formatPeso(invoice.amount)}</Td><Td numeric>{formatPeso(invoice.amountPaid)}</Td><Td><DuesStatusLabel status={invoice.status} /></Td></Tr>)}
                </tbody></DataTable>
              )}
            </Panel>
            <Panel>
              <PanelHeader title="Recent service requests" />
              {household.requests.length === 0 ? <EmptyState icon="request" title="No requests" body="Requests filed for your household will appear here." /> : (
                <DataTable caption="Household service requests"><thead><tr><Th>Request</Th><Th>Filed</Th><Th>Priority</Th><Th>Status</Th></tr></thead><tbody>
                  {household.requests.map((request) => <Tr key={request.id}><Td><span className="font-semibold">{request.title}</span><span className="block text-xs text-muted-foreground">{request.category}</span></Td><Td>{formatDate(request.createdAt)}</Td><Td><PriorityTag priority={request.priority} /></Td><Td><RequestStatusLabel status={request.status} /></Td></Tr>)}
                </tbody></DataTable>
              )}
            </Panel>
          </>
        ) : null}
      </div>
    </>
  )
}
