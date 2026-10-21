import { cn } from '@/lib/utils'
import { HOUSE_PATH, WORDMARK_PATHS } from './logo-paths'

interface LogoProps {
  className?: string
  /** "brand" = teal word + burgundy house; "reversed" = white on teal surfaces */
  tone?: 'brand' | 'reversed'
}

export function Logo({ className, tone = 'brand' }: LogoProps) {
  const word = tone === 'reversed' ? '#FFFFFF' : 'var(--brand)'
  const house = tone === 'reversed' ? '#FFFFFF' : 'var(--burgundy)'
  return (
    <svg viewBox="0 0 1500 375" role="img" aria-label="CHARMS" className={cn('block h-auto', className)}>
      {WORDMARK_PATHS.map((d, i) => (
        <path key={i} d={d} fillRule="evenodd" style={{ fill: word }} />
      ))}
      <path d={HOUSE_PATH} fillRule="evenodd" style={{ fill: house }} />
    </svg>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="414 0 368 376" role="img" aria-label="CHARMS" className={cn('block', className)}>
      <path d={HOUSE_PATH} fillRule="evenodd" style={{ fill: 'var(--burgundy)' }} />
    </svg>
  )
}
