import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ListSkeletonProps {
  rows?: number
  className?: string
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
  return (
    <ul
      className={cn(
        'divide-y divide-border overflow-hidden rounded-xl border border-border',
        className,
      )}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-center justify-between gap-3 bg-card px-4 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-44 max-w-[70%]" />
            <Skeleton className="h-3 w-28 max-w-[40%]" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16 hidden sm:block" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  )
}
