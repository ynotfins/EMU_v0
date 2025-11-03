"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/protected-route"
import { 
  Search, UserPlus, Filter, Download, Users, 
  Phone, Mail, Calendar, Shield, CheckCircle2,
  AlertCircle, Clock, Building, FileCheck
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import type { Profile } from "@/types/domain"

interface EmployeeProfile extends Profile {
  lastActive?: string
}

export default function CRMEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "chaser" | "supe" | "admin">("all")
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "pending">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[CRM Employees] Loading employee data...")

    // Query users with employee data
    const q = query(
      collection(db, "users"),
      where("employee", "!=", null),
      orderBy("employee"),
      orderBy("email")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeList: EmployeeProfile[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Profile
        employeeList.push({
          ...data,
          uid: doc.id,
          lastActive: data.location?.lastUpdated
        })
      })

      console.log(`[CRM Employees] Loaded ${employeeList.length} employees`)
      setEmployees(employeeList)
      setLoading(false)
    }, (error) => {
      console.error("[CRM Employees] Error loading employees:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee?.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || emp.role === roleFilter
    const matchesVerification = 
      verificationFilter === "all" ||
      (verificationFilter === "verified" && emp.employee?.idDocument?.verified) ||
      (verificationFilter === "pending" && !emp.employee?.idDocument?.verified)

    return matchesSearch && matchesRole && matchesVerification
  })

  // Stats
  const stats = {
    total: employees.length,
    verified: employees.filter((e) => e.employee?.idDocument?.verified).length,
    chasers: employees.filter((e) => e.role === "chaser").length,
    supes: employees.filter((e) => e.role === "supe" || e.role === "admin" || e.role === "super_admin").length,
    activeToday: employees.filter((e) => {
      if (!e.lastActive) return false
      const lastActive = new Date(e.lastActive)
      const today = new Date()
      return lastActive.toDateString() === today.toDateString()
    }).length,
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      chaser: { bg: colors.primary.light, text: colors.primary.DEFAULT },
      supe: { bg: colors.warning.light, text: colors.warning.DEFAULT },
      admin: { bg: colors.danger.light, text: colors.danger.DEFAULT },
      super_admin: { bg: "#E8E3FF", text: "#7C3AED" }
    }

    const config = roleColors[role] || roleColors.chaser

    return (
      <Badge 
        style={{ 
          backgroundColor: config.bg, 
          color: config.text,
          border: "none"
        }}
      >
        {role.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading employees...</p>
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
            <h1 className="text-4xl font-bold mb-2">Employee Management</h1>
            <p className="text-gray-600">
              Manage your team of field responders and supervisors
            </p>
          </div>

          <Button
            size="lg"
            style={{ 
              borderRadius: borderRadius.md,
              padding: `${spacing.md} ${spacing.xl}`
            }}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
                <FileCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Chasers</p>
                  <p className="text-2xl font-bold">{stats.chasers}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Supervisors</p>
                  <p className="text-2xl font-bold">{stats.supes}</p>
                </div>
                <Building className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ ...cardStyles.base, padding: spacing.lg }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Today</p>
                  <p className="text-2xl font-bold">{stats.activeToday}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
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
                    placeholder="Search by name, email, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ borderRadius: borderRadius.DEFAULT }}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === "all" ? "default" : "outline"}
                  onClick={() => setRoleFilter("all")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  All Roles
                </Button>
                <Button
                  variant={roleFilter === "chaser" ? "default" : "outline"}
                  onClick={() => setRoleFilter("chaser")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  Chasers
                </Button>
                <Button
                  variant={roleFilter === "supe" ? "default" : "outline"}
                  onClick={() => setRoleFilter("supe")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  Supes
                </Button>
              </div>

              {/* Verification Filter */}
              <div className="flex gap-2">
                <Button
                  variant={verificationFilter === "all" ? "default" : "outline"}
                  onClick={() => setVerificationFilter("all")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  All
                </Button>
                <Button
                  variant={verificationFilter === "verified" ? "default" : "outline"}
                  onClick={() => setVerificationFilter("verified")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Verified
                </Button>
                <Button
                  variant={verificationFilter === "pending" ? "default" : "outline"}
                  onClick={() => setVerificationFilter("pending")}
                  style={{ borderRadius: borderRadius.DEFAULT }}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card 
              key={employee.uid}
              style={{ 
                ...cardStyles.base,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": cardStyles.hover
              }}
            >
              <CardContent style={{ padding: spacing.xl }}>
                {/* Header with Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${employee.uid}.jpg`} />
                      <AvatarFallback>
                        {employee.displayName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{employee.displayName}</h3>
                      <p className="text-sm text-gray-500">{employee.employee?.employeeId}</p>
                    </div>
                  </div>
                  {getRoleBadge(employee.role)}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{employee.email}</span>
                  </div>
                  {employee.employee?.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{employee.employee.department}</span>
                    </div>
                  )}
                  {employee.employee?.hireDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Hired {new Date(employee.employee.hireDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* ID Verification Status */}
                <div className="pt-4 border-t">
                  {employee.employee?.idDocument?.verified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">ID Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">ID Verification Pending</span>
                    </div>
                  )}
                </div>

                {/* Last Active */}
                {employee.lastActive && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last active: {new Date(employee.lastActive).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <Card style={{ ...cardStyles.base, textAlign: "center", padding: spacing['3xl'] }}>
            <CardContent className="p-0">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No employees found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || roleFilter !== "all" || verificationFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first employee to get started"}
              </p>
              {!(searchTerm || roleFilter !== "all" || verificationFilter !== "all") && (
                <Button size="lg">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add First Employee
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
