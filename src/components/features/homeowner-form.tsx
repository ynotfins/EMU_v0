"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Save, Edit2, Lock } from "lucide-react"
import { homeownerFormSchema, type HomeownerFormInput } from "@/schemas/homeowner.schema"
import { INSURANCE_CARRIERS, getCarrierByName } from "@/lib/utils/insurance-carriers"

interface HomeownerFormProps {
  data?: Partial<HomeownerFormInput>
  value?: Partial<HomeownerFormInput>
  onChange: (partial: Partial<HomeownerFormInput>) => void
  onSave?: () => void
  incidentId?: string
}

export function HomeownerForm({ data, value, onChange, onSave, incidentId }: HomeownerFormProps) {
  const formData = data || value || {}
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<HomeownerFormInput>({
    resolver: zodResolver(homeownerFormSchema),
    defaultValues: {
      homeownerName: formData.homeownerName || "",
      contactPerson: formData.contactPerson || "",
      phone: formData.phone || "",
      email: formData.email || "",
      propertyAddress: formData.propertyAddress || "",
      policyNumber: formData.policyNumber || "",
      carrierName: formData.carrierName || "",
      claimsPhone: formData.claimsPhone || "",
      incidentDate: formData.incidentDate || "",
      damageDescription: formData.damageDescription || "",
      adjusterName: formData.adjusterName || "",
      adjusterPhone: formData.adjusterPhone || "",
      additionalNotes: formData.additionalNotes || "",
    },
  })

  const handleCarrierChange = (carrierName: string) => {
    const carrier = getCarrierByName(carrierName)
    form.setValue("carrierName", carrierName)
    form.setValue("claimsPhone", carrier?.claimsPhone || "")
    onChange({
      carrierName,
      claimsPhone: carrier?.claimsPhone || "",
    })
  }

  const handleSubmit = (values: HomeownerFormInput) => {
    onChange(values)
    onSave?.()
    setIsEditing(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-6 px-4">
        <div className="flex items-center justify-between pt-4">
          <h3 className="text-lg font-semibold text-foreground">Homeowner Information</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? <Lock className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {isEditing ? "Lock" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Contact Information</h3>

          <FormField
            control={form.control}
            name="homeownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Homeowner Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter homeowner name"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact person"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      disabled={!isEditing}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      disabled={!isEditing}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter property address"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Insurance Information</h3>

          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter policy number"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="carrierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier Name</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleCarrierChange(value)
                    }}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance carrier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {INSURANCE_CARRIERS.map((carrier) => (
                        <SelectItem key={carrier.name} value={carrier.name}>
                          {carrier.name}
                          {carrier.marketShare && (
                            <span className="ml-2 text-xs text-muted-foreground">{carrier.marketShare}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="claimsPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Claims Phone <span className="text-xs text-muted-foreground">(auto-filled)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(800) 123-4567"
                      disabled={!isEditing}
                      className="bg-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Incident Details</h3>

          <FormField
            control={form.control}
            name="incidentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="damageDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Damage Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the damage..."
                    rows={4}
                    className="resize-none"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjusterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjuster Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter adjuster name"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjusterPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjuster Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information..."
                    rows={3}
                    className="resize-none"
                    disabled={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Homeowner Info
          </Button>
        )}
      </form>
    </Form>
  )
}
