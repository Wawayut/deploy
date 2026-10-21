'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Btn } from '@/components/charms/blocks'
import { Field, FormErrorBanner, TextInput } from '@/components/charms/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { todayIso } from '@/lib/format'
import { apiErrorOf, useCreateHouseholdMutation } from '@/lib/store/api'
import { hasErrors, normalizeMobile, validateHousehold, type FieldErrors, type HouseholdInput } from '@/lib/validation'

const EMPTY: HouseholdInput = { ownerName: '', block: '', lot: '', contactNumber: '', email: '', occupants: '1', moveInDate: '' }

export function HouseholdFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [createHousehold, { isLoading }] = useCreateHouseholdMutation()
  const [values, setValues] = useState<HouseholdInput>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors<keyof HouseholdInput>>({})
  const [banner, setBanner] = useState<string | null>(null)

  function reset() {
    setValues(EMPTY)
    setErrors({})
    setBanner(null)
  }

  function set<K extends keyof HouseholdInput>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function blurValidate(key: keyof HouseholdInput) {
    const found = validateHousehold(values)
    setErrors((e) => ({ ...e, [key]: found[key] }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBanner(null)
    const found = validateHousehold(values)
    setErrors(found)
    if (hasErrors(found)) {
      document.getElementById(`hh-${Object.keys(found)[0]}`)?.focus()
      return
    }
    try {
      const res = await createHousehold({ ...values, contactNumber: normalizeMobile(values.contactNumber), email: values.email.trim(), ownerName: values.ownerName.trim() }).unwrap()
      toast.success(`Blk ${res.data.block} Lot ${res.data.lot} added`, { description: `${res.data.ownerName} is now on record.` })
      reset()
      onOpenChange(false)
      router.push(`/households/${res.data.id}`)
    } catch (err) {
      const { message, fields } = apiErrorOf(err)
      setErrors(fields as FieldErrors<keyof HouseholdInput>)
      setBanner(message)
    }
  }

  const f = (key: keyof HouseholdInput) => ({
    id: `hh-${key}`,
    value: values[key],
    error: errors[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
    onBlur: () => values[key] && blurValidate(key),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add household</DialogTitle>
          <DialogDescription>Register a lot and its owner. Dues billing starts on the next period.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormErrorBanner message={banner} />
          <Field id="hh-ownerName" label="Owner name" error={errors.ownerName}>
            <TextInput {...f('ownerName')} autoComplete="name" placeholder="Juan Dela Cruz" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="hh-block" label="Block" error={errors.block}>
              <TextInput {...f('block')} inputMode="numeric" placeholder="1–20" />
            </Field>
            <Field id="hh-lot" label="Lot" error={errors.lot}>
              <TextInput {...f('lot')} inputMode="numeric" placeholder="1–40" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="hh-contactNumber" label="Mobile number" error={errors.contactNumber} hint="11 digits, starts with 09">
              <TextInput {...f('contactNumber')} type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" />
            </Field>
            <Field id="hh-email" label="Email" optional error={errors.email}>
              <TextInput {...f('email')} type="email" autoComplete="email" placeholder="name@mail.ph" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field id="hh-occupants" label="Occupants" error={errors.occupants}>
              <TextInput {...f('occupants')} type="number" min={1} max={20} inputMode="numeric" />
            </Field>
            <Field id="hh-moveInDate" label="Move-in date" error={errors.moveInDate}>
              <TextInput {...f('moveInDate')} type="date" max={todayIso()} />
            </Field>
          </div>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Btn variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Btn>
            <Btn type="submit" loading={isLoading}>
              {isLoading ? 'Saving…' : 'Save household'}
            </Btn>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
