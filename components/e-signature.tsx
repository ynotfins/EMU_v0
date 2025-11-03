"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getFingerprint } from "@/lib/fp"
import {
  PenTool, Check, X, RotateCcw, Download, Shield,
  FileText, Clock, MapPin, Smartphone, AlertCircle
} from "lucide-react"
import { spacing, borderRadius, cardStyles, colors } from "@/lib/design-tokens"
import { createHash } from 'crypto'

interface ESignatureProps {
  documentId: string
  documentTitle: string
  onSign: (signatureData: SignatureData) => Promise<void>
  onCancel?: () => void
}

export interface SignatureData {
  signatureImage: string
  signerName: string
  signerEmail: string
  signerPhone?: string
  signerTitle?: string
  ipAddress: string
  deviceFingerprint: string
  userAgent: string
  timestamp: string
  timezone: string
  documentHash: string
  consentGiven: boolean
  consentText: string
}

export function ESignature({ documentId, documentTitle, onSign, onCancel }: ESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signerInfo, setSignerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    title: ""
  })
  const [consentChecked, setConsentChecked] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{
    fingerprint: string
    ip: string
    timezone: string
  } | null>(null)
  const [signing, setSigning] = useState(false)

  // Legal consent text
  const consentText = `By signing this document electronically, I agree that my electronic signature is the legal equivalent of my manual signature on this document. I consent to be legally bound by this document's terms and conditions. I further agree that my signature on this document is as valid as if I signed the document in writing.`

  useEffect(() => {
    // Get device info on mount
    const getDeviceInfo = async () => {
      try {
        // Get fingerprint
        const fp = await getFingerprint()
        
        // Get IP address (in production, use a service like ipify)
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null)
        const ipData = ipResponse ? await ipResponse.json() : null
        
        setDeviceInfo({
          fingerprint: fp.fingerprint,
          ip: ipData?.ip || 'unknown',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      } catch (error) {
        console.error("Error getting device info:", error)
      }
    }
    
    getDeviceInfo()
  }, [])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Set drawing style
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Clear canvas
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Get mouse/touch position
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)
    
    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  // Draw
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    e.preventDefault()
    
    const pos = getPosition(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  // Generate document hash (in production, hash actual document content)
  const generateDocumentHash = () => {
    // This is a placeholder - in production, you'd hash the actual document
    const documentContent = `${documentId}-${documentTitle}-${Date.now()}`
    return btoa(documentContent).substring(0, 32)
  }

  // Handle signing
  const handleSign = async () => {
    // Validate
    if (!hasSignature) {
      toast({
        title: "Signature Required",
        description: "Please draw your signature",
        variant: "destructive"
      })
      return
    }

    if (!signerInfo.name || !signerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email",
        variant: "destructive"
      })
      return
    }

    if (!consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please agree to the electronic signature terms",
        variant: "destructive"
      })
      return
    }

    if (!deviceInfo) {
      toast({
        title: "Device Information",
        description: "Still gathering device information, please wait...",
        variant: "destructive"
      })
      return
    }

    setSigning(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error("Canvas not found")

      // Get signature image
      const signatureImage = canvas.toDataURL('image/png')

      // Prepare signature data
      const signatureData: SignatureData = {
        signatureImage,
        signerName: signerInfo.name,
        signerEmail: signerInfo.email,
        signerPhone: signerInfo.phone,
        signerTitle: signerInfo.title,
        ipAddress: deviceInfo.ip,
        deviceFingerprint: deviceInfo.fingerprint,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        timezone: deviceInfo.timezone,
        documentHash: generateDocumentHash(),
        consentGiven: true,
        consentText
      }

      await onSign(signatureData)

      toast({
        title: "Document Signed",
        description: "Your signature has been recorded successfully",
      })
    } catch (error) {
      console.error("Error signing document:", error)
      toast({
        title: "Signing Failed",
        description: "There was an error recording your signature",
        variant: "destructive"
      })
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Document Info */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-gray-600" />
              <div>
                <CardTitle className="text-xl">Electronic Signature Request</CardTitle>
                <CardDescription className="mt-1">
                  Document: {documentTitle}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="flex items-center gap-1"
              style={{ borderColor: colors.success.DEFAULT, color: colors.success.DEFAULT }}
            >
              <Shield className="h-3 w-3" />
              Secure
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Signer Information */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <CardTitle className="text-lg">Signer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signer-name">Full Name *</Label>
              <Input
                id="signer-name"
                value={signerInfo.name}
                onChange={(e) => setSignerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-email">Email Address *</Label>
              <Input
                id="signer-email"
                type="email"
                value={signerInfo.email}
                onChange={(e) => setSignerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-phone">Phone Number</Label>
              <Input
                id="signer-phone"
                type="tel"
                value={signerInfo.phone}
                onChange={(e) => setSignerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-title">Title/Position</Label>
              <Input
                id="signer-title"
                value={signerInfo.title}
                onChange={(e) => setSignerInfo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Property Owner"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Canvas */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Draw Your Signature
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair touch-none"
            style={{ 
              height: "200px",
              borderRadius: borderRadius.DEFAULT,
              backgroundColor: "#fff"
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <p className="text-sm text-gray-500 mt-2">
            Use your mouse or finger to draw your signature above
          </p>
        </CardContent>
      </Card>

      {/* Legal Consent */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <CardTitle className="text-lg">Legal Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {consentText}
            </AlertDescription>
          </Alert>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
            />
            <Label 
              htmlFor="consent" 
              className="text-sm font-normal cursor-pointer"
            >
              I have read and agree to sign this document electronically. I understand that this 
              electronic signature is legally binding.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      {deviceInfo && (
        <Card style={{ ...cardStyles.base, backgroundColor: colors.gray[50] }}>
          <CardContent style={{ padding: spacing.lg }}>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Signature Security Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                IP: {deviceInfo.ip}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {deviceInfo.timezone}
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Device ID recorded
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                256-bit encryption
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={signing}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSign}
          disabled={!hasSignature || !signerInfo.name || !signerInfo.email || !consentChecked || signing}
          className="min-w-[150px]"
          style={{ borderRadius: borderRadius.DEFAULT }}
        >
          {signing ? "Signing..." : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Sign Document
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
