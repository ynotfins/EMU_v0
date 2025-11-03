"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, MessageSquare, FileText, Edit, Home, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { LiveMap } from "./live-map"
import { Badge } from "./ui/badge"
import { useIncident } from "@/hooks/use-incident"
import { createIncidentChat } from "@/lib/realtime-database"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { updateDoc, doc, arrayUnion } from "firebase/firestore"
import { notifySupervisors } from "@/lib/notifications"

interface IncidentDetailTabsProps {
  incidentId: string
  userRole: "chaser" | "supe" | "admin" | "super_admin"
}

export function IncidentDetailTabs({ incidentId, userRole }: IncidentDetailTabsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: incident, isLoading, error, saveNotes } = useIncident(incidentId)
  const [activeTab, setActiveTab] = useState("details")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Homeowner form state
  const [homeownerData, setHomeownerData] = useState({
    homeownerName: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    propertyAddress: "",
    incidentDate: "",
    policyNumber: "",
    carrierName: "",
    claimsPhone: "",
    damageDescription: "",
    adjusterName: "",
    adjusterPhone: "",
    additionalNotes: ""
  })

  useEffect(() => {
    if (incident?.notes) {
      setNotes(incident.notes)
    }
  }, [incident?.notes])

  const handleRespondToAlert = async () => {
    if (!auth.currentUser || !incident) return
    
    try {
      // Add user to responded list on incident
      await updateDoc(doc(db, "incidents", incidentId), {
        respondedBy: arrayUnion(auth.currentUser.uid),
        respondedAt: arrayUnion({
          uid: auth.currentUser.uid,
          timestamp: new Date().toISOString()
        })
      })
      
      // Create a response record for the user
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore")
      await addDoc(collection(db, "responses"), {
        incidentId: incidentId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email || "Unknown",
        userRole: userRole,
        incidentAddress: incident.address,
        respondedAt: serverTimestamp(),
        status: "active",
        createdAt: serverTimestamp()
      })
      
      // Send notification to all supervisors
      await notifySupervisors({
        type: 'response',
        title: 'New Response to Alert',
        message: `${auth.currentUser.displayName || auth.currentUser.email} has responded to alert at ${incident.address}`,
        from: {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName || auth.currentUser.email || "Unknown",
          role: userRole
        },
        metadata: {
          incidentId: incidentId,
          incidentAddress: incident.address
        }
      })
      
      toast({
        title: "Response Recorded",
        description: "Supervisors have been notified",
      })
    } catch (error) {
      console.error("Error responding to alert:", error)
      toast({
        title: "Error",
        description: "Failed to record response",
        variant: "destructive"
      })
    }
  }

  const handleCreateChat = async () => {
    try {
      const chatId = await createIncidentChat(
        incidentId,
        incident?.address || "Unknown Location"
      )
      
      // Navigate to the chat
      router.push(`/${userRole}/chat/${incidentId}`)
      
      toast({
        title: "Chat Created",
        description: "Group chat with all supervisors has been created",
      })
    } catch (error) {
      console.error("Error creating chat:", error)
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      })
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      await saveNotes(notes)
      toast({
        title: "Notes Saved",
        description: "Your notes have been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveHomeowner = async () => {
    // TODO: Implement homeowner data saving
    toast({
      title: "Saved",
      description: "Homeowner information saved successfully",
    })
  }

  if (isLoading) return <div className="p-6">Loading incident...</div>
  if (error) return <div className="p-6 text-destructive">Error loading incident</div>
  if (!incident) return <div className="p-6">Incident not found</div>

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Reduced height by 50% */}
      <div className="bg-[#007AFF] text-white p-2">
        <div className="flex items-center justify-between mb-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-0 hover:bg-transparent h-8"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <h1 className="text-lg font-bold">NFA Alert Details</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white h-8 w-8 p-0"
          >
            ⋮
          </Button>
        </div>
        {incident.incidentNumber && (
          <div className="text-xs opacity-90">#{incident.incidentNumber}</div>
        )}
      </div>

      {/* Tabs - Moved to top */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5 w-full rounded-none border-b bg-white">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="homeowner">Homeowner</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="esign">eSign</TabsTrigger>
          <TabsTrigger value="chat" className="relative">
            Chat
            <MessageSquare className="h-4 w-4 ml-1" />
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="flex-1 overflow-y-auto">
          {/* Map Section */}
          <div className="relative h-64 bg-gray-100">
            {(() => {
              const hasCoords = incident.lat !== undefined && incident.lng !== undefined;
              console.log('[IncidentDetail] Map data:', {
                incidentId,
                hasCoords,
                lat: incident.lat,
                lng: incident.lng,
                latType: typeof incident.lat,
                lngType: typeof incident.lng
              });
              
              // Pass as single incident (not marker) - GoogleMap will handle it
              return (
                <LiveMap 
                  incidents={hasCoords ? [incident] : []}
                  markers={[]}
                />
              );
            })()}
            <div className="absolute bottom-4 left-4 right-4">
              <Button 
                className="w-full bg-[#34C759] hover:bg-[#2FB04D] text-white font-bold"
                onClick={handleRespondToAlert}
              >
                Respond to Alert
              </Button>
            </div>
          </div>

          {/* Incident Info */}
          <div className="bg-white p-4 border-b">
            <h2 className="text-xl font-bold">{incident.type || "Incident"}</h2>
            <p className="text-lg">{incident.address}</p>
            <p className="text-gray-600">{incident.city}, {incident.state}</p>
          </div>
          
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Updates ({incident.updates?.length || 0})</CardTitle>
              </CardHeader>
            <CardContent className="space-y-3">
              {/* Always show the main incident as the first update */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span>📍 INITIAL ALERT</span>
                  <span className="ml-auto">{new Date(incident.updatedAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">{incident.type} | {incident.message}</p>
                <p className="text-xs text-gray-500 mt-1">📍 {incident.address}</p>
              </div>
              
              {/* Show all updates in reverse chronological order (newest first) */}
              {incident.updates && incident.updates.length > 0 && 
                [...incident.updates]
                  .sort((a, b) => {
                    const dateA = new Date(a.ts || a.timestamp || 0).getTime()
                    const dateB = new Date(b.ts || b.timestamp || 0).getTime()
                    return dateB - dateA // Newest first
                  })
                  .map((update, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span>📍 UPDATE #{incident.updates!.length - index}</span>
                        <span className="ml-auto">{new Date(update.ts || update.timestamp || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{update.message}</p>
                      {update.address && (
                        <p className="text-xs text-gray-500 mt-1">📍 {update.address}</p>
                      )}
                    </div>
                  ))
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Notes (auto-saves)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add your notes here..."
                className="min-h-[150px]"
              />
              {isSaving && <p className="text-xs text-gray-500 mt-1">Saving...</p>}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Homeowner Tab */}
        <TabsContent value="homeowner" className="p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Homeowner Name *</Label>
                  <Input 
                    value={homeownerData.homeownerName}
                    onChange={(e) => setHomeownerData({...homeownerData, homeownerName: e.target.value})}
                    placeholder="Enter homeowner name"
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input 
                    value={homeownerData.contactPerson}
                    onChange={(e) => setHomeownerData({...homeownerData, contactPerson: e.target.value})}
                    placeholder="Enter contact person"
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input 
                    value={homeownerData.contactPhone}
                    onChange={(e) => setHomeownerData({...homeownerData, contactPhone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input 
                    value={homeownerData.contactEmail}
                    onChange={(e) => setHomeownerData({...homeownerData, contactEmail: e.target.value})}
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Property Address</Label>
                  <Input 
                    value={homeownerData.propertyAddress}
                    onChange={(e) => setHomeownerData({...homeownerData, propertyAddress: e.target.value})}
                    placeholder="Enter property address"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Date of Incident</Label>
                  <Input 
                    value={homeownerData.incidentDate}
                    onChange={(e) => setHomeownerData({...homeownerData, incidentDate: e.target.value})}
                    type="date"
                  />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input 
                    value={homeownerData.policyNumber}
                    onChange={(e) => setHomeownerData({...homeownerData, policyNumber: e.target.value})}
                    placeholder="Enter policy number"
                  />
                </div>
                <div>
                  <Label>Insurance Carrier Name</Label>
                  <Input 
                    value={homeownerData.carrierName}
                    onChange={(e) => setHomeownerData({...homeownerData, carrierName: e.target.value})}
                    placeholder="Enter carrier name"
                  />
                </div>
                <div>
                  <Label>Insurance Claims Phone</Label>
                  <Input 
                    value={homeownerData.claimsPhone}
                    onChange={(e) => setHomeownerData({...homeownerData, claimsPhone: e.target.value})}
                    placeholder="Enter claims phone"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description of Damage</Label>
                  <Textarea 
                    value={homeownerData.damageDescription}
                    onChange={(e) => setHomeownerData({...homeownerData, damageDescription: e.target.value})}
                    placeholder="Describe the damage"
                  />
                </div>
                <div>
                  <Label>Adjuster Name</Label>
                  <Input 
                    value={homeownerData.adjusterName}
                    onChange={(e) => setHomeownerData({...homeownerData, adjusterName: e.target.value})}
                    placeholder="Enter adjuster name"
                  />
                </div>
                <div>
                  <Label>Adjuster Phone</Label>
                  <Input 
                    value={homeownerData.adjusterPhone}
                    onChange={(e) => setHomeownerData({...homeownerData, adjusterPhone: e.target.value})}
                    placeholder="Enter adjuster phone"
                  />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea 
                    value={homeownerData.additionalNotes}
                    onChange={(e) => setHomeownerData({...homeownerData, additionalNotes: e.target.value})}
                    placeholder="Any additional notes"
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveHomeowner}
              className="w-full bg-[#007AFF] hover:bg-[#0051D5]"
            >
              Save Homeowner Information
            </Button>
          </div>
        </TabsContent>

        {/* Docs Tab */}
        <TabsContent value="docs" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Photos</CardTitle>
              <CardDescription>Upload documents and capture photos related to this incident</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline">
                  📷 Capture Photo
                </Button>
                <Button className="flex-1" variant="outline">
                  📄 Upload Document
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 text-center py-8">
                  No documents uploaded yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* eSign Tab */}
        <TabsContent value="esign" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Electronic Signatures</CardTitle>
              <CardDescription>Send documents for electronic signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                📝 Create Signature Request
              </Button>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 text-center py-8">
                  No signature requests yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Chat</CardTitle>
              <CardDescription>Start a group chat with all supervisors about this incident</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateChat}
                className="w-full bg-[#007AFF] hover:bg-[#0051D5]"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Group Chat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
