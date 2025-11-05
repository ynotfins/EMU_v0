"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Edit2, Lock } from "lucide-react"
import type { HomeownerForm as HomeownerFormType } from "@/types/extended-domain"
import { INSURANCE_CARRIERS, getCarrierByName } from "@/lib/utils/insurance-carriers"

interface HomeownerFormProps {
  data?: HomeownerFormType
  value?: HomeownerFormType
  onChange: (partial: Partial<HomeownerFormType>) => void
  onSave?: () => void
  incidentId?: string
}

export function HomeownerForm({ data, value, onChange, onSave, incidentId }: HomeownerFormProps) {
  const formData = data || value || {};
  const [isEditing, setIsEditing] = useState(false);

  // Handle carrier selection - auto-populate claims phone
  const handleCarrierChange = (carrierName: string) => {
    const carrier = getCarrierByName(carrierName);
    onChange({ 
      carrierName,
      claimsPhone: carrier?.claimsPhone || ''
    });
  };

  return (
    <div className="space-y-4 pb-6 px-4">
      {/* Edit Toggle Button */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg font-semibold text-foreground">Homeowner Information</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          {isEditing ? <Lock className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          {isEditing ? 'Lock' : 'Edit'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Contact Information</h3>

        <div className="space-y-2">
          <label htmlFor="homeownerName" className="text-sm font-medium text-foreground">
            Homeowner Name <span className="text-[#FF3B30]">*</span>
          </label>
          <Input
            id="homeownerName"
            value={formData.homeownerName || ""}
            onChange={(e) => onChange({ homeownerName: e.target.value })}
            placeholder="Enter homeowner name"
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactPerson" className="text-sm font-medium text-foreground">
            Contact Person
          </label>
          <Input
            id="contactPerson"
            value={formData.contactPerson || ""}
            onChange={(e) => onChange({ contactPerson: e.target.value })}
            placeholder="Enter contact person"
            disabled={!isEditing}
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
              value={formData.phone || ""}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="email@example.com"
              disabled={!isEditing}
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
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Insurance Information</h3>

        <div className="space-y-2">
          <label htmlFor="policyNumber" className="text-sm font-medium text-foreground">
            Policy Number
          </label>
          <Input
            id="policyNumber"
            value={formData.policyNumber || ""}
            onChange={(e) => onChange({ policyNumber: e.target.value })}
            placeholder="Enter policy number"
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="carrierName" className="text-sm font-medium text-foreground">
              Carrier Name
            </label>
            <Select
              value={value.carrierName || ""}
              onValueChange={handleCarrierChange}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance carrier" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {INSURANCE_CARRIERS.map((carrier) => (
                  <SelectItem key={carrier.name} value={carrier.name}>
                    {carrier.name}
                    {carrier.marketShare && (
                      <span className="ml-2 text-xs text-gray-500">{carrier.marketShare}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="claimsPhone" className="text-sm font-medium text-foreground">
              Claims Phone <span className="text-xs text-gray-500">(auto-filled)</span>
            </label>
            <Input
              id="claimsPhone"
              type="tel"
              value={value.claimsPhone || ""}
              onChange={(e) => onChange({ claimsPhone: e.target.value })}
              placeholder="(800) 123-4567"
              disabled={!isEditing}
              className="bg-blue-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
          />
        </div>
      </div>

      {isEditing && (
        <Button onClick={onSave} className="w-full bg-[#007AFF] hover:bg-[#0051D5]">
          <Save className="h-4 w-4 mr-2" />
          Save Homeowner Info
        </Button>
      )}
    </div>
  )
}
