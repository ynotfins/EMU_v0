"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { useProfile } from "@/hooks/use-profile"
import { useLocationDistance } from "@/hooks/use-location-distance"
import { useIncidents } from "@/hooks/use-incidents"

export function DebugPanel() {
  const [authState, setAuthState] = useState<any>(null)
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { userLocation, permissionGranted, error: locationError } = useLocationDistance()
  const { data: incidents } = useIncidents()
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        isAuthenticated: !!user,
        uid: user?.uid,
        email: user?.email,
      })
    })
    return unsubscribe
  }, [])
  
  if (process.env.NODE_ENV !== "development") return null
  
  return (
    <div className="fixed bottom-20 right-4 bg-black/90 text-white text-xs p-3 rounded-lg max-w-xs z-50">
      <div className="space-y-2">
        <div>
          <span className="font-bold">Auth:</span>{" "}
          {authState ? `${authState.email} (${authState.uid?.substring(0, 8)}...)` : "Loading..."}
        </div>
        
        <div>
          <span className="font-bold">Profile:</span>{" "}
          {profileLoading ? "Loading..." : profile ? `${profile.displayName} (${profile.role})` : "Not loaded"}
        </div>
        
        <div>
          <span className="font-bold">Location:</span>{" "}
          {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : locationError || "Not available"}
        </div>
        
        <div>
          <span className="font-bold">Location Permission:</span>{" "}
          {permissionGranted === null ? "Unknown" : permissionGranted ? "Granted" : "Denied"}
        </div>
        
        <div>
          <span className="font-bold">Incidents:</span>{" "}
          {incidents.length} loaded
        </div>
        
        <div>
          <span className="font-bold">Google Maps API:</span>{" "}
          {typeof window !== "undefined" && (window as any).GOOGLE_MAPS_API_KEY ? "Loaded" : "Not detected"}
        </div>
      </div>
    </div>
  )
}
