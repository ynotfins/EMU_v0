"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { 
  Plus, Trash2, GripVertical, Save, Eye, Copy, 
  Type, AtSign, Phone, Calendar, Hash, ChevronDown, 
  CheckSquare, List, FileText, PenTool, X, Edit
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors, iconSizes } from "@/lib/design-tokens"
import type { FormTemplate } from "@/types/domain"

// Field type configuration
const fieldTypes = [
  { type: "text", label: "Text", icon: Type },
  { type: "email", label: "Email", icon: AtSign },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "date", label: "Date", icon: Calendar },
  { type: "number", label: "Number", icon: Hash },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "textarea", label: "Long Text", icon: FileText },
  { type: "signature", label: "Signature", icon: PenTool }
] as const

interface FormBuilderProps {
  template?: FormTemplate
  onSave: (template: Omit<FormTemplate, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onCancel?: () => void
}

export function FormBuilder({ template, onSave, onCancel }: FormBuilderProps) {
  const [name, setName] = useState(template?.name || "")
  const [category, setCategory] = useState(template?.category || "")
  const [description, setDescription] = useState(template?.description || "")
  const [fields, setFields] = useState(template?.fields || [])
  const [sections, setSections] = useState(template?.sections || [
    { id: "default", title: "General Information", description: "", fieldIds: [] }
  ])
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Add new field
  const addField = (type: string) => {
    const fieldConfig = fieldTypes.find(ft => ft.type === type)
    if (!fieldConfig) return

    const newField = {
      id: `field_${Date.now()}`,
      type: type as any,
      label: `New ${fieldConfig.label} Field`,
      required: false,
      placeholder: "",
      options: type === "select" ? ["Option 1", "Option 2"] : undefined
    }

    setFields([...fields, newField])
    
    // Add to default section
    setSections(sections.map(section => 
      section.id === "default" 
        ? { ...section, fieldIds: [...section.fieldIds, newField.id] }
        : section
    ))
  }

  // Update field
  const updateField = (fieldId: string, updates: any) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    setSections(sections.map(section => ({
      ...section,
      fieldIds: section.fieldIds.filter(id => id !== fieldId)
    })))
  }

  // Handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceSection = sections.find(s => s.id === result.source.droppableId)
    const destSection = sections.find(s => s.id === result.destination.droppableId)
    
    if (!sourceSection || !destSection) return

    const sourceFieldIds = Array.from(sourceSection.fieldIds)
    const destFieldIds = sourceSection === destSection 
      ? sourceFieldIds 
      : Array.from(destSection.fieldIds)

    const [movedFieldId] = sourceFieldIds.splice(result.source.index, 1)
    destFieldIds.splice(result.destination.index, 0, movedFieldId)

    setSections(sections.map(section => {
      if (section.id === sourceSection.id) {
        return { ...section, fieldIds: sourceSection === destSection ? destFieldIds : sourceFieldIds }
      }
      if (section.id === destSection.id && sourceSection !== destSection) {
        return { ...section, fieldIds: destFieldIds }
      }
      return section
    }))
  }

  // Handle save
  const handleSave = async () => {
    if (!name || !category) return

    setSaving(true)
    try {
      await onSave({
        name,
        category,
        description,
        isActive: true,
        fields,
        sections,
        usageCount: template?.usageCount || 0,
        lastUsed: template?.lastUsed
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Properties */}
      <div className="lg:col-span-2 space-y-6">
        <Card style={cardStyles.base}>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Form Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Property Damage Assessment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Claims, Inspection, Contract"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of when to use this form..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Builder */}
        <Card style={cardStyles.base}>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              {sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="font-semibold mb-4">{section.title}</h3>
                  <Droppable droppableId={section.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 min-h-[100px]"
                      >
                        {section.fieldIds.map((fieldId, index) => {
                          const field = fields.find(f => f.id === fieldId)
                          if (!field) return null

                          const FieldIcon = fieldTypes.find(ft => ft.type === field.type)?.icon || Type

                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`border rounded-lg p-4 bg-white ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    borderRadius: borderRadius.DEFAULT
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-1 text-gray-400 hover:text-gray-600 cursor-move"
                                    >
                                      <GripVertical className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1">
                                      {editingField === field.id ? (
                                        <div className="space-y-3">
                                          <Input
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            placeholder="Field label"
                                            className="font-medium"
                                          />
                                          <Input
                                            value={field.placeholder || ""}
                                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                            placeholder="Placeholder text"
                                          />
                                          {field.type === "select" && (
                                            <div className="space-y-2">
                                              <Label>Options (one per line)</Label>
                                              <Textarea
                                                value={field.options?.join("\n") || ""}
                                                onChange={(e) => updateField(field.id, { 
                                                  options: e.target.value.split("\n").filter(o => o.trim()) 
                                                })}
                                                rows={3}
                                              />
                                            </div>
                                          )}
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                              <Switch
                                                id={`required-${field.id}`}
                                                checked={field.required}
                                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                              />
                                              <Label htmlFor={`required-${field.id}`}>Required</Label>
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={() => setEditingField(null)}
                                            >
                                              Done
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <FieldIcon className="h-5 w-5 text-gray-400" />
                                            <div>
                                              <p className="font-medium">{field.label}</p>
                                              {field.placeholder && (
                                                <p className="text-sm text-gray-500">{field.placeholder}</p>
                                              )}
                                            </div>
                                            {field.required && (
                                              <Badge variant="secondary" className="text-xs">
                                                Required
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingField(field.id)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteField(field.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </CardContent>
        </Card>
      </div>

      {/* Field Types Palette */}
      <div className="space-y-6">
        <Card style={cardStyles.base}>
          <CardHeader>
            <CardTitle>Field Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {fieldTypes.map((fieldType) => {
                const Icon = fieldType.icon
                return (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    className="justify-start"
                    onClick={() => addField(fieldType.type)}
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {fieldType.label}
                    <Plus className="h-4 w-4 ml-auto" />
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card style={cardStyles.base}>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!name || !category || fields.length === 0 || saving}
              style={{ borderRadius: borderRadius.DEFAULT }}
            >
              {saving ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={fields.length === 0}
              style={{ borderRadius: borderRadius.DEFAULT }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Form
            </Button>
            {onCancel && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={onCancel}
                style={{ borderRadius: borderRadius.DEFAULT }}
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
