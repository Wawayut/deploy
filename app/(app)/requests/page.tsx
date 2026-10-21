import type { Metadata } from 'next'
import { RequestsView } from '@/components/records/records-view'

export const metadata: Metadata = { title: 'Service requests' }

export default function RequestsPage() {
  return <RequestsView />
}
