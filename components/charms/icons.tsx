import { cn } from '@/lib/utils'

/** Line icons from the CHARMS style guide (24px grid, 1.7 stroke). */
const PATHS = {
  residents: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" /></>,
  lot: <path d="M4 11l8-7 8 7v9H4zM10 20v-5h4v5" />,
  dues: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>,
  document: <path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" />,
  violation: <path d="M12 4l9 16H3zM12 10v4M12 17h.01" />,
  meeting: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  announcement: <path d="M4 10v4h3l6 4V6L7 10zM16 9a4 4 0 010 6" />,
  request: <path d="M14 6l4 4-9 9H5v-4z" />,
  map: <><path d="M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>,
  reports: <path d="M5 20V10M12 20V4M19 20v-7" />,
  permit: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4" />,
} as const

export type CharmsIconName = keyof typeof PATHS

export function CharmsIcon({ name, className }: { name: CharmsIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('size-5 shrink-0 fill-none stroke-current', className)}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  )
}
