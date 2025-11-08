'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Something went wrong!
          </h2>
          <p className="text-muted-foreground mb-6">
            An unexpected error has occurred. The error has been logged and we'll look into it.
          </p>
          <div className="space-x-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')} variant="outline">
              Go home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
