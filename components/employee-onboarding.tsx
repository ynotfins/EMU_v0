"use client"

import { useState, useRef } from "react"
import { Camera, Upload, Check, X, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Alert, AlertDescription } from "./ui/alert"
import { Progress } from "./ui/progress"
import { useProfile } from "@/hooks/use-profile"
import { auth, storage, db } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { spacing, borderRadius, cardStyles } from "@/lib/design-tokens"

interface EmployeeOnboardingProps {
  onComplete?: () => void
}

export function EmployeeOnboarding({ onComplete }: EmployeeOnboardingProps) {
  const { data: profile } = useProfile()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [idImage, setIdImage] = useState<string | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Employee form data
  const [formData, setFormData] = useState({
    employeeId: "",
    hireDate: new Date().toISOString().split('T')[0],
    department: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: ""
  })

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setIdImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    setIsCapturing(true)
    // In a real implementation, this would open camera UI
    // For now, we'll use file input
    fileInputRef.current?.click()
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!profile?.uid) return
    
    if (!idFile) {
      toast({
        title: "ID Required",
        description: "Please upload or capture your ID document",
        variant: "destructive"
      })
      return
    }

    if (!formData.employeeId || !formData.emergencyContactName || !formData.emergencyContactPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload ID to Firebase Storage
      const timestamp = Date.now()
      const storageRef = ref(storage, `employees/${profile.uid}/id-docs/id-${timestamp}.jpg`)
      
      // Upload with progress tracking
      const uploadTask = uploadBytes(storageRef, idFile)
      
      // Simulate progress (since uploadBytes doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90))
      }, 200)

      const snapshot = await uploadTask
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update user profile with employee data
      const userRef = doc(db, "users", profile.uid)
      await updateDoc(userRef, {
        employee: {
          employeeId: formData.employeeId,
          hireDate: formData.hireDate,
          department: formData.department,
          permissions: ["basic"], // Default permissions
          idDocument: {
            url: downloadURL,
            uploadedAt: new Date().toISOString(),
            verified: false
          },
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelation
          }
        },
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Onboarding Complete",
        description: "Your employee profile has been created successfully",
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error saving your information. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" style={{ padding: spacing['2xl'] }}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Employee Onboarding</h1>
        <p className="text-gray-600">Complete your profile to get started</p>
      </div>

      {/* ID Capture Card */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <CardTitle>ID Verification</CardTitle>
          <CardDescription>
            Upload or capture a photo of your government-issued ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {idImage ? (
            <div className="relative">
              <img
                src={idImage}
                alt="ID Document"
                className="w-full rounded-lg border"
                style={{ borderRadius: borderRadius.md }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setIdImage(null)
                  setIdFile(null)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex-col"
                onClick={handleCameraCapture}
                style={{ minHeight: "128px", borderRadius: borderRadius.md }}
              >
                <Camera className="h-8 w-8 mb-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="h-32 flex-col"
                onClick={() => fileInputRef.current?.click()}
                style={{ minHeight: "128px", borderRadius: borderRadius.md }}
              >
                <Upload className="h-8 w-8 mb-2" />
                Upload File
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your ID will be securely stored and used only for verification purposes
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Employee Information Card */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Enter your employee details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID*</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleFormChange("employeeId", e.target.value)}
                placeholder="EMP-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date*</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleFormChange("hireDate", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleFormChange("department", e.target.value)}
              placeholder="Field Operations"
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      <Card style={cardStyles.base}>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>
            Who should we contact in case of emergency?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Contact Name*</Label>
            <Input
              id="emergencyName"
              value={formData.emergencyContactName}
              onChange={(e) => handleFormChange("emergencyContactName", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number*</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleFormChange("emergencyContactPhone", e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relationship*</Label>
              <Input
                id="emergencyRelation"
                value={formData.emergencyContactRelation}
                onChange={(e) => handleFormChange("emergencyContactRelation", e.target.value)}
                placeholder="Spouse, Parent, etc."
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card style={cardStyles.base}>
          <CardContent className="py-6">
            <div className="space-y-4">
              <p className="text-sm font-medium">Uploading documents...</p>
              <Progress value={uploadProgress} />
              <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!idFile || isUploading}
        className="w-full h-14"
        size="lg"
        style={{ borderRadius: borderRadius.md }}
      >
        {isUploading ? (
          <>Uploading...</>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Complete Onboarding
          </>
        )}
      </Button>
    </div>
  )
}
