import type { Metadata } from 'next'
import { ViolationsView } from '@/components/records/records-view'

export const metadata: Metadata = { title: 'Violations' }

export default function ViolationsPage() {
  return <ViolationsView />
}
