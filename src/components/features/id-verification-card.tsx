"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle } from "lucide-react"

interface IDVerificationCardProps {
  verified: boolean
  onUploadID: () => void
}

export function IDVerificationCard({ verified, onUploadID }: IDVerificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          ID Verification
          {verified && <CheckCircle className="h-5 w-5 text-[#34C759]" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {verified ? (
          <div className="bg-[#34C759]/10 border border-[#34C759] rounded-lg p-3">
            <p className="text-sm text-[#34C759] font-medium">Your ID has been verified</p>
          </div>
        ) : (
          <>
            <div className="bg-[#FF3B30]/10 border border-[#FF3B30] rounded-lg p-3">
              <p className="text-sm text-[#FF3B30]">ID verification required to receive payments</p>
            </div>
            <Button onClick={onUploadID} className="w-full bg-[#007AFF] hover:bg-[#0051D5]">
              <Upload className="h-4 w-4 mr-2" />
              Upload ID for Verification
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
