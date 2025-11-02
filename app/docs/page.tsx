"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/protected-route"
import manifest from "@/docs/manifest.json"

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EMU Alerts Documentation</h1>
        <p className="text-muted-foreground">Development documentation and project structure overview</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>{manifest.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Version</h3>
                <Badge>{manifest.version}</Badge>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{manifest.routes.length}</p>
                    <p className="text-sm text-muted-foreground">Routes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{manifest.components.length}</p>
                    <p className="text-sm text-muted-foreground">Components</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{manifest.hooks.length}</p>
                    <p className="text-sm text-muted-foreground">Hooks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{manifest.actions.length}</p>
                    <p className="text-sm text-muted-foreground">Actions</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Documentation Files</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <code>/docs/README.md</code> - Project overview and setup
                  </li>
                  <li>
                    <code>/docs/ROUTES.md</code> - Complete route tree
                  </li>
                  <li>
                    <code>/docs/COMPONENTS.md</code> - Component catalog
                  </li>
                  <li>
                    <code>/docs/WIRING.md</code> - Data contracts and Firebase
                  </li>
                  <li>
                    <code>/docs/ENV.md</code> - Environment variables
                  </li>
                  <li>
                    <code>/docs/TESTPLAN.md</code> - Manual testing checklist
                  </li>
                  <li>
                    <code>/docs/EXTENSIONS.md</code> - Firebase Extensions guide
                  </li>
                  <li>
                    <code>/docs/manifest.json</code> - Machine-readable structure
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Routes</CardTitle>
              <CardDescription>All routes in the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manifest.routes.map((route) => (
                  <div key={route.path} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{route.path}</code>
                      {route.params && route.params.length > 0 && <Badge variant="outline">Dynamic</Badge>}
                      {route.query && route.query.length > 0 && <Badge variant="secondary">Query Params</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{route.description}</p>
                    <p className="text-xs text-muted-foreground">
                      File: <code>{route.file}</code>
                    </p>
                    {route.params && route.params.length > 0 && (
                      <p className="text-xs text-muted-foreground">Params: {route.params.join(", ")}</p>
                    )}
                    {route.query && route.query.length > 0 && (
                      <p className="text-xs text-muted-foreground">Query: {route.query.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Components</CardTitle>
              <CardDescription>All custom components with props and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {manifest.components.map((component) => (
                  <div key={component.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{component.name}</h3>
                      <Badge variant="outline">{component.path}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium mb-1">Props:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {Object.entries(component.props).map(([key, value]) => (
                            <li key={key}>
                              <code>{key}</code>: {value as string}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {component.events.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Events:</p>
                          <div className="flex flex-wrap gap-1">
                            {component.events.map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="font-medium mb-1">Used In:</p>
                        <div className="flex flex-wrap gap-1">
                          {component.usedByRoutes.map((route) => (
                            <Badge key={route} variant="outline" className="text-xs">
                              {route}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Hooks</CardTitle>
              <CardDescription>All custom hooks with return types and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manifest.hooks.map((hook) => (
                  <div key={hook.name} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-semibold">{hook.name}</code>
                      <Badge variant="outline">{hook.path}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Returns: <code>{hook.returns}</code>
                    </p>
                    {hook.actions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1">Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {hook.actions.map((action) => (
                            <Badge key={action} variant="secondary" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Action Stubs</CardTitle>
              <CardDescription>All action functions (currently stubs, to be implemented with Firebase)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {manifest.actions.map((action) => (
                  <Badge key={action} variant="outline" className="text-sm">
                    {action}
                  </Badge>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                All actions currently log to console. Replace with Firebase SDK calls in production.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Missing Components / Screens</CardTitle>
          <CardDescription>Features from README not yet implemented</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Search page (Search.png screenshot)</li>
            <li>Notifications page (Notifications.png screenshot)</li>
            <li>Firebase integration (all hooks use mock data)</li>
            <li>Google Maps SDK integration (showing placeholders)</li>
            <li>Push notifications (FCM not yet configured)</li>
            <li>E-signature provider integration</li>
            <li>File upload to Firebase Storage</li>
            <li>Authentication with Firebase Auth</li>
          </ul>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
