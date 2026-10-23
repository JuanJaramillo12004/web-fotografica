import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  className?: string
}

export function TableSkeleton({ rows = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center gap-4 px-3 py-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40 max-w-[60%]" />
              <Skeleton className="h-3 w-28 max-w-[40%]" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-16 hidden sm:block" />
            <Skeleton className="h-3 w-20 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
