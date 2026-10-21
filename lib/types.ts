export type Role = 'admin' | 'treasurer' | 'homeowner'

export type DuesStatus = 'paid' | 'due_soon' | 'overdue' | 'notice_sent'
export type RequestStatus = 'open' | 'in_progress' | 'resolved'
export type Priority = 'low' | 'normal' | 'high'
export type ViolationStatus = 'open' | 'notice_sent' | 'resolved'
export type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'check'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  householdId: string | null
}

export interface Household {
  id: string
  block: number
  lot: number
  ownerName: string
  contactNumber: string
  email: string
  occupants: number
  moveInDate: string
  balance: number
  duesStatus: DuesStatus
  lastPaymentAt: string | null
}

export interface Resident {
  id: string
  householdId: string
  name: string
  relation: 'Owner' | 'Spouse' | 'Child' | 'Tenant' | 'Relative'
  contactNumber: string | null
}

export interface Invoice {
  id: string
  householdId: string
  period: string
  description: string
  amount: number
  amountPaid: number
  dueDate: string
  status: DuesStatus
}

export interface Payment {
  id: string
  householdId: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference: string
  paidAt: string
  recordedBy: string
}

export interface ServiceRequest {
  id: string
  householdId: string
  category: 'Maintenance' | 'Security' | 'Clearance' | 'Sticker' | 'Other'
  title: string
  details: string
  priority: Priority
  status: RequestStatus
  createdAt: string
  assignedTo: string | null
}

export interface Violation {
  id: string
  householdId: string
  type: string
  description: string
  fine: number
  status: ViolationStatus
  issuedAt: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: 'All residents' | 'Board' | 'Block 4' | 'Block 7' | 'Block 9'
  author: string
  publishedAt: string
  pinned: boolean
}

export interface ActivityItem {
  id: string
  kind: 'payment' | 'request' | 'violation' | 'announcement' | 'household'
  summary: string
  actor: string
  at: string
}

export interface DashboardSummary {
  households: { total: number; newThisYear: number }
  dues: { collected: number; target: number }
  overdue: { accounts: number; over90Days: number }
  requests: { open: number; dueToday: number }
  collectionsByMonth: { month: string; collected: number; billed: number }[]
  activity: ActivityItem[]
}

export interface ApiList<T> {
  data: T[]
  meta: { total: number; page: number; perPage: number }
}

export interface ApiItem<T> {
  data: T
}

export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string> }
}
