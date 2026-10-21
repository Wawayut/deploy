import type { Metadata } from 'next'
import { AnnouncementsView } from '@/components/records/records-view'

export const metadata: Metadata = { title: 'Announcements' }

export default function AnnouncementsPage() {
  return <AnnouncementsView />
}
