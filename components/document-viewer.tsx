"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage, auth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  FileText, Download, Eye, Upload, Clock, User, Tag,
  CheckCircle, AlertCircle, Share2, Lock, Trash2, Edit,
  FileImage, FilePdf, File, ChevronRight
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { Document, DocumentStatus } from "@/types/domain"

interface DocumentViewerProps {
  claimId?: string
  userId?: string
  onSelect?: (document: Document) => void
}

// File type icons
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("image")) return FileImage
  if (mimeType.includes("pdf")) return FilePdf
  return File
}

// Status configuration
const statusConfig: Record<DocumentStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: colors.gray[600], bg: colors.gray[100] },
  pending_review: { label: "Pending Review", color: colors.warning.DEFAULT, bg: colors.warning.light },
  approved: { label: "Approved", color: colors.success.DEFAULT, bg: colors.success.light },
  signed: { label: "Signed", color: colors.primary.DEFAULT, bg: colors.primary.light },
  archived: { label: "Archived", color: colors.gray[500], bg: colors.gray[100] }
}

export function DocumentViewer({ claimId, userId, onSelect }: DocumentViewerProps) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "other" as Document["type"],
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (!auth.currentUser) return

    let q
    if (claimId) {
      // Get documents for specific claim
      q = query(
        collection(db, "documents"),
        where("metadata.claimId", "==", claimId),
        orderBy("createdAt", "desc")
      )
    } else if (userId) {
      // Get documents for specific user
      q = query(
        collection(db, "documents"),
        where("owner", "==", userId),
        orderBy("createdAt", "desc")
      )
    } else {
      // Get all accessible documents
      q = query(
        collection(db, "documents"),
        orderBy("createdAt", "desc")
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docsList: Document[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Check permissions
          if (
            data.owner === auth.currentUser?.uid ||
            data.sharedWith?.includes(auth.currentUser?.uid) ||
            data.permissions?.[auth.currentUser?.uid]
          ) {
            docsList.push({
              id: doc.id,
              ...data
            } as Document)
          }
        })

        setDocuments(docsList)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading documents:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [claimId, userId])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return

    if (!uploadForm.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a document title",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      // Upload file to Storage
      const timestamp = Date.now()
      const storageRef = ref(
        storage, 
        `documents/${auth.currentUser.uid}/${timestamp}_${file.name}`
      )
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Create document record
      const newDoc: Omit<Document, "id"> = {
        type: uploadForm.type,
        status: "draft",
        title: uploadForm.title,
        description: uploadForm.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        file: {
          url: downloadURL,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          storageRef: snapshot.ref.fullPath
        },
        metadata: {
          claimId,
          version: 1,
          tags: uploadForm.tags
        },
        owner: auth.currentUser.uid,
        sharedWith: [],
        permissions: {},
        history: [{
          action: "created",
          userId: auth.currentUser.uid,
          timestamp: new Date().toISOString(),
          details: "Document uploaded"
        }]
      }

      await addDoc(collection(db, "documents"), newDoc)

      toast({
        title: "Document Uploaded",
        description: "File has been uploaded successfully",
      })

      // Reset form
      setUploadForm({
        title: "",
        description: "",
        type: "other",
        tags: []
      })
      setShowUpload(false)
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the document",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !uploadForm.tags.includes(tagInput.trim())) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // Update document status
  const handleUpdateStatus = async (docId: string, newStatus: DocumentStatus) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, "documents", docId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [{
          action: "updated",
          userId: auth.currentUser.uid,
          timestamp: new Date().toISOString(),
          details: `Status changed to ${newStatus}`
        }]
      })

      toast({
        title: "Status Updated",
        description: `Document status changed to ${statusConfig[newStatus].label}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              style={{ borderRadius: borderRadius.DEFAULT }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>

        {showUpload && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Document Title *</Label>
                  <Input
                    id="doc-title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Property Damage Photos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <select
                    id="doc-type"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      type: e.target.value as Document["type"] 
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  >
                    <option value="form">Form</option>
                    <option value="photo">Photo</option>
                    <option value="estimate">Estimate</option>
                    <option value="contract">Contract</option>
                    <option value="report">Report</option>
                    <option value="correspondence">Correspondence</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-description">Description</Label>
                <Textarea
                  id="doc-description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the document..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pr-1">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Choose File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading || !uploadForm.title}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p className="text-xs text-gray-500">
                  Accepted formats: Images, PDF, Word documents (Max 10MB)
                </p>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  Uploading document...
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const FileIcon = getFileIcon(doc.file.mimeType)
          const status = statusConfig[doc.status]

          return (
            <Card 
              key={doc.id}
              style={{ 
                ...cardStyles.base,
                cursor: onSelect ? "pointer" : "default"
              }}
              onClick={() => onSelect?.(doc)}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent style={{ padding: spacing.lg }}>
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: colors.gray[100],
                      color: colors.gray[600]
                    }}
                  >
                    <FileIcon className="h-6 w-6" />
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold truncate">{doc.title}</h3>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                      <Badge
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                          border: "none"
                        }}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {auth.currentUser?.uid === doc.owner ? "You" : "Shared"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {doc.metadata.version > 1 && (
                        <span>Version {doc.metadata.version}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {doc.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {doc.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(doc.file.url, "_blank")
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Create download link
                        const a = document.createElement("a")
                        a.href = doc.file.url
                        a.download = doc.file.name
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onSelect && (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <Card style={{ ...cardStyles.base, textAlign: "center" }}>
          <CardContent style={{ padding: spacing['2xl'] }}>
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-4">
              Upload your first document to get started
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
