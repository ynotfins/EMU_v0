'use client';

/**
 * Global Error Boundary
 * 
 * Catches errors at the root level and provides a fallback UI.
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Global error boundary triggered', error, {
      code: 'ErrorBoundary',
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-6">
            An unexpected error has occurred. The error has been logged and we'll look into it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
          <div className="space-x-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
