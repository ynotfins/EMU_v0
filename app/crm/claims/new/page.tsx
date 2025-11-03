"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, User, Building, DollarSign, FileText } from "lucide-react"
import { spacing, borderRadius, cardStyles } from "@/lib/design-tokens"
import type { Claim, ClaimPriority, Lead } from "@/types/domain"

interface NewClaimFormData {
  // Client
  clientName: string
  clientPhone: string
  clientEmail: string
  clientAddress: string
  clientCity: string
  clientState: string
  clientZip: string
  
  // Insurance
  insuranceCompany: string
  policyNumber: string
  claimNumber: string
  adjusterName: string
  adjusterPhone: string
  adjusterEmail: string
  policyLimits: string
  deductible: string
  
  // Damage
  damageType: string
  damageDescription: string
  estimatedLoss: string
  incidentDate: string
  
  // Assignment
  priority: ClaimPriority
  leadId?: string
  incidentId?: string
}

export default function NewClaimPage() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<NewClaimFormData>({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    clientCity: "",
    clientState: "",
    clientZip: "",
    insuranceCompany: "",
    policyNumber: "",
    claimNumber: "",
    adjusterName: "",
    adjusterPhone: "",
    adjusterEmail: "",
    policyLimits: "",
    deductible: "",
    damageType: "",
    damageDescription: "",
    estimatedLoss: "",
    incidentDate: new Date().toISOString().split('T')[0],
    priority: "medium"
  })

  const handleInputChange = (field: keyof NewClaimFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateClaimNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `CL-${year}${month}${day}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to create a claim",
        variant: "destructive"
      })
      return
    }

    // Validate required fields
    if (!formData.clientName || !formData.clientPhone || !formData.clientAddress || 
        !formData.insuranceCompany || !formData.policyNumber || !formData.damageType ||
        !formData.damageDescription || !formData.estimatedLoss) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const newClaim: Omit<Claim, "id"> = {
        claimNumber: generateClaimNumber(),
        incidentId: formData.incidentId,
        leadId: formData.leadId,
        stage: "lead",
        priority: formData.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        client: {
          name: formData.clientName,
          phone: formData.clientPhone,
          email: formData.clientEmail || undefined,
          address: formData.clientAddress,
          city: formData.clientCity,
          state: formData.clientState,
          zip: formData.clientZip
        },
        
        insurance: {
          company: formData.insuranceCompany,
          policyNumber: formData.policyNumber,
          claimNumber: formData.claimNumber || undefined,
          adjusterName: formData.adjusterName || undefined,
          adjusterPhone: formData.adjusterPhone || undefined,
          adjusterEmail: formData.adjusterEmail || undefined,
          policyLimits: formData.policyLimits ? parseFloat(formData.policyLimits) : undefined,
          deductible: formData.deductible ? parseFloat(formData.deductible) : undefined
        },
        
        damage: {
          type: formData.damageType,
          description: formData.damageDescription,
          estimatedLoss: parseFloat(formData.estimatedLoss) || 0,
          documentedLoss: undefined,
          approvedAmount: undefined
        },
        
        assignedAdjuster: profile.uid,
        assignedTeam: [],
        
        timeline: {
          leadReceived: new Date().toISOString()
        }
      }

      const docRef = await addDoc(collection(db, "claims"), newClaim)

      toast({
        title: "Claim Created",
        description: `Successfully created claim ${newClaim.claimNumber}`,
      })

      router.push(`/crm/claims/${docRef.id}`)
    } catch (error) {
      console.error("Error creating claim:", error)
      toast({
        title: "Error",
        description: "Failed to create claim. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/crm/claims")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Claim</h1>
            <p className="text-gray-600">Create a new insurance claim</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
              <CardDescription>Property owner details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number *</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email Address</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientAddress">Property Address *</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientCity">City *</Label>
                  <Input
                    id="clientCity"
                    value={formData.clientCity}
                    onChange={(e) => handleInputChange("clientCity", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientState">State *</Label>
                  <Input
                    id="clientState"
                    value={formData.clientState}
                    onChange={(e) => handleInputChange("clientState", e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientZip">ZIP Code *</Label>
                  <Input
                    id="clientZip"
                    value={formData.clientZip}
                    onChange={(e) => handleInputChange("clientZip", e.target.value)}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Insurance Information
              </CardTitle>
              <CardDescription>Policy and carrier details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number *</Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimNumber">Insurance Claim Number</Label>
                  <Input
                    id="claimNumber"
                    value={formData.claimNumber}
                    onChange={(e) => handleInputChange("claimNumber", e.target.value)}
                    placeholder="If assigned"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Incident Date *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyLimits">Policy Limits</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="policyLimits"
                      type="number"
                      value={formData.policyLimits}
                      onChange={(e) => handleInputChange("policyLimits", e.target.value)}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductible">Deductible</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="deductible"
                      type="number"
                      value={formData.deductible}
                      onChange={(e) => handleInputChange("deductible", e.target.value)}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Insurance Adjuster (Optional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adjusterName">Name</Label>
                    <Input
                      id="adjusterName"
                      value={formData.adjusterName}
                      onChange={(e) => handleInputChange("adjusterName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjusterPhone">Phone</Label>
                    <Input
                      id="adjusterPhone"
                      type="tel"
                      value={formData.adjusterPhone}
                      onChange={(e) => handleInputChange("adjusterPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjusterEmail">Email</Label>
                    <Input
                      id="adjusterEmail"
                      type="email"
                      value={formData.adjusterEmail}
                      onChange={(e) => handleInputChange("adjusterEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damage Assessment */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Damage Assessment
              </CardTitle>
              <CardDescription>Initial damage information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="damageType">Damage Type *</Label>
                  <Select
                    value={formData.damageType}
                    onValueChange={(value) => handleInputChange("damageType", value)}
                  >
                    <SelectTrigger id="damageType">
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="wind">Wind</SelectItem>
                      <SelectItem value="hail">Hail</SelectItem>
                      <SelectItem value="smoke">Smoke</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value as ClaimPriority)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="damageDescription">Damage Description *</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => handleInputChange("damageDescription", e.target.value)}
                  rows={4}
                  placeholder="Describe the damage in detail..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLoss">Estimated Loss *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="estimatedLoss"
                    type="number"
                    value={formData.estimatedLoss}
                    onChange={(e) => handleInputChange("estimatedLoss", e.target.value)}
                    className="pl-8"
                    placeholder="0"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">Initial estimate of property damage</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/crm/claims")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ borderRadius: borderRadius.DEFAULT }}
            >
              {loading ? "Creating..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Claim
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}
