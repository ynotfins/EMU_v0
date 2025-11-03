"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import {
  Users, FileText, TrendingUp, Building, Target,
  DollarSign, BarChart3, Clock, Shield, ChevronRight,
  Briefcase, FileSignature, Search, Globe
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors, iconSizes } from "@/lib/design-tokens"

// CRM Module configuration
const crmModules = [
  {
    id: "claims",
    title: "Claims Management",
    description: "Track insurance claims from lead to settlement",
    icon: FileText,
    color: colors.primary.DEFAULT,
    bg: colors.primary.light,
    href: "/crm/claims",
    stats: { label: "Active Claims", value: "24" }
  },
  {
    id: "employees",
    title: "Employee Management",
    description: "Manage your team of adjusters and field staff",
    icon: Users,
    color: colors.success.DEFAULT,
    bg: colors.success.light,
    href: "/crm/employees",
    stats: { label: "Team Members", value: "12" }
  },
  {
    id: "leads",
    title: "Lead Generation",
    description: "Capture and qualify new business opportunities",
    icon: Target,
    color: colors.warning.DEFAULT,
    bg: colors.warning.light,
    href: "/crm/leads",
    stats: { label: "New Leads", value: "37" },
    comingSoon: true
  },
  {
    id: "documents",
    title: "Document Management",
    description: "Organize forms, contracts, and client documents",
    icon: Briefcase,
    color: "#8B5CF6",
    bg: "#EDE9FE",
    href: "/crm/documents",
    stats: { label: "Documents", value: "156" },
    comingSoon: true
  },
  {
    id: "esign",
    title: "E-Signatures",
    description: "Get documents signed digitally with legal compliance",
    icon: FileSignature,
    color: "#EC4899",
    bg: "#FCE7F3",
    href: "/crm/esign",
    stats: { label: "Pending", value: "8" },
    comingSoon: true
  },
  {
    id: "seo",
    title: "SEO & Marketing",
    description: "Manage website content and marketing campaigns",
    icon: Globe,
    color: "#10B981",
    bg: "#D1FAE5",
    href: "/crm/seo",
    stats: { label: "Page Views", value: "2.4k" },
    comingSoon: true
  }
]

export default function CRMDashboardPage() {
  const router = useRouter()
  const { data: profile } = useProfile()

  // Only allow supervisors and admins to access CRM
  const canAccessCRM = profile?.role === "supe" || profile?.role === "admin" || profile?.role === "super_admin"

  if (!canAccessCRM) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Card style={{ ...cardStyles.base, maxWidth: "400px", textAlign: "center" }}>
            <CardContent style={{ padding: spacing['2xl'] }}>
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-gray-500 mb-6">
                The CRM is only available to supervisors and administrators.
              </p>
              <Button onClick={() => router.push("/chaser/incidents")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Public Adjuster CRM</h1>
          <p className="text-gray-600 text-lg">
            Manage claims, employees, and business operations in one place
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">$2.4M</p>
                  <p className="text-xs text-green-600">+12% vs last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Claims</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-blue-600">8 in negotiation</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Team Members</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-purple-600">3 supervisors</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Cycle Time</p>
                  <p className="text-2xl font-bold">21d</p>
                  <p className="text-xs text-orange-600">-2d improvement</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CRM Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crmModules.map((module) => {
            const Icon = module.icon
            
            return (
              <Card
                key={module.id}
                style={{
                  ...cardStyles.base,
                  cursor: module.comingSoon ? "default" : "pointer",
                  opacity: module.comingSoon ? 0.7 : 1,
                  transition: "all 0.2s"
                }}
                className={!module.comingSoon ? "hover:shadow-lg" : ""}
                onClick={() => !module.comingSoon && router.push(module.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className="p-3 rounded-xl inline-flex"
                      style={{
                        backgroundColor: module.bg,
                        color: module.color
                      }}
                    >
                      <Icon style={{ width: iconSizes.lg, height: iconSizes.lg }} />
                    </div>
                    {module.comingSoon ? (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-500">{module.stats.label}</span>
                    <span className="text-2xl font-bold">{module.stats.value}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card style={{ ...cardStyles.base, marginTop: spacing.xl }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => router.push("/crm/claims/new")}
                style={{ borderRadius: borderRadius.md }}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>New Claim</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => router.push("/crm/employees")}
                style={{ borderRadius: borderRadius.md }}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Add Employee</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                disabled
                style={{ borderRadius: borderRadius.md }}
              >
                <Target className="h-6 w-6 mb-2" />
                <span>Import Leads</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                disabled
                style={{ borderRadius: borderRadius.md }}
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
