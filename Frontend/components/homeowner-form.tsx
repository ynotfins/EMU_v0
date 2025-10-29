"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import type { HomeownerForm as HomeownerFormType } from "@/types/domain"

interface HomeownerFormProps {
  value: HomeownerFormType
  onChange: (partial: Partial<HomeownerFormType>) => void
  onSave: () => void
}

export function HomeownerForm({ value, onChange, onSave }: HomeownerFormProps) {
  return (
    <div className="space-y-4 pb-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Contact Information</h3>

        <div className="space-y-2">
          <label htmlFor="homeownerName" className="text-sm font-medium text-foreground">
            Homeowner Name <span className="text-[#FF3B30]">*</span>
          </label>
          <Input
            id="homeownerName"
            value={value.homeownerName || ""}
            onChange={(e) => onChange({ homeownerName: e.target.value })}
            placeholder="Enter homeowner name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactPerson" className="text-sm font-medium text-foreground">
            Contact Person
          </label>
          <Input
            id="contactPerson"
            value={value.contactPerson || ""}
            onChange={(e) => onChange({ contactPerson: e.target.value })}
            placeholder="Enter contact person"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <Input
              id="phone"
              type="tel"
              value={value.phone || ""}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={value.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="propertyAddress" className="text-sm font-medium text-foreground">
            Property Address
          </label>
          <Input
            id="propertyAddress"
            value={value.propertyAddress || ""}
            onChange={(e) => onChange({ propertyAddress: e.target.value })}
            placeholder="Enter property address"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-base font-semibold text-foreground">Insurance Information</h3>

        <div className="space-y-2">
          <label htmlFor="policyNumber" className="text-sm font-medium text-foreground">
            Policy Number
          </label>
          <Input
            id="policyNumber"
            value={value.policyNumber || ""}
            onChange={(e) => onChange({ policyNumber: e.target.value })}
            placeholder="Enter policy number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="carrierName" className="text-sm font-medium text-foreground">
              Carrier Name
            </label>
            <Input
              id="carrierName"
              value={value.carrierName || ""}
              onChange={(e) => onChange({ carrierName: e.target.value })}
              placeholder="Insurance carrier"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="claimsPhone" className="text-sm font-medium text-foreground">
              Claims Phone
            </label>
            <Input
              id="claimsPhone"
              type="tel"
              value={value.claimsPhone || ""}
              onChange={(e) => onChange({ claimsPhone: e.target.value })}
              placeholder="(800) 123-4567"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-base font-semibold text-foreground">Incident Details</h3>

        <div className="space-y-2">
          <label htmlFor="incidentDate" className="text-sm font-medium text-foreground">
            Incident Date
          </label>
          <Input
            id="incidentDate"
            type="date"
            value={value.incidentDate || ""}
            onChange={(e) => onChange({ incidentDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="damageDescription" className="text-sm font-medium text-foreground">
            Damage Description
          </label>
          <Textarea
            id="damageDescription"
            value={value.damageDescription || ""}
            onChange={(e) => onChange({ damageDescription: e.target.value })}
            placeholder="Describe the damage..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="adjusterName" className="text-sm font-medium text-foreground">
            Adjuster Name
          </label>
          <Input
            id="adjusterName"
            value={value.adjusterName || ""}
            onChange={(e) => onChange({ adjusterName: e.target.value })}
            placeholder="Enter adjuster name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="adjusterPhone" className="text-sm font-medium text-foreground">
            Adjuster Phone
          </label>
          <Input
            id="adjusterPhone"
            type="tel"
            value={value.adjusterPhone || ""}
            onChange={(e) => onChange({ adjusterPhone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="additionalNotes" className="text-sm font-medium text-foreground">
            Additional Notes
          </label>
          <Textarea
            id="additionalNotes"
            value={value.additionalNotes || ""}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            placeholder="Any additional information..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <Button onClick={onSave} className="w-full bg-[#007AFF] hover:bg-[#0051D5] sticky bottom-4">
        <Save className="h-4 w-4 mr-2" />
        Save Homeowner Info
      </Button>
    </div>
  )
}
