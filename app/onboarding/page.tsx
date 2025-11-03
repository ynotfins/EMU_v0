"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EmployeeOnboarding } from "@/components/employee-onboarding"
import { ProtectedRoute } from "@/components/protected-route"
import { useProfile } from "@/hooks/use-profile"
import { Logo } from "@/components/logo"
import { spacing } from "@/lib/design-tokens"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if employee data is already complete
    if (profile?.employee?.employeeId && profile?.employee?.idDocument) {
      // Already onboarded, redirect to appropriate page
      if (profile.role === "supe" || profile.role === "admin" || profile.role === "super_admin") {
        router.push("/supe/incidents")
      } else {
        router.push("/chaser/incidents")
      }
    } else {
      setShowOnboarding(true)
    }
  }, [profile, router])

  const handleOnboardingComplete = () => {
    // Redirect based on role
    if (profile?.role === "supe" || profile?.role === "admin" || profile?.role === "super_admin") {
      router.push("/supe/incidents")
    } else {
      router.push("/chaser/incidents")
    }
  }

  if (!showOnboarding) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div 
          className="bg-white border-b px-6 py-4"
          style={{ paddingLeft: spacing.xl, paddingRight: spacing.xl }}
        >
          <Logo className="h-8" />
        </div>

        {/* Onboarding Content */}
        <EmployeeOnboarding onComplete={handleOnboardingComplete} />
      </div>
    </ProtectedRoute>
  )
}
