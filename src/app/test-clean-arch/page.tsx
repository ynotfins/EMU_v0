/**
 * Test Page for Clean Architecture
 * 
 * Simple page to verify the new architecture is working.
 */

'use client';

import { useAuth } from '@presentation/hooks';
import { useIncidents } from '@presentation/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestCleanArchPage() {
  const { user, loading: authLoading } = useAuth();
  const { incidents, loading: incidentsLoading } = useIncidents();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Clean Architecture Test Page</h1>
      
      <div className="grid gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          {authLoading ? (
            <p>Loading auth...</p>
          ) : user ? (
            <div>
              <p>Logged in as: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          ) : (
            <p>Not logged in</p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Incidents</h2>
          {incidentsLoading ? (
            <p>Loading incidents...</p>
          ) : (
            <p>Found {incidents.length} incidents</p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Architecture Info</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Domain Layer: Complete</li>
            <li>✅ Application Layer: Complete</li>
            <li>✅ Infrastructure Layer: 90% Complete</li>
            <li>🔄 Presentation Layer: 60% Complete</li>
          </ul>
        </Card>

        <div>
          <Button asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
