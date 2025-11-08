"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Save } from "lucide-react"
import { paymentInfoSchema, type PaymentInfoInput } from "@/schemas/payment.schema"

interface EmergencyPaymentCardProps {
  verified: boolean
  cashappHandle?: string
  venmoHandle?: string
  onSave: (cashapp?: string, venmo?: string) => void
}

export function EmergencyPaymentCard({ verified, cashappHandle, venmoHandle, onSave }: EmergencyPaymentCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<PaymentInfoInput>({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: {
      cashapp: cashappHandle || "",
      venmo: venmoHandle || "",
    },
  })

  const handleSave = (values: PaymentInfoInput) => {
    onSave(values.cashapp, values.venmo)
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">??</span>
              Emergency Payment Info
            </CardTitle>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!verified ? (
              <div className="bg-muted border border-muted-foreground/20 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Complete ID verification to enable payment options</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cashapp"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground">
                          CashApp Handle
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="$username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="venmo"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Venmo Handle
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Payment Info
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
