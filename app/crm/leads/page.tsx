"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, Search, Filter, Download, Radio, Globe, 
  FileText, Target, Phone, Mail, MapPin, Clock,
  DollarSign, AlertCircle, CheckCircle2, XCircle,
  Building2, Wifi, Share2, Eye, UserPlus, Calendar, Settings
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { Lead, LeadSource, LeadStatus } from "@/types/domain"
import { format } from "date-fns"

interface LeadWithId extends Lead {
  id: string
}

const LEAD_SOURCE_ICONS: Record<LeadSource, React.ElementType> = {
  radio_scanner: Radio,
  social_media: Share2,
  web_scraping: Globe,
  seo_landing: Target,
  referral: UserPlus,
  manual: FileText
}

const LEAD_SOURCE_COLORS: Record<LeadSource, { bg: string; text: string }> = {
  radio_scanner: { bg: colors.danger.light, text: colors.danger.DEFAULT },
  social_media: { bg: colors.primary.light, text: colors.primary.DEFAULT },
  web_scraping: { bg: colors.warning.light, text: colors.warning.DEFAULT },
  seo_landing: { bg: colors.success.light, text: colors.success.DEFAULT },
  referral: { bg: "#E8E3FF", text: "#7C3AED" },
  manual: { bg: colors.gray[100], text: colors.gray[600] }
}

const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  new: { bg: colors.primary.light, text: colors.primary.DEFAULT },
  contacted: { bg: colors.warning.light, text: colors.warning.DEFAULT },
  qualified: { bg: colors.success.light, text: colors.success.DEFAULT },
  converted: { bg: "#E8E3FF", text: "#7C3AED" },
  lost: { bg: colors.gray[100], text: colors.gray[600] }
}

export default function CRMLeadsPage() {
  const { data: profile } = useProfile()
  const { toast } = useToast()
  const [leads, setLeads] = useState<LeadWithId[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<LeadWithId | null>(null)

  useEffect(() => {
    console.log("[CRM Leads] Loading leads...")

    const q = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsList: LeadWithId[] = []
      
      snapshot.forEach((doc) => {
        leadsList.push({
          id: doc.id,
          ...doc.data()
        } as LeadWithId)
      })

      console.log(`[CRM Leads] Loaded ${leadsList.length} leads`)
      setLeads(leadsList)
      setLoading(false)
    }, (error) => {
      console.error("[CRM Leads] Error loading leads:", error)
      toast({
        title: "Error loading leads",
        description: error.message,
        variant: "destructive"
      })
      setLoading(false)
    })

    return () => unsubscribe()
  }, [toast])

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.incidentType?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesSource && matchesStatus
  })

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    converted: leads.filter(l => l.status === "converted").length,
    todayLeads: leads.filter(l => {
      const leadDate = new Date(l.createdAt)
      const today = new Date()
      return leadDate.toDateString() === today.toDateString()
    }).length,
    estimatedValue: leads
      .filter(l => l.status === "qualified" || l.status === "converted")
      .reduce((sum, l) => sum + (l.estimatedLoss || 0), 0)
  }

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateDoc(doc(db, "leads", leadId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Lead updated",
        description: `Status changed to ${newStatus}`
      })
    } catch (error) {
      console.error("Error updating lead:", error)
      toast({
        title: "Update failed",
        description: "Could not update lead status",
        variant: "destructive"
      })
    }
  }

  const handleConvertToClaim = async (lead: LeadWithId) => {
    try {
      // Create a new claim from this lead
      const claimData = {
        claimNumber: `CLM-${Date.now().toString().slice(-8)}`,
        leadId: lead.id,
        stage: "assignment" as const,
        priority: "medium" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        client: {
          name: lead.contact.name || "",
          phone: lead.contact.phone || "",
          email: lead.contact.email,
          address: lead.contact.address || "",
          city: lead.contact.city || "",
          state: lead.contact.state || "",
          zip: lead.contact.zip || ""
        },
        insurance: {
          company: lead.insuranceCompany || "",
          policyNumber: lead.policyNumber || "",
          claimNumber: lead.claimNumber
        },
        damage: {
          type: lead.incidentType || "",
          description: lead.damageDescription || "",
          estimatedLoss: lead.estimatedLoss || 0
        },
        assignedAdjuster: profile?.uid || "",
        timeline: {
          leadReceived: lead.createdAt,
          assigned: new Date().toISOString()
        }
      }

      const claimRef = await addDoc(collection(db, "claims"), claimData)

      // Update lead to converted
      await updateDoc(doc(db, "leads", lead.id), {
        status: "converted" as LeadStatus,
        convertedToClaimId: claimRef.id,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Lead converted",
        description: "Successfully created claim from lead"
      })

    } catch (error) {
      console.error("Error converting lead:", error)
      toast({
        title: "Conversion failed",
        description: "Could not convert lead to claim",
        variant: "destructive"
      })
    }
  }

  const getSourceBadge = (source: LeadSource) => {
    const Icon = LEAD_SOURCE_ICONS[source]
    const colors = LEAD_SOURCE_COLORS[source]

    return (
      <Badge 
        variant="secondary"
        style={{ 
          backgroundColor: colors.bg, 
          color: colors.text,
          border: "none"
        }}
      >
        <Icon className="h-3 w-3 mr-1" />
        {source.replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: LeadStatus) => {
    const colors = LEAD_STATUS_COLORS[status]

    return (
      <Badge 
        style={{ 
          backgroundColor: colors.bg, 
          color: colors.text,
          border: "none"
        }}
      >
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading leads...</p>
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
            <h1 className="text-4xl font-bold mb-2">Lead Generation</h1>
            <p className="text-gray-600">
              Manage and convert fire incident leads from multiple sources
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/crm/leads/settings")}
              style={{ 
                borderRadius: borderRadius.md,
                padding: `${spacing.md} ${spacing.lg}`
              }}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/crm/leads/new")}
              style={{ 
                borderRadius: borderRadius.md,
                padding: `${spacing.md} ${spacing.xl}`
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New</p>
                  <p className="text-2xl font-bold">{stats.new}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contacted</p>
                  <p className="text-2xl font-bold">{stats.contacted}</p>
                </div>
                <Phone className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Qualified</p>
                  <p className="text-2xl font-bold">{stats.qualified}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Converted</p>
                  <p className="text-2xl font-bold">{stats.converted}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold">{stats.todayLeads}</p>
                </div>
                <Calendar className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Est. Value</p>
                  <p className="text-2xl font-bold">
                    ${(stats.estimatedValue / 1000).toFixed(0)}k
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.lg }}>
          <CardContent style={{ padding: spacing.lg }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, email, address, or incident type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  />
                </div>
              </div>

              {/* Source Filter */}
              <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as LeadSource | "all")}>
                <SelectTrigger className="w-48" style={{ borderRadius: borderRadius.DEFAULT }}>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="radio_scanner">Radio Scanner</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="web_scraping">Web Scraping</SelectItem>
                  <SelectItem value="seo_landing">SEO Landing</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
                <SelectTrigger className="w-48" style={{ borderRadius: borderRadius.DEFAULT }}>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.map((lead) => (
            <Card 
              key={lead.id}
              style={{ 
                ...cardStyles.base,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover:shadow-lg"
              onClick={() => setSelectedLead(lead)}
            >
              <CardContent style={{ padding: spacing.xl }}>
                <div className="flex items-start justify-between">
                  {/* Lead Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-lg">
                        {lead.contact.name || "Unknown Contact"}
                      </h3>
                      {getSourceBadge(lead.source)}
                      {getStatusBadge(lead.status)}
                      {lead.convertedToClaimId && (
                        <Badge variant="outline" className="border-purple-500 text-purple-600">
                          Claim Created
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Contact Info */}
                      <div className="space-y-1">
                        {lead.contact.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            {lead.contact.phone}
                          </div>
                        )}
                        {lead.contact.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            {lead.contact.email}
                          </div>
                        )}
                        {lead.contact.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {lead.contact.address}, {lead.contact.city}
                          </div>
                        )}
                      </div>

                      {/* Incident Info */}
                      <div className="space-y-1">
                        {lead.incidentType && (
                          <p className="text-gray-600">
                            <span className="font-medium">Type:</span> {lead.incidentType}
                          </p>
                        )}
                        {lead.incidentDate && (
                          <p className="text-gray-600">
                            <span className="font-medium">Date:</span> {format(new Date(lead.incidentDate), "MMM d, yyyy")}
                          </p>
                        )}
                        {lead.estimatedLoss && (
                          <p className="text-gray-600">
                            <span className="font-medium">Est. Loss:</span> ${lead.estimatedLoss.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Insurance Info */}
                      <div className="space-y-1">
                        {lead.insuranceCompany && (
                          <p className="text-gray-600">
                            <span className="font-medium">Insurance:</span> {lead.insuranceCompany}
                          </p>
                        )}
                        {lead.policyNumber && (
                          <p className="text-gray-600">
                            <span className="font-medium">Policy:</span> {lead.policyNumber}
                          </p>
                        )}
                        {lead.assignedTo && (
                          <p className="text-gray-600">
                            <span className="font-medium">Assigned:</span> {lead.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Source-specific data */}
                    {lead.sourceData && (
                      <div className="text-sm text-gray-500 pt-2">
                        {lead.sourceData.radioFrequency && (
                          <span className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            Frequency: {lead.sourceData.radioFrequency}
                          </span>
                        )}
                        {lead.sourceData.socialMediaPost && (
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            Social post captured
                          </span>
                        )}
                        {lead.sourceData.webUrl && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Web source tracked
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {lead.status === "qualified" && !lead.convertedToClaimId && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConvertToClaim(lead)
                        }}
                        style={{ borderRadius: borderRadius.DEFAULT }}
                      >
                        Convert to Claim
                      </Button>
                    )}

                    {lead.status === "new" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(lead.id, "contacted")
                        }}
                        style={{ borderRadius: borderRadius.DEFAULT }}
                      >
                        Mark Contacted
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ borderRadius: borderRadius.DEFAULT }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {format(new Date(lead.createdAt), "MMM d, h:mm a")}
                  </span>
                  {lead.updatedAt !== lead.createdAt && (
                    <span>Updated {format(new Date(lead.updatedAt), "MMM d, h:mm a")}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <Card style={{ ...cardStyles.base, textAlign: "center", padding: spacing['3xl'] }}>
            <CardContent className="p-0">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || sourceFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start capturing leads from various sources"}
              </p>
              {!(searchTerm || sourceFilter !== "all" || statusFilter !== "all") && (
                <Button size="lg" onClick={() => router.push("/crm/leads/new")}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Lead
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
