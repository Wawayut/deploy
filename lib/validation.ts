export type FieldErrors<K extends string = string> = Partial<Record<K, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_RE = /^09\d{9}$/

export function normalizeMobile(value: string) {
  return value.replace(/[\s-]/g, '')
}

export interface LoginInput {
  email: string
  password: string
}

export function validateLogin(input: LoginInput): FieldErrors<keyof LoginInput> {
  const errors: FieldErrors<keyof LoginInput> = {}
  if (!input.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid email, like name@mail.ph.'
  if (!input.password) errors.password = 'Enter your password.'
  else if (input.password.length < 8) errors.password = 'Passwords are at least 8 characters.'
  return errors
}

export interface HouseholdInput {
  ownerName: string
  block: string
  lot: string
  contactNumber: string
  email: string
  occupants: string
  moveInDate: string
}

export function validateHousehold(input: HouseholdInput): FieldErrors<keyof HouseholdInput> {
  const errors: FieldErrors<keyof HouseholdInput> = {}
  const name = input.ownerName.trim()
  if (!name) errors.ownerName = 'Enter the owner name as shown on the lot title.'
  else if (name.length < 3 || !/^[\p{L} .'-]+$/u.test(name)) errors.ownerName = 'Use letters, spaces, periods, hyphens or apostrophes only.'

  const block = Number(input.block)
  if (!input.block) errors.block = 'Enter a block number.'
  else if (!Number.isInteger(block) || block < 1 || block > 20) errors.block = 'Block must be a whole number from 1 to 20.'

  const lot = Number(input.lot)
  if (!input.lot) errors.lot = 'Enter a lot number.'
  else if (!Number.isInteger(lot) || lot < 1 || lot > 40) errors.lot = 'Lot must be a whole number from 1 to 40.'

  const mobile = normalizeMobile(input.contactNumber)
  if (!mobile) errors.contactNumber = 'Enter a mobile number.'
  else if (!MOBILE_RE.test(mobile)) errors.contactNumber = 'Enter an 11-digit mobile number, like 0917 123 4567.'

  if (input.email.trim() && !EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid email, or leave it blank.'

  const occupants = Number(input.occupants)
  if (!input.occupants) errors.occupants = 'Enter the number of occupants.'
  else if (!Number.isInteger(occupants) || occupants < 1 || occupants > 20) errors.occupants = 'Occupants must be from 1 to 20.'

  if (!input.moveInDate) errors.moveInDate = 'Pick the move-in date.'
  else if (new Date(input.moveInDate) > new Date()) errors.moveInDate = 'Move-in date cannot be in the future.'

  return errors
}

export interface PaymentInput {
  householdId: string
  invoiceId: string
  amount: string
  method: string
  reference: string
  paidAt: string
}

export function validatePayment(input: PaymentInput, outstanding?: number): FieldErrors<keyof PaymentInput> {
  const errors: FieldErrors<keyof PaymentInput> = {}
  if (!input.householdId) errors.householdId = 'Choose the household that paid.'
  if (!input.invoiceId) errors.invoiceId = 'Choose which billing period this payment covers.'
  const amount = Number(input.amount)
  if (!input.amount) errors.amount = 'Enter the amount received.'
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Amount must be greater than zero.'
  else if (Math.round(amount * 100) !== amount * 100) errors.amount = 'Use at most two decimal places.'
  else if (outstanding !== undefined && amount > outstanding) errors.amount = `Amount is more than the ₱${outstanding.toLocaleString('en-PH', { minimumFractionDigits: 2 })} still due on this period.`
  if (!['cash', 'gcash', 'bank_transfer', 'check'].includes(input.method)) errors.method = 'Choose a payment method.'
  if (!input.reference.trim()) errors.reference = 'Enter the official receipt or transaction number.'
  else if (!/^[A-Za-z0-9-]{4,24}$/.test(input.reference.trim())) errors.reference = 'Use 4 to 24 letters, numbers or hyphens.'
  if (!input.paidAt) errors.paidAt = 'Pick the date the payment was received.'
  else if (new Date(input.paidAt) > new Date()) errors.paidAt = 'Payment date cannot be in the future.'
  return errors
}

export interface RequestInput {
  category: string
  title: string
  details: string
  priority: string
}

export function validateRequest(input: RequestInput): FieldErrors<keyof RequestInput> {
  const errors: FieldErrors<keyof RequestInput> = {}
  if (!['Maintenance', 'Security', 'Clearance', 'Sticker', 'Other'].includes(input.category)) errors.category = 'Choose a category.'
  if (input.title.trim().length < 6) errors.title = 'Write a short title of at least 6 characters.'
  else if (input.title.trim().length > 80) errors.title = 'Keep the title under 80 characters.'
  if (input.details.trim().length < 15) errors.details = 'Describe the issue in at least 15 characters so the office can act on it.'
  if (!['low', 'normal', 'high'].includes(input.priority)) errors.priority = 'Choose a priority.'
  return errors
}

export function hasErrors(errors: object) {
  return Object.keys(errors).length > 0
}
