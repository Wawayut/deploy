import type {
  Announcement,
  DuesStatus,
  Household,
  Invoice,
  Payment,
  Resident,
  ServiceRequest,
  User,
  Violation,
} from '@/lib/types'

/**
 * In-memory mock database for the midterm build. Route handlers in app/api read
 * and write these arrays, so the response shapes match the planned REST API.
 * Data resets whenever the dev server restarts.
 */

const MONTHLY_DUES = 1200

const OWNERS = [
  'Maria Santos', 'Jose Dela Cruz', 'Ana Reyes', 'Carlo Mendoza', 'Liza Bautista',
  'Ramon Villanueva', 'Grace Tan', 'Paolo Garcia', 'Rowena Aquino', 'Edgar Ramos',
  'Kristine Flores', 'Arnel Castillo', 'Joy Navarro', 'Dennis Morales', 'Celia Torres',
  'Mark Lim', 'Teresa Gonzales', 'Bryan Ocampo', 'Nina Valdez', 'Felipe Cruz',
  'Irene Soriano', 'Victor Pascual', 'Sheila Domingo', 'Noel Fernandez', 'Pia Salazar',
  'Rodel Manalo', 'Cynthia Lopez', 'Gerald Rivera', 'Mae Panganiban', 'Allan De Leon',
  'Hazel Robles', 'Jun Mercado', 'Lorna Santiago', 'Ricky Javier', 'Elena Medina',
  'Oscar Bernardo', 'Trixie Uy', 'Benjie Hernandez', 'Marites Galang', 'Samuel Co',
]

const BLOCKS = [4, 4, 4, 7, 7, 7, 9, 9, 9, 12]

function pad(n: number, size = 4) {
  return String(n).padStart(size, '0')
}

function statusFor(index: number): { status: DuesStatus; balance: number } {
  if (index === 2 || index % 9 === 4) return { status: 'overdue', balance: MONTHLY_DUES * (4 + (index % 3)) + (index % 2) * 500 }
  if (index % 11 === 7) return { status: 'overdue', balance: MONTHLY_DUES * 3 }
  if (index === 3 || index % 13 === 5) return { status: 'notice_sent', balance: MONTHLY_DUES * 2 }
  if (index === 1 || index % 6 === 1) return { status: 'due_soon', balance: MONTHLY_DUES }
  return { status: 'paid', balance: 0 }
}

function digitsFor(i: number) {
  return `09${17 + (i % 9)}${pad((i * 7919) % 10000000, 7)}`
}

export const households: Household[] = OWNERS.map((ownerName, i) => {
  const { status, balance } = statusFor(i)
  const first = ownerName.split(' ')[0].toLowerCase()
  const last = ownerName.split(' ').slice(-1)[0].toLowerCase()
  return {
    id: `HH-${pad(142 + i * 3)}`,
    block: BLOCKS[i % BLOCKS.length],
    lot: ((i * 7) % 28) + 1,
    ownerName,
    contactNumber: digitsFor(i),
    email: `${first}.${last}@mail.ph`,
    occupants: 2 + (i % 5),
    moveInDate: `${2014 + (i % 12)}-${pad((i % 12) + 1, 2)}-${pad((i % 27) + 1, 2)}`,
    balance,
    duesStatus: status,
    lastPaymentAt: status === 'paid' ? `2026-10-${pad((i % 15) + 1, 2)}` : `2026-0${6 + (i % 3)}-${pad((i % 20) + 1, 2)}`,
  }
})

export const users: User[] = [
  { id: 'u-admin', name: 'Teodoro Ilagan', email: 'admin@charms.ph', role: 'admin', householdId: null },
  { id: 'u-treasurer', name: 'Rosario Dimaculangan', email: 'treasurer@charms.ph', role: 'treasurer', householdId: null },
  { id: 'u-homeowner', name: 'Ana Reyes', email: 'ana.reyes@mail.ph', role: 'homeowner', householdId: households[2].id },
]

/** Demo-only credentials. The Final replaces this with hashed passwords (bcrypt) in the database. */
export const DEMO_PASSWORD = 'charms2026'

const RELATIONS: Resident['relation'][] = ['Spouse', 'Child', 'Child', 'Relative', 'Tenant']

export const residents: Resident[] = households.flatMap((h, i) => {
  const last = h.ownerName.split(' ').slice(-1)[0]
  const list: Resident[] = [
    { id: `R-${pad(i * 10 + 1, 5)}`, householdId: h.id, name: h.ownerName, relation: 'Owner', contactNumber: h.contactNumber },
  ]
  const extras = ['Lourdes', 'Miguel', 'Bea', 'Andres', 'Cora']
  for (let k = 0; k < Math.min(h.occupants - 1, 4); k++) {
    list.push({
      id: `R-${pad(i * 10 + k + 2, 5)}`,
      householdId: h.id,
      name: `${extras[(i + k) % extras.length]} ${last}`,
      relation: RELATIONS[k],
      contactNumber: k === 0 ? digitsFor(i + 40) : null,
    })
  }
  return list
})

const PERIODS = [
  { period: '2026-07', label: 'July 2026', due: '2026-07-15' },
  { period: '2026-08', label: 'August 2026', due: '2026-08-15' },
  { period: '2026-09', label: 'September 2026', due: '2026-09-15' },
  { period: '2026-10', label: 'October 2026', due: '2026-10-31' },
]

export const invoices: Invoice[] = households.flatMap((h) => {
  const unpaidMonths = Math.ceil(h.balance / MONTHLY_DUES)
  return PERIODS.map((p, idx) => {
    const unpaid = idx >= PERIODS.length - unpaidMonths
    let status: DuesStatus = 'paid'
    if (unpaid) {
      status = p.period === '2026-10' ? (h.duesStatus === 'overdue' ? 'overdue' : h.duesStatus) : h.duesStatus === 'notice_sent' ? 'notice_sent' : 'overdue'
    }
    return {
      id: `INV-${p.period.replace('-', '')}-${h.id.slice(3)}`,
      householdId: h.id,
      period: p.period,
      description: `Association dues, ${p.label}`,
      amount: MONTHLY_DUES,
      amountPaid: unpaid ? 0 : MONTHLY_DUES,
      dueDate: p.due,
      status,
    }
  })
})

const METHODS: Payment['method'][] = ['gcash', 'cash', 'bank_transfer', 'check']

export const payments: Payment[] = invoices
  .filter((inv) => inv.status === 'paid')
  .slice(-60)
  .map((inv, i) => ({
    id: `PAY-${pad(3000 + i, 5)}`,
    householdId: inv.householdId,
    invoiceId: inv.id,
    amount: inv.amount,
    method: METHODS[i % METHODS.length],
    reference: `OR-${pad(81200 + i, 6)}`,
    paidAt: `${inv.period}-${pad((i % 14) + 1, 2)}T0${(i % 8) + 1}:15:00+08:00`,
    recordedBy: 'Rosario Dimaculangan',
  }))
  .reverse()

export const serviceRequests: ServiceRequest[] = [
  { id: 'REQ-0418', householdId: households[2].id, category: 'Maintenance', title: 'Streetlight out in front of Lot 3', details: 'The post light has been off for four nights. The road is very dark for children walking home.', priority: 'high', status: 'open', createdAt: '2026-10-19T19:40:00+08:00', assignedTo: null },
  { id: 'REQ-0417', householdId: households[0].id, category: 'Clearance', title: 'Homeowner clearance for bank loan', details: 'Need certificate of good standing for a housing loan application.', priority: 'normal', status: 'in_progress', createdAt: '2026-10-18T10:05:00+08:00', assignedTo: 'Teodoro Ilagan' },
  { id: 'REQ-0416', householdId: households[5].id, category: 'Security', title: 'Unknown vehicle parked overnight near clubhouse', details: 'White van, no sticker, parked since Saturday.', priority: 'high', status: 'in_progress', createdAt: '2026-10-17T22:12:00+08:00', assignedTo: 'Guard post 2' },
  { id: 'REQ-0415', householdId: households[8].id, category: 'Sticker', title: 'Vehicle sticker for second car', details: 'Plate NBC 4821, Toyota Vios, gray.', priority: 'low', status: 'open', createdAt: '2026-10-16T08:30:00+08:00', assignedTo: null },
  { id: 'REQ-0414', householdId: households[2].id, category: 'Maintenance', title: 'Clogged drainage along Block 7 road', details: 'Water stays on the road after rain and is starting to smell.', priority: 'normal', status: 'resolved', createdAt: '2026-10-09T14:00:00+08:00', assignedTo: 'Maintenance crew' },
  { id: 'REQ-0413', householdId: households[12].id, category: 'Other', title: 'Request to use clubhouse for birthday', details: 'November 8, 2pm to 7pm, about 40 guests.', priority: 'low', status: 'resolved', createdAt: '2026-10-07T09:20:00+08:00', assignedTo: 'Teodoro Ilagan' },
  { id: 'REQ-0412', householdId: households[20].id, category: 'Maintenance', title: 'Cracked sidewalk tiles near park', details: 'Trip hazard at the corner of Block 9.', priority: 'normal', status: 'open', createdAt: '2026-10-05T16:45:00+08:00', assignedTo: null },
]

export const violations: Violation[] = [
  { id: 'VIO-0091', householdId: households[2].id, type: 'Unpaid dues over 90 days', description: 'Account has four unpaid billing periods.', fine: 0, status: 'notice_sent', issuedAt: '2026-10-01' },
  { id: 'VIO-0090', householdId: households[13].id, type: 'Illegal parking', description: 'Vehicle parked on the sidewalk in front of Lot 22.', fine: 500, status: 'open', issuedAt: '2026-09-28' },
  { id: 'VIO-0089', householdId: households[7].id, type: 'Construction without permit', description: 'Second floor extension started without board approval.', fine: 2500, status: 'open', issuedAt: '2026-09-21' },
  { id: 'VIO-0088', householdId: households[4].id, type: 'Pet waste', description: 'Repeated reports of dog waste left on the walking path.', fine: 300, status: 'resolved', issuedAt: '2026-09-10' },
  { id: 'VIO-0087', householdId: households[18].id, type: 'Noise after 10 PM', description: 'Karaoke past curfew on two consecutive nights.', fine: 500, status: 'resolved', issuedAt: '2026-08-30' },
]

export const announcements: Announcement[] = [
  { id: 'ANN-0052', title: 'General assembly on November 15', body: 'All homeowners are invited to the annual general assembly at the clubhouse, 9:00 AM. Agenda: 2027 budget, election of three board seats, and the proposed perimeter wall repair. Members in good standing may vote.', audience: 'All residents', author: 'Board of Directors', publishedAt: '2026-10-18T08:00:00+08:00', pinned: true },
  { id: 'ANN-0051', title: 'Water interruption, Block 7', body: 'Maynilad will replace the main valve on Block 7 Road on October 23, 8:00 AM to 5:00 PM. Please store water the night before.', audience: 'Block 7', author: 'Property Office', publishedAt: '2026-10-16T13:30:00+08:00', pinned: false },
  { id: 'ANN-0050', title: 'October dues are due on the 31st', body: 'Pay at the property office or through GCash 0917 555 0142. Send your reference number to the treasurer so your account is updated within one business day.', audience: 'All residents', author: 'Treasurer', publishedAt: '2026-10-01T09:00:00+08:00', pinned: false },
  { id: 'ANN-0049', title: 'Vehicle sticker renewal for 2027', body: 'Renewal opens November 1. Bring your OR/CR and a copy of your latest dues receipt. Accounts with unpaid balances must settle first.', audience: 'All residents', author: 'Property Office', publishedAt: '2026-09-25T10:00:00+08:00', pinned: false },
]

export const collectionsByMonth = [
  { month: 'May', collected: 41200, billed: 48000 },
  { month: 'Jun', collected: 43800, billed: 48000 },
  { month: 'Jul', collected: 42000, billed: 48000 },
  { month: 'Aug', collected: 44400, billed: 48000 },
  { month: 'Sep', collected: 39600, billed: 48000 },
  { month: 'Oct', collected: 31200, billed: 48000 },
]

export function nextId(prefix: string, list: { id: string }[]) {
  const max = list.reduce((m, item) => {
    const n = Number(item.id.split('-').pop())
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `${prefix}-${pad(max + 1)}`
}

export { MONTHLY_DUES }
