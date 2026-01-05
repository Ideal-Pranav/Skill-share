import { Suspense } from 'react'
import { ExploreContent } from '@/components/explore/explore-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}
