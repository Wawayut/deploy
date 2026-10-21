'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Btn } from '@/components/charms/blocks'
import { Field, FormErrorBanner, SelectInput, TextInput } from '@/components/charms/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPeriod, formatPeso, lotLabel, PAYMENT_METHOD_LABEL, todayIso } from '@/lib/format'
import { apiErrorOf, useGetHouseholdsQuery, useGetInvoicesQuery, useRecordPaymentMutation } from '@/lib/store/api'
import { hasErrors, validatePayment, type FieldErrors, type PaymentInput } from '@/lib/validation'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId?: string
}

export function RecordPaymentDialog({ open, onOpenChange, householdId }: Props) {
  const empty: PaymentInput = { householdId: householdId ?? '', invoiceId: '', amount: '', method: 'cash', reference: '', paidAt: todayIso() }
  const [values, setValues] = useState<PaymentInput>(empty)
  const [errors, setErrors] = useState<FieldErrors<keyof PaymentInput>>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [recordPayment, { isLoading }] = useRecordPaymentMutation()

  const { data: households } = useGetHouseholdsQuery(undefined, { skip: !open || !!householdId })
  const { data: invoices, isFetching: invoicesLoading } = useGetInvoicesQuery(
    { householdId: values.householdId },
    { skip: !open || !values.householdId },
  )
  const unpaid = useMemo(() => (invoices?.data ?? []).filter((i) => i.status !== 'paid'), [invoices])
  const selectedInvoice = unpaid.find((i) => i.id === values.invoiceId)
  const outstanding = selectedInvoice ? selectedInvoice.amount - selectedInvoice.amountPaid : undefined

  function reset() {
    setValues(empty)
    setErrors({})
    setBanner(null)
  }

  function set<K extends keyof PaymentInput>(key: K, value: string) {
    setValues((v) => {
      const next = { ...v, [key]: value }
      if (key === 'householdId') next.invoiceId = ''
      if (key === 'invoiceId') {
        const inv = unpaid.find((i) => i.id === value)
        next.amount = inv ? String(inv.amount - inv.amountPaid) : ''
      }
      return next
    })
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBanner(null)
    const found = validatePayment(values, outstanding)
    setErrors(found)
    if (hasErrors(found)) {
      document.getElementById(`pay-${Object.keys(found)[0]}`)?.focus()
      return
    }
    try {
      const res = await recordPayment({ ...values, reference: values.reference.trim().toUpperCase() }).unwrap()
      toast.success(`${formatPeso(res.data.payment.amount)} recorded`, {
        description: `OR ${res.data.payment.reference} · ${res.data.household.ownerName}. Balance now ${formatPeso(res.data.household.balance)}.`,
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      const { message, fields } = apiErrorOf(err)
      setErrors(fields as FieldErrors<keyof PaymentInput>)
      setBanner(message)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Record payment</DialogTitle>
          <DialogDescription>Log dues received at the office. The household balance updates right away.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormErrorBanner message={banner} />
          {!householdId && (
            <Field id="pay-householdId" label="Household" error={errors.householdId}>
              <SelectInput id="pay-householdId" value={values.householdId} error={errors.householdId} onChange={(e) => set('householdId', e.target.value)}>
                <option value="">Choose a household</option>
                {(households?.data ?? [])
                  .filter((h) => h.balance > 0)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {lotLabel(h.block, h.lot)} · {h.ownerName} ({formatPeso(h.balance)})
                    </option>
                  ))}
              </SelectInput>
            </Field>
          )}
          <Field
            id="pay-invoiceId"
            label="Billing period"
            error={errors.invoiceId}
            hint={values.householdId && !invoicesLoading && unpaid.length === 0 ? 'This household has no unpaid periods.' : undefined}
          >
            <SelectInput
              id="pay-invoiceId"
              value={values.invoiceId}
              error={errors.invoiceId}
              disabled={!values.householdId || invoicesLoading || unpaid.length === 0}
              onChange={(e) => set('invoiceId', e.target.value)}
            >
              <option value="">{invoicesLoading ? 'Loading periods…' : 'Choose a period'}</option>
              {unpaid.map((i) => (
                <option key={i.id} value={i.id}>
                  {formatPeriod(i.period)} · {formatPeso(i.amount - i.amountPaid)} due
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pay-amount" label="Amount received (₱)" error={errors.amount} hint={outstanding !== undefined ? `${formatPeso(outstanding)} still due` : undefined}>
              <TextInput id="pay-amount" inputMode="decimal" value={values.amount} error={errors.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0.00" />
            </Field>
            <Field id="pay-method" label="Method" error={errors.method}>
              <SelectInput id="pay-method" value={values.method} error={errors.method} onChange={(e) => set('method', e.target.value)}>
                {Object.entries(PAYMENT_METHOD_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pay-reference" label="OR / reference no." error={errors.reference}>
              <TextInput id="pay-reference" value={values.reference} error={errors.reference} onChange={(e) => set('reference', e.target.value)} placeholder="OR-018245" autoCapitalize="characters" />
            </Field>
            <Field id="pay-paidAt" label="Date received" error={errors.paidAt}>
              <TextInput id="pay-paidAt" type="date" max={todayIso()} value={values.paidAt} error={errors.paidAt} onChange={(e) => set('paidAt', e.target.value)} />
            </Field>
          </div>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Btn variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Btn>
            <Btn type="submit" loading={isLoading}>
              {isLoading ? 'Recording…' : 'Record payment'}
            </Btn>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
