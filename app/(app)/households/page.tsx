import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HouseholdsView } from '@/components/households/households-view'

export const metadata: Metadata = { title: 'Households' }

export default function HouseholdsPage() {
  return (
    <Suspense>
      <HouseholdsView />
    </Suspense>
  )
}
