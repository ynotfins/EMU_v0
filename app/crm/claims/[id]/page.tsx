"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, Phone, Mail, Building, Calendar, DollarSign,
  FileText, Camera, MessageSquare, Clock, Target, CheckCircle,
  AlertCircle, Edit, Save, X, ChevronRight, MapPin, User
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { Claim, ClaimStage, Document } from "@/types/domain"

const stageConfig: Record<ClaimStage, { label: string; color: string; bg: string; icon: any }> = {
  lead: { label: "Lead", color: colors.gray[600], bg: colors.gray[100], icon: Target },
  assignment: { label: "Assignment", color: colors.primary.DEFAULT, bg: colors.primary.light, icon: User },
  investigation: { label: "Investigation", color: colors.warning.DEFAULT, bg: colors.warning.light, icon: Camera },
  negotiation: { label: "Negotiation", color: "#8B5CF6", bg: "#EDE9FE", icon: MessageSquare },
  settlement: { label: "Settlement", color: colors.success.DEFAULT, bg: colors.success.light, icon: DollarSign },
  closed: { label: "Closed", color: colors.gray[500], bg: colors.gray[100], icon: CheckCircle }
}

export default function ClaimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: profile } = useProfile()
  const { toast } = useToast()
  
  const claimId = params.id as string
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingDamage, setEditingDamage] = useState(false)
  const [damageForm, setDamageForm] = useState({
    estimatedLoss: 0,
    documentedLoss: 0,
    approvedAmount: 0
  })
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    if (!claimId) return

    console.log("[Claim Detail] Loading claim:", claimId)

    const unsubscribe = onSnapshot(
      doc(db, "claims", claimId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Claim
          setClaim({
            id: snapshot.id,
            ...data
          })
          setDamageForm({
            estimatedLoss: data.damage.estimatedLoss || 0,
            documentedLoss: data.damage.documentedLoss || 0,
            approvedAmount: data.damage.approvedAmount || 0
          })
          setLoading(false)
        } else {
          console.error("[Claim Detail] Claim not found")
          setLoading(false)
        }
      },
      (error) => {
        console.error("[Claim Detail] Error loading claim:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [claimId])

  const handleStageChange = async (newStage: ClaimStage) => {
    if (!claim) return

    try {
      const updates: any = {
        stage: newStage,
        updatedAt: new Date().toISOString(),
        [`timeline.${newStage}`]: new Date().toISOString()
      }

      await updateDoc(doc(db, "claims", claim.id), updates)

      toast({
        title: "Stage Updated",
        description: `Claim moved to ${stageConfig[newStage].label}`,
      })
    } catch (error) {
      console.error("Error updating stage:", error)
      toast({
        title: "Error",
        description: "Failed to update claim stage",
        variant: "destructive"
      })
    }
  }

  const handleDamageSave = async () => {
    if (!claim) return

    try {
      await updateDoc(doc(db, "claims", claim.id), {
        "damage.estimatedLoss": damageForm.estimatedLoss,
        "damage.documentedLoss": damageForm.documentedLoss,
        "damage.approvedAmount": damageForm.approvedAmount,
        updatedAt: new Date().toISOString()
      })

      setEditingDamage(false)
      toast({
        title: "Damage Assessment Updated",
        description: "Changes saved successfully",
      })
    } catch (error) {
      console.error("Error updating damage:", error)
      toast({
        title: "Error",
        description: "Failed to update damage assessment",
        variant: "destructive"
      })
    }
  }

  const handleNotesSave = async () => {
    if (!claim || !notes.trim()) return

    setSavingNotes(true)
    try {
      await updateDoc(doc(db, "claims", claim.id), {
        notes: arrayUnion(notes.trim()),
        updatedAt: new Date().toISOString()
      })

      setNotes("")
      toast({
        title: "Note Added",
        description: "Your note has been saved",
      })
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      })
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading claim...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!claim) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Claim not found</h3>
            <Button onClick={() => router.push("/crm/claims")}>
              Back to Claims
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentStage = stageConfig[claim.stage]

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/crm/claims")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Claim #{claim.claimNumber}</h1>
              <p className="text-gray-600">
                Created {new Date(claim.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              style={{
                backgroundColor: currentStage.bg,
                color: currentStage.color,
                border: "none",
                padding: `${spacing.sm} ${spacing.lg}`,
                fontSize: "16px"
              }}
              className="inline-flex items-center gap-2"
            >
              <currentStage.icon className="h-5 w-5" />
              {currentStage.label}
            </Badge>
            {claim.priority === "urgent" && (
              <Badge variant="destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Stage Progress */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.xl }}>
          <CardContent style={{ padding: spacing.lg }}>
            <div className="flex items-center justify-between">
              {Object.entries(stageConfig).map(([stage, config], index) => {
                const Icon = config.icon
                const isActive = claim.stage === stage
                const isPast = Object.keys(stageConfig).indexOf(claim.stage) > index
                const canAdvance = index === Object.keys(stageConfig).indexOf(claim.stage) + 1

                return (
                  <div key={stage} className="flex items-center flex-1">
                    <button
                      onClick={() => canAdvance && handleStageChange(stage as ClaimStage)}
                      disabled={!canAdvance}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                        canAdvance ? "hover:bg-gray-50 cursor-pointer" : ""
                      }`}
                      style={{ opacity: !isActive && !isPast ? 0.5 : 1 }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                        style={{
                          backgroundColor: isActive ? config.bg : isPast ? colors.gray[200] : colors.gray[100],
                          color: isActive ? config.color : isPast ? colors.gray[600] : colors.gray[400]
                        }}
                      >
                        {isPast ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{config.label}</p>
                      {claim.timeline?.[stage as keyof typeof claim.timeline] && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(claim.timeline[stage as keyof typeof claim.timeline] as string).toLocaleDateString()}
                        </p>
                      )}
                    </button>
                    {index < Object.keys(stageConfig).length - 1 && (
                      <ChevronRight className="h-5 w-5 text-gray-300 mx-2 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="damage">Damage</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Summary */}
              <Card style={cardStyles.base}>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{claim.client.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {claim.client.address}, {claim.client.city}, {claim.client.state} {claim.client.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{claim.client.phone}</span>
                  </div>
                  {claim.client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{claim.client.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Insurance Summary */}
              <Card style={cardStyles.base}>
                <CardHeader>
                  <CardTitle className="text-lg">Insurance Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{claim.insurance.company}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Policy #</p>
                      <p className="font-medium">{claim.insurance.policyNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Claim #</p>
                      <p className="font-medium">{claim.insurance.claimNumber || "Pending"}</p>
                    </div>
                  </div>
                  {claim.insurance.adjusterName && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500 mb-1">Insurance Adjuster</p>
                      <p className="font-medium">{claim.insurance.adjusterName}</p>
                      {claim.insurance.adjusterPhone && (
                        <p className="text-sm text-gray-600">{claim.insurance.adjusterPhone}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card style={cardStyles.base}>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Estimated Loss</p>
                      <p className="text-2xl font-bold">
                        ${claim.damage.estimatedLoss.toLocaleString()}
                      </p>
                    </div>
                    {claim.damage.documentedLoss && (
                      <div>
                        <p className="text-sm text-gray-500">Documented Loss</p>
                        <p className="text-xl font-semibold">
                          ${claim.damage.documentedLoss.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {claim.damage.approvedAmount && (
                      <div>
                        <p className="text-sm text-gray-500">Approved Amount</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${claim.damage.approvedAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Notes */}
              <Card style={cardStyles.base}>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add a quick note..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button 
                    onClick={handleNotesSave}
                    disabled={!notes.trim() || savingNotes}
                    size="sm"
                  >
                    {savingNotes ? "Saving..." : "Add Note"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Tab */}
          <TabsContent value="client">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
                <CardDescription>
                  Complete client information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input value={claim.client.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={claim.client.phone} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={claim.client.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <Input value={claim.damage.type} disabled />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Property Address</Label>
                  <Input value={claim.client.address} disabled />
                  <div className="grid grid-cols-3 gap-4">
                    <Input value={claim.client.city} disabled />
                    <Input value={claim.client.state} disabled />
                    <Input value={claim.client.zip} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Damage Tab */}
          <TabsContent value="damage">
            <Card style={cardStyles.base}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Damage Assessment</CardTitle>
                    <CardDescription>
                      Document and track damage estimates and approvals
                    </CardDescription>
                  </div>
                  {!editingDamage ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDamage(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDamage(false)
                          setDamageForm({
                            estimatedLoss: claim.damage.estimatedLoss || 0,
                            documentedLoss: claim.damage.documentedLoss || 0,
                            approvedAmount: claim.damage.approvedAmount || 0
                          })
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDamageSave}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Damage Type</Label>
                  <Input value={claim.damage.type} disabled className="mt-1" />
                </div>

                <div>
                  <Label>Damage Description</Label>
                  <Textarea
                    value={claim.damage.description}
                    disabled
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Estimated Loss</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={damageForm.estimatedLoss}
                        onChange={(e) => setDamageForm(prev => ({
                          ...prev,
                          estimatedLoss: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!editingDamage}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Documented Loss</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={damageForm.documentedLoss}
                        onChange={(e) => setDamageForm(prev => ({
                          ...prev,
                          documentedLoss: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!editingDamage}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Approved Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={damageForm.approvedAmount}
                        onChange={(e) => setDamageForm(prev => ({
                          ...prev,
                          approvedAmount: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!editingDamage}
                        className="pl-8 text-green-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Upload and manage claim-related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Communication Log</CardTitle>
                <CardDescription>
                  Track all communications related to this claim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Communication log coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card style={cardStyles.base}>
              <CardHeader>
                <CardTitle>Claim Timeline</CardTitle>
                <CardDescription>
                  Complete history of claim events and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(claim.timeline || {}).map(([event, timestamp]) => (
                    <div key={event} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {event.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(timestamp as string).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
