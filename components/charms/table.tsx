import { cn } from '@/lib/utils'

export function DataTable({ caption, children, className }: { caption: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

export function Th({ className, numeric, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b bg-brand-wash/60 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, numeric, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        'border-b px-4 py-3 align-middle in-data-[density=compact]:py-1.5',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-brand-wash/50 [&:last-child>td]:border-b-0', className)} {...props} />
}
