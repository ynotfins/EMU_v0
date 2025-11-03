"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import { useRouter } from "next/navigation"
import {
  Search, Plus, Filter, TrendingUp, Clock, DollarSign,
  FileText, Users, AlertCircle, CheckCircle, Calendar,
  BarChart3, Target, Phone, Building
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { Claim, ClaimStage } from "@/types/domain"

// Stage configuration with colors
const stageConfig: Record<ClaimStage, { label: string; color: string; bg: string; icon: any }> = {
  lead: { label: "Lead", color: colors.gray[600], bg: colors.gray[100], icon: Target },
  assignment: { label: "Assignment", color: colors.primary.DEFAULT, bg: colors.primary.light, icon: Users },
  investigation: { label: "Investigation", color: colors.warning.DEFAULT, bg: colors.warning.light, icon: Search },
  negotiation: { label: "Negotiation", color: "#8B5CF6", bg: "#EDE9FE", icon: FileText },
  settlement: { label: "Settlement", color: colors.success.DEFAULT, bg: colors.success.light, icon: DollarSign },
  closed: { label: "Closed", color: colors.gray[500], bg: colors.gray[100], icon: CheckCircle }
}

export default function CRMClaimsPage() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const [claims, setClaims] = useState<Claim[]>([])
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeStage, setActiveStage] = useState<ClaimStage | "all">("all")

  useEffect(() => {
    if (!profile?.uid) return

    console.log("[CRM Claims] Loading claims...")

    // Build query based on user role
    let q
    if (profile.role === "super_admin" || profile.role === "admin" || profile.role === "supe") {
      // Supes see all claims
      q = query(collection(db, "claims"), orderBy("updatedAt", "desc"))
    } else {
      // Chasers see only assigned claims
      q = query(
        collection(db, "claims"),
        where("assignedAdjuster", "==", profile.uid),
        orderBy("updatedAt", "desc")
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const claimsList: Claim[] = []
        snapshot.forEach((doc) => {
          claimsList.push({
            id: doc.id,
            ...doc.data()
          } as Claim)
        })

        console.log(`[CRM Claims] Loaded ${claimsList.length} claims`)
        setClaims(claimsList)
        setFilteredClaims(claimsList)
        setLoading(false)
      },
      (error) => {
        console.error("[CRM Claims] Error loading claims:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [profile])

  // Filter claims based on search and stage
  useEffect(() => {
    let filtered = claims

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((claim) =>
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.insurance.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Stage filter
    if (activeStage !== "all") {
      filtered = filtered.filter((claim) => claim.stage === activeStage)
    }

    setFilteredClaims(filtered)
  }, [claims, searchTerm, activeStage])

  // Calculate stats
  const stats = {
    total: claims.length,
    totalValue: claims.reduce((sum, c) => sum + (c.damage.estimatedLoss || 0), 0),
    approved: claims.reduce((sum, c) => sum + (c.damage.approvedAmount || 0), 0),
    avgCycleTime: claims.filter(c => c.stage === "closed").length > 0
      ? Math.round(
          claims
            .filter(c => c.stage === "closed" && c.timeline?.closed)
            .reduce((sum, c) => {
              const start = new Date(c.createdAt).getTime()
              const end = new Date(c.timeline!.closed!).getTime()
              return sum + (end - start) / (1000 * 60 * 60 * 24) // days
            }, 0) / claims.filter(c => c.stage === "closed").length
        )
      : 0,
    byStage: Object.entries(stageConfig).map(([stage, config]) => ({
      stage: stage as ClaimStage,
      ...config,
      count: claims.filter(c => c.stage === stage).length
    }))
  }

  const handleClaimClick = (claimId: string) => {
    router.push(`/crm/claims/${claimId}`)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading claims...</p>
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
            <h1 className="text-4xl font-bold mb-2">Claims Management</h1>
            <p className="text-gray-600">
              Track and manage insurance claims from lead to settlement
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => router.push("/crm/claims/new")}
            style={{ 
              borderRadius: borderRadius.md,
              padding: `${spacing.md} ${spacing.xl}`
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Claim
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Claims</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-3xl font-bold">
                    ${(stats.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-3xl font-bold">
                    ${(stats.approved / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Cycle Time</p>
                  <p className="text-3xl font-bold">{stats.avgCycleTime}d</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline View */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.xl }}>
          <CardContent style={{ padding: spacing.xl }}>
            <h3 className="text-lg font-semibold mb-4">Claims Pipeline</h3>
            <div className="grid grid-cols-6 gap-4">
              {stats.byStage.map((stage) => {
                const Icon = stage.icon
                return (
                  <button
                    key={stage.stage}
                    onClick={() => setActiveStage(stage.stage)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      activeStage === stage.stage 
                        ? "border-current shadow-md" 
                        : "border-transparent hover:border-gray-200"
                    }`}
                    style={{ 
                      backgroundColor: stage.bg,
                      color: stage.color,
                      borderRadius: borderRadius.md
                    }}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{stage.label}</p>
                    <p className="text-2xl font-bold mt-1">{stage.count}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.lg }}>
          <CardContent style={{ padding: spacing.lg }}>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by claim #, client name, address, or insurance company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  />
                </div>
              </div>

              {/* Stage Tabs */}
              <div className="flex gap-2">
                <Button
                  variant={activeStage === "all" ? "default" : "outline"}
                  onClick={() => setActiveStage("all")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  All Stages
                </Button>
              </div>

              {/* Export Button */}
              <Button variant="outline" style={{ borderRadius: borderRadius.DEFAULT }}>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const stage = stageConfig[claim.stage]
            const StageIcon = stage.icon

            return (
              <Card 
                key={claim.id}
                style={{ 
                  ...cardStyles.base,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => handleClaimClick(claim.id)}
                className="hover:shadow-md"
              >
                <CardContent style={{ padding: spacing.xl }}>
                  <div className="grid grid-cols-12 gap-6 items-center">
                    {/* Claim Info */}
                    <div className="col-span-3">
                      <p className="text-sm text-gray-500 mb-1">Claim #</p>
                      <p className="font-semibold text-lg">{claim.claimNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Client Info */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{claim.client.name}</p>
                      </div>
                      <p className="text-sm text-gray-600">{claim.client.address}</p>
                      <p className="text-sm text-gray-500">
                        {claim.client.city}, {claim.client.state}
                      </p>
                    </div>

                    {/* Insurance Info */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium">{claim.insurance.company}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        #{claim.insurance.claimNumber || "Pending"}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm text-gray-500">Estimated Loss</p>
                      <p className="text-lg font-semibold">
                        ${(claim.damage.estimatedLoss / 1000).toFixed(0)}k
                      </p>
                      {claim.damage.approvedAmount && (
                        <p className="text-sm text-green-600">
                          Approved: ${(claim.damage.approvedAmount / 1000).toFixed(0)}k
                        </p>
                      )}
                    </div>

                    {/* Stage */}
                    <div className="col-span-2 text-right">
                      <Badge
                        style={{
                          backgroundColor: stage.bg,
                          color: stage.color,
                          border: "none",
                          padding: `${spacing.xs} ${spacing.md}`,
                          fontSize: "14px"
                        }}
                        className="inline-flex items-center gap-1"
                      >
                        <StageIcon className="h-4 w-4" />
                        {stage.label}
                      </Badge>
                      {claim.priority === "urgent" && (
                        <Badge 
                          variant="destructive" 
                          className="ml-2"
                          style={{ padding: `${spacing.xs} ${spacing.sm}` }}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredClaims.length === 0 && (
          <Card style={{ ...cardStyles.base, textAlign: "center", padding: spacing['3xl'] }}>
            <CardContent className="p-0">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No claims found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || activeStage !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first claim to get started"}
              </p>
              {!(searchTerm || activeStage !== "all") && (
                <Button size="lg" onClick={() => router.push("/crm/claims/new")}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Claim
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
