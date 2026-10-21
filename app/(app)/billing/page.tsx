import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BillingView } from '@/components/records/records-view'

export const metadata: Metadata = { title: 'Dues & payments' }

export default function BillingPage() {
  return (
    <Suspense>
      <BillingView />
    </Suspense>
  )
}
