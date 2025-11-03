"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import { spacing, borderRadius, cardStyles } from "@/lib/design-tokens"
import type { LeadSource, Lead } from "@/types/domain"

export default function NewLeadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    // Contact Information
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    contactCity: "",
    contactState: "",
    contactZip: "",
    
    // Incident Information
    incidentType: "",
    incidentDate: new Date().toISOString().split('T')[0],
    damageDescription: "",
    estimatedLoss: "",
    
    // Insurance Information
    insuranceCompany: "",
    policyNumber: "",
    claimNumber: "",
    
    // Lead Details
    source: "manual" as LeadSource,
    notes: "",
    
    // Source-specific data
    radioFrequency: "",
    socialMediaPost: "",
    webUrl: "",
    keywords: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contactName && !formData.contactPhone && !formData.contactEmail) {
      toast({
        title: "Missing contact information",
        description: "Please provide at least one contact method",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const leadData: Omit<Lead, "id"> = {
        source: formData.source,
        status: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        contact: {
          name: formData.contactName || undefined,
          phone: formData.contactPhone || undefined,
          email: formData.contactEmail || undefined,
          address: formData.contactAddress || undefined,
          city: formData.contactCity || undefined,
          state: formData.contactState || undefined,
          zip: formData.contactZip || undefined
        },
        
        incidentType: formData.incidentType || undefined,
        incidentDate: formData.incidentDate || undefined,
        damageDescription: formData.damageDescription || undefined,
        estimatedLoss: formData.estimatedLoss ? parseFloat(formData.estimatedLoss) : undefined,
        
        insuranceCompany: formData.insuranceCompany || undefined,
        policyNumber: formData.policyNumber || undefined,
        claimNumber: formData.claimNumber || undefined,
        
        notes: formData.notes ? [formData.notes] : undefined,
        
        sourceData: formData.source === "radio_scanner" && formData.radioFrequency ? {
          radioFrequency: formData.radioFrequency
        } : formData.source === "social_media" && formData.socialMediaPost ? {
          socialMediaPost: formData.socialMediaPost
        } : formData.source === "web_scraping" && formData.webUrl ? {
          webUrl: formData.webUrl
        } : formData.source === "seo_landing" && formData.keywords ? {
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean)
        } : undefined
      }

      const docRef = await addDoc(collection(db, "leads"), leadData)
      
      console.log("[New Lead] Created lead with ID:", docRef.id)
      
      toast({
        title: "Lead created successfully",
        description: "The new lead has been added to the system"
      })
      
      router.push("/crm/leads")
      
    } catch (error) {
      console.error("[New Lead] Error creating lead:", error)
      toast({
        title: "Error creating lead",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            style={{ borderRadius: borderRadius.DEFAULT }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Add New Lead</h1>
            <p className="text-gray-600">Manually enter a new fire incident lead</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Who is the potential client?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Full Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactAddress">Street Address</Label>
                <Input
                  id="contactAddress"
                  value={formData.contactAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactAddress: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactCity">City</Label>
                <Input
                  id="contactCity"
                  value={formData.contactCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactCity: e.target.value }))}
                  placeholder="Philadelphia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactState">State</Label>
                  <Input
                    id="contactState"
                    value={formData.contactState}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactState: e.target.value }))}
                    placeholder="PA"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactZip">ZIP Code</Label>
                  <Input
                    id="contactZip"
                    value={formData.contactZip}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactZip: e.target.value }))}
                    placeholder="19101"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident Information */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>Information about the fire incident</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select 
                    value={formData.incidentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, incidentType: value }))}
                  >
                    <SelectTrigger id="incidentType">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential Fire">Residential Fire</SelectItem>
                      <SelectItem value="Commercial Fire">Commercial Fire</SelectItem>
                      <SelectItem value="Vehicle Fire">Vehicle Fire</SelectItem>
                      <SelectItem value="Wildfire">Wildfire</SelectItem>
                      <SelectItem value="Electrical Fire">Electrical Fire</SelectItem>
                      <SelectItem value="Kitchen Fire">Kitchen Fire</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Incident Date</Label>
                  <div className="relative">
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedLoss">Estimated Loss ($)</Label>
                  <Input
                    id="estimatedLoss"
                    type="number"
                    value={formData.estimatedLoss}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedLoss: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="damageDescription">Damage Description</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, damageDescription: e.target.value }))}
                  placeholder="Describe the extent of damage..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Policy and claim details if available</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceCompany">Insurance Company</Label>
                <Input
                  id="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                  placeholder="State Farm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                  placeholder="POL-123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimNumber">Claim Number</Label>
                <Input
                  id="claimNumber"
                  value={formData.claimNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, claimNumber: e.target.value }))}
                  placeholder="CLM-789012"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lead Source */}
          <Card style={cardStyles.base}>
            <CardHeader>
              <CardTitle>Lead Source</CardTitle>
              <CardDescription>How was this lead obtained?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source Type</Label>
                <Select 
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as LeadSource }))}
                >
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="radio_scanner">Radio Scanner</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="web_scraping">Web Scraping</SelectItem>
                    <SelectItem value="seo_landing">SEO Landing Page</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source-specific fields */}
              {formData.source === "radio_scanner" && (
                <div className="space-y-2">
                  <Label htmlFor="radioFrequency">Radio Frequency</Label>
                  <Input
                    id="radioFrequency"
                    value={formData.radioFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, radioFrequency: e.target.value }))}
                    placeholder="154.430 MHz"
                  />
                </div>
              )}

              {formData.source === "social_media" && (
                <div className="space-y-2">
                  <Label htmlFor="socialMediaPost">Social Media Post URL/Details</Label>
                  <Input
                    id="socialMediaPost"
                    value={formData.socialMediaPost}
                    onChange={(e) => setFormData(prev => ({ ...prev, socialMediaPost: e.target.value }))}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              )}

              {formData.source === "web_scraping" && (
                <div className="space-y-2">
                  <Label htmlFor="webUrl">Source Website URL</Label>
                  <Input
                    id="webUrl"
                    value={formData.webUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webUrl: e.target.value }))}
                    placeholder="https://local-news.com/fire-incident"
                  />
                </div>
              )}

              {formData.source === "seo_landing" && (
                <div className="space-y-2">
                  <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="fire damage, public adjuster, philadelphia"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about this lead..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ borderRadius: borderRadius.md }}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}
