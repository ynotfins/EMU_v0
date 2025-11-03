"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, ArrowLeft, Play, Square, Save, AlertCircle,
  Radio, Share2, Globe, Target, DollarSign, Zap
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"

interface ServiceConfig {
  isRunning: boolean
  radioScannerEnabled: boolean
  socialMediaEnabled: boolean
  webScrapingEnabled: boolean
  seoTrackingEnabled: boolean
  autoConversionEnabled: boolean
  minimumLossThreshold: number
}

export default function LeadGenerationSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<ServiceConfig>({
    isRunning: false,
    radioScannerEnabled: false,
    socialMediaEnabled: false,
    webScrapingEnabled: false,
    seoTrackingEnabled: true,
    autoConversionEnabled: false,
    minimumLossThreshold: 25000
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch current service status
  useEffect(() => {
    fetchServiceStatus()
  }, [])

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('/api/lead-generation')
      const data = await response.json()
      setConfig(data.config)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching service status:', error)
      toast({
        title: "Error loading settings",
        description: "Could not fetch lead generation service status",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleServiceToggle = async () => {
    try {
      const action = config.isRunning ? 'stop' : 'start'
      const response = await fetch('/api/lead-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config })
      })

      const data = await response.json()
      
      if (data.success) {
        setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }))
        toast({
          title: `Service ${action === 'start' ? 'started' : 'stopped'}`,
          description: data.message
        })
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling service:', error)
      toast({
        title: "Error",
        description: "Could not toggle lead generation service",
        variant: "destructive"
      })
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/lead-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'configure', config })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Settings saved",
          description: "Lead generation configuration updated"
        })
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Error",
        description: "Could not save configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading settings...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: spacing['2xl'], maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/leads")}
            style={{ borderRadius: borderRadius.DEFAULT }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Lead Generation Settings</h1>
            <p className="text-gray-600">Configure automatic lead capture sources</p>
          </div>
        </div>

        {/* Service Status Card */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.xl }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>
                  Control the lead generation service
                </CardDescription>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                config.isRunning 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {config.isRunning ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Running
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    Stopped
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {config.isRunning 
                    ? "The service is actively monitoring for new leads"
                    : "Start the service to begin capturing leads automatically"}
                </p>
              </div>
              <Button
                size="lg"
                variant={config.isRunning ? "destructive" : "default"}
                onClick={handleServiceToggle}
                style={{ borderRadius: borderRadius.md }}
              >
                {config.isRunning ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Service
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Service
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources Configuration */}
        <Card style={{ ...cardStyles.base, marginBottom: spacing.xl }}>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>
              Enable or disable specific lead capture methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Radio Scanner */}
            <div className="flex items-start justify-between pb-6 border-b">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: colors.danger.light,
                    color: colors.danger.DEFAULT 
                  }}
                >
                  <Radio className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="radio-scanner" className="text-base font-medium">
                    Radio Scanner Integration
                  </Label>
                  <p className="text-sm text-gray-500">
                    Monitor emergency dispatch frequencies for fire incidents
                  </p>
                </div>
              </div>
              <Switch
                id="radio-scanner"
                checked={config.radioScannerEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, radioScannerEnabled: checked }))
                }
              />
            </div>

            {/* Social Media */}
            <div className="flex items-start justify-between pb-6 border-b">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: colors.primary.light,
                    color: colors.primary.DEFAULT 
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-media" className="text-base font-medium">
                    Social Media Monitoring
                  </Label>
                  <p className="text-sm text-gray-500">
                    Track Twitter, Facebook, and Instagram for fire incidents
                  </p>
                </div>
              </div>
              <Switch
                id="social-media"
                checked={config.socialMediaEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, socialMediaEnabled: checked }))
                }
              />
            </div>

            {/* Web Scraping */}
            <div className="flex items-start justify-between pb-6 border-b">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: colors.warning.light,
                    color: colors.warning.DEFAULT 
                  }}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="web-scraping" className="text-base font-medium">
                    News & Web Scraping
                  </Label>
                  <p className="text-sm text-gray-500">
                    Scan local news sites and fire department reports
                  </p>
                </div>
              </div>
              <Switch
                id="web-scraping"
                checked={config.webScrapingEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, webScrapingEnabled: checked }))
                }
              />
            </div>

            {/* SEO Landing */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: colors.success.light,
                    color: colors.success.DEFAULT 
                  }}
                >
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="seo-tracking" className="text-base font-medium">
                    SEO Landing Page Tracking
                  </Label>
                  <p className="text-sm text-gray-500">
                    Capture leads from optimized landing pages
                  </p>
                </div>
              </div>
              <Switch
                id="seo-tracking"
                checked={config.seoTrackingEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, seoTrackingEnabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card style={cardStyles.base}>
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>
              Configure automatic lead processing rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Conversion */}
            <div className="flex items-start justify-between pb-6 border-b">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: "#E8E3FF",
                    color: "#7C3AED" 
                  }}
                >
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="auto-conversion" className="text-base font-medium">
                    Auto-Qualify High-Value Leads
                  </Label>
                  <p className="text-sm text-gray-500">
                    Automatically mark leads as qualified based on estimated loss
                  </p>
                </div>
              </div>
              <Switch
                id="auto-conversion"
                checked={config.autoConversionEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, autoConversionEnabled: checked }))
                }
              />
            </div>

            {/* Minimum Loss Threshold */}
            <div>
              <Label htmlFor="loss-threshold" className="text-base font-medium mb-2 block">
                Minimum Loss Threshold for Auto-Qualification
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="loss-threshold"
                    type="number"
                    value={config.minimumLossThreshold}
                    onChange={(e) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        minimumLossThreshold: parseInt(e.target.value) || 0 
                      }))
                    }
                    className="pl-8"
                    placeholder="25000"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  Leads with estimated loss above this amount will be auto-qualified
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Alert */}
        {(config.radioScannerEnabled || config.socialMediaEnabled || config.webScrapingEnabled) && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Radio scanner, social media, and web scraping features are in demo mode. 
              In production, these would require API integrations with respective services.
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => router.push("/crm/leads")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={saving}
            style={{ borderRadius: borderRadius.md }}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
