import { Suspense } from 'react'
import { MessagesContent } from '@/components/messages/messages-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
