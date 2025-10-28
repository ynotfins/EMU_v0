"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Save } from "lucide-react"

interface EmergencyPaymentCardProps {
  verified: boolean
  cashappHandle?: string
  venmoHandle?: string
  onSave: (cashapp?: string, venmo?: string) => void
}

export function EmergencyPaymentCard({ verified, cashappHandle, venmoHandle, onSave }: EmergencyPaymentCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cashapp, setCashapp] = useState(cashappHandle || "")
  const [venmo, setVenmo] = useState(venmoHandle || "")

  const handleSave = () => {
    onSave(cashapp, venmo)
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle className="text-lg">Emergency Payment Info</CardTitle>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!verified ? (
              <div className="bg-[#6B7280]/10 border border-[#6B7280] rounded-lg p-3">
                <p className="text-sm text-[#6B7280]">Complete ID verification to enable payment options</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="cashapp" className="text-sm font-medium text-foreground">
                    CashApp Handle
                  </label>
                  <Input
                    id="cashapp"
                    placeholder="$username"
                    value={cashapp}
                    onChange={(e) => setCashapp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="venmo" className="text-sm font-medium text-foreground">
                    Venmo Handle
                  </label>
                  <Input id="venmo" placeholder="@username" value={venmo} onChange={(e) => setVenmo(e.target.value)} />
                </div>
                <Button onClick={handleSave} className="w-full bg-[#007AFF] hover:bg-[#0051D5]">
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Info
                </Button>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
