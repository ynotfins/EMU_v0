"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"

export default function RolePage() {
  const router = useRouter()
  const { data: profile } = useProfile()

  useEffect(() => {
    if (profile) {
      // Redirect based on role
      if (profile.role === "chaser") {
        router.push("/chaser/incidents")
      } else if (profile.role === "supe") {
        router.push("/supe/incidents")
      } else if (profile.role === "admin") {
        router.push("/admin")
      }
    }
  }, [profile, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#007AFF] border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-[#6B7280]">Loading...</p>
      </div>
    </div>
  )
}
