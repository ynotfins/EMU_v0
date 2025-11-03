"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { FormBuilder } from "@/components/form-builder"
import {
  Search, Plus, FileText, Calendar, Users, BarChart,
  Copy, Trash2, Edit, Eye, CheckCircle, AlertCircle, Clock
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { FormTemplate } from "@/types/domain"

export default function CRMFormsPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all")
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)

  useEffect(() => {
    console.log("[CRM Forms] Loading form templates...")

    const q = query(collection(db, "form_templates"), orderBy("name"))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templatesList: FormTemplate[] = []
        snapshot.forEach((doc) => {
          templatesList.push({
            id: doc.id,
            ...doc.data()
          } as FormTemplate)
        })

        console.log(`[CRM Forms] Loaded ${templatesList.length} templates`)
        setTemplates(templatesList)
        setFilteredTemplates(templatesList)
        setLoading(false)
      },
      (error) => {
        console.error("[CRM Forms] Error loading templates:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Filter templates
  useEffect(() => {
    let filtered = templates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (activeTab === "active") {
      filtered = filtered.filter((template) => template.isActive)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((template) => !template.isActive)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, activeTab])

  // Stats
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    totalFields: templates.reduce((sum, t) => sum + t.fields.length, 0),
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0)
  }

  // Create new template
  const handleCreateTemplate = async (templateData: Omit<FormTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "form_templates"), {
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Template Created",
        description: "Form template has been created successfully",
      })

      setCreatingNew(false)
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      })
    }
  }

  // Update template
  const handleUpdateTemplate = async (templateData: Omit<FormTemplate, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTemplate?.id) return

    try {
      await updateDoc(doc(db, "form_templates", editingTemplate.id), {
        ...templateData,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Template Updated",
        description: "Form template has been updated successfully",
      })

      setEditingTemplate(null)
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      })
    }
  }

  // Toggle template status
  const handleToggleStatus = async (template: FormTemplate) => {
    try {
      await updateDoc(doc(db, "form_templates", template.id), {
        isActive: !template.isActive,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: template.isActive ? "Template Deactivated" : "Template Activated",
        description: `${template.name} is now ${!template.isActive ? "active" : "inactive"}`,
      })
    } catch (error) {
      console.error("Error toggling status:", error)
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive"
      })
    }
  }

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      await deleteDoc(doc(db, "form_templates", templateId))

      toast({
        title: "Template Deleted",
        description: "Form template has been deleted",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading form templates...</p>
        </div>
      </ProtectedRoute>
    )
  }

  // Show form builder if creating or editing
  if (creatingNew || editingTemplate) {
    return (
      <ProtectedRoute>
        <div style={{ padding: spacing['2xl'], maxWidth: "1400px", margin: "0 auto" }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {creatingNew ? "Create Form Template" : "Edit Form Template"}
            </h1>
            <p className="text-gray-600">
              Design reusable forms for claims, inspections, and contracts
            </p>
          </div>

          <FormBuilder
            template={editingTemplate || undefined}
            onSave={creatingNew ? handleCreateTemplate : handleUpdateTemplate}
            onCancel={() => {
              setCreatingNew(false)
              setEditingTemplate(null)
            }}
          />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Form Templates</h1>
            <p className="text-gray-600">
              Create and manage reusable forms for your business processes
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setCreatingNew(true)}
            style={{ 
              borderRadius: borderRadius.md,
              padding: `${spacing.md} ${spacing.xl}`
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Templates</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Fields</p>
                  <p className="text-3xl font-bold">{stats.totalFields}</p>
                </div>
                <BarChart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Usage</p>
                  <p className="text-3xl font-bold">{stats.totalUsage}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.lg }}>
          <CardContent style={{ padding: spacing.lg }}>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates by name, category, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  />
                </div>
              </div>

              {/* Status Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All Templates</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const lastUsed = template.lastUsed 
              ? new Date(template.lastUsed).toLocaleDateString()
              : "Never"

            return (
              <Card 
                key={template.id}
                style={{ 
                  ...cardStyles.base,
                  transition: "all 0.2s"
                }}
                className="hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={template.isActive ? "default" : "secondary"}
                      style={{
                        backgroundColor: template.isActive ? colors.success.light : colors.gray[100],
                        color: template.isActive ? colors.success.DEFAULT : colors.gray[600],
                        border: "none"
                      }}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Category and Fields */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fields</span>
                      <span className="font-medium">{template.fields.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Used</span>
                      <span className="font-medium">{template.usageCount} times</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last used</span>
                      <span className="font-medium">{lastUsed}</span>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(template)}
                      >
                        {template.isActive ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <Card style={{ ...cardStyles.base, textAlign: "center", padding: spacing['3xl'] }}>
            <CardContent className="p-0">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || activeTab !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first form template to get started"}
              </p>
              {!(searchTerm || activeTab !== "all") && (
                <Button size="lg" onClick={() => setCreatingNew(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
