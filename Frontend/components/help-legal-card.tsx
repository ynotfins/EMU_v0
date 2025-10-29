"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, FileText } from "lucide-react"

interface HelpLegalCardProps {
  onHelpSupport: () => void
  onTermsPrivacy: () => void
}

export function HelpLegalCard({ onHelpSupport, onTermsPrivacy }: HelpLegalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Help & Legal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" onClick={onHelpSupport} className="w-full justify-start bg-transparent">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help & Support
        </Button>
        <Button variant="outline" onClick={onTermsPrivacy} className="w-full justify-start bg-transparent">
          <FileText className="h-4 w-4 mr-2" />
          Terms & Privacy
        </Button>
      </CardContent>
    </Card>
  )
}
