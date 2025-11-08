'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function ChaserError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold">Error in Chaser Section</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Something went wrong while loading this page. Please try again or contact support if the issue persists.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button onClick={() => (window.location.href = '/chaser')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
