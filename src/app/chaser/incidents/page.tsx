"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChaserIncidentsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/incidents")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#007AFF] border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-[#6B7280]">Loading...</p>
      </div>
    </div>
  )
}

