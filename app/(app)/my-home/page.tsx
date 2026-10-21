import type { Metadata } from 'next'
import { MyHomeView } from '@/components/records/records-view'

export const metadata: Metadata = { title: 'My household' }

export default function MyHomePage() {
  return <MyHomeView />
}
