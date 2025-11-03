"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DocumentViewer } from "@/components/document-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { spacing, borderRadius, cardStyles } from "@/lib/design-tokens"
import { FileText, FolderOpen, Clock, Share2 } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import type { Document } from "@/types/domain"

export default function CRMDocumentsPage() {
  const { data: profile } = useProfile()
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Document Management</h1>
          <p className="text-gray-600">
            Store, organize, and share documents with version control
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Documents</p>
                  <p className="text-3xl font-bold">156</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">My Documents</p>
                  <p className="text-3xl font-bold">42</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Shared with Me</p>
                  <p className="text-3xl font-bold">28</p>
                </div>
                <Share2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recent</p>
                  <p className="text-3xl font-bold">15</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="my">My Documents</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>
                  View all documents you have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentViewer
                  onSelect={(doc) => setSelectedDocument(doc)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>
                  Documents you've uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentViewer
                  userId={profile?.uid}
                  onSelect={(doc) => setSelectedDocument(doc)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Shared with Me</CardTitle>
                <CardDescription>
                  Documents others have shared with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Shared document filtering coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Your recently accessed documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Recent document tracking coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Categories */}
        <Card style={{ ...cardStyles.base, marginTop: spacing.xl }}>
          <CardHeader>
            <CardTitle>Document Categories</CardTitle>
            <CardDescription>
              Quick access to documents by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: "Forms", count: 23, color: "blue" },
                { type: "Photos", count: 67, color: "green" },
                { type: "Estimates", count: 34, color: "purple" },
                { type: "Contracts", count: 12, color: "orange" },
                { type: "Reports", count: 8, color: "red" },
                { type: "Letters", count: 5, color: "pink" },
                { type: "E-Signs", count: 4, color: "indigo" },
                { type: "Other", count: 3, color: "gray" }
              ].map((category) => (
                <button
                  key={category.type}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{category.type}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${category.color}-500`}
                      style={{ width: `${(category.count / 156) * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
