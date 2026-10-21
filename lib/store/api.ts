import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Announcement,
  ApiItem,
  ApiList,
  DashboardSummary,
  DuesStatus,
  Household,
  Invoice,
  Payment,
  RequestStatus,
  Resident,
  ServiceRequest,
  User,
  Violation,
} from '@/lib/types'
import type { HouseholdInput, PaymentInput, RequestInput } from '@/lib/validation'

/**
 * Midterm: points at the Next.js mock routes under /api.
 * Final: set NEXT_PUBLIC_API_URL to the deployed Laravel API; no screen code changes.
 */
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export interface HouseholdDetail extends Household {
  residents: Resident[]
  invoices: Invoice[]
  payments: Payment[]
  requests: ServiceRequest[]
  violations: Violation[]
}

export const charmsApi = createApi({
  reducerPath: 'charmsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Household', 'Invoice', 'Payment', 'Request', 'Dashboard'],
  endpoints: (build) => ({
    login: build.mutation<ApiItem<{ token: string; user: User }>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getDashboard: build.query<ApiItem<DashboardSummary>, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
    getHouseholds: build.query<ApiList<Household>, { q?: string; status?: DuesStatus | '' } | void>({
      query: (args) => ({ url: '/households', params: { perPage: 100, ...(args?.q ? { q: args.q } : {}), ...(args?.status ? { status: args.status } : {}) } }),
      providesTags: ['Household'],
    }),
    getHousehold: build.query<ApiItem<HouseholdDetail>, string>({
      query: (id) => `/households/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Household', id }, 'Invoice', 'Payment', 'Request'],
    }),
    createHousehold: build.mutation<ApiItem<Household>, HouseholdInput>({
      query: (body) => ({ url: '/households', method: 'POST', body }),
      invalidatesTags: ['Household', 'Dashboard'],
    }),
    getInvoices: build.query<ApiList<Invoice>, { householdId?: string; status?: string; page?: number } | void>({
      query: (args) => ({ url: '/invoices', params: { perPage: 100, ...(args ?? {}) } }),
      providesTags: ['Invoice'],
    }),
    getPayments: build.query<ApiList<Payment>, { householdId?: string; page?: number } | void>({
      query: (args) => ({ url: '/payments', params: { perPage: 100, ...(args ?? {}) } }),
      providesTags: ['Payment'],
    }),
    recordPayment: build.mutation<ApiItem<{ payment: Payment; invoice: Invoice; household: Household }>, PaymentInput>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      invalidatesTags: ['Payment', 'Invoice', 'Household', 'Dashboard'],
    }),
    getRequests: build.query<ApiList<ServiceRequest>, { status?: RequestStatus } | void>({
      query: (args) => ({ url: '/requests', params: { perPage: 100, ...(args ?? {}) } }),
      providesTags: ['Request'],
    }),
    createRequest: build.mutation<ApiItem<ServiceRequest>, RequestInput & { householdId?: string }>({
      query: (body) => ({ url: '/requests', method: 'POST', body }),
      invalidatesTags: ['Request', 'Dashboard'],
    }),
    updateRequest: build.mutation<ApiItem<ServiceRequest>, { id: string; status?: RequestStatus; assignedTo?: string | null }>({
      query: ({ id, ...body }) => ({ url: `/requests/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Request', 'Dashboard'],
    }),
    getViolations: build.query<ApiList<Violation>, void>({
      query: () => '/violations',
    }),
    getAnnouncements: build.query<ApiList<Announcement>, void>({
      query: () => '/announcements',
    }),
  }),
})

export const {
  useLoginMutation,
  useGetDashboardQuery,
  useGetHouseholdsQuery,
  useGetHouseholdQuery,
  useCreateHouseholdMutation,
  useGetInvoicesQuery,
  useGetPaymentsQuery,
  useRecordPaymentMutation,
  useGetRequestsQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useGetViolationsQuery,
  useGetAnnouncementsQuery,
} = charmsApi

export function apiErrorOf(error: unknown): { message: string; fields: Record<string, string> } {
  const data = (error as { data?: { error?: { message?: string; fields?: Record<string, string> } } })?.data
  return {
    message: data?.error?.message ?? 'Something went wrong. Check your connection and try again.',
    fields: data?.error?.fields ?? {},
  }
}
