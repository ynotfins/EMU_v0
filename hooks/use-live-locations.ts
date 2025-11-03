"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

export interface LocationMarker {
  uid: string
  name: string
  lat: number
  lng: number
  role: string
  lastUpdated: string
}

export function useLiveLocations() {
  const [markers, setMarkers] = useState<LocationMarker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false)
      return
    }

    console.log("[useLiveLocations] Setting up location listener...")
    
    // Query users with tracking enabled who have recent location data
    const usersRef = collection(db, "users")
    const q = query(
      usersRef, 
      where("settings.trackingEnabled", "==", true)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locationMarkers: LocationMarker[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          
          // Only include users with valid location data from the last hour
          if (data.location?.lat && data.location?.lng && data.location?.lastUpdated) {
            const lastUpdate = new Date(data.location.lastUpdated)
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
            
            if (lastUpdate > hourAgo) {
              locationMarkers.push({
                uid: doc.id,
                name: data.nickname || data.displayName || data.name || data.email?.split("@")[0] || "Unknown",
                lat: data.location.lat,
                lng: data.location.lng,
                role: data.role || "chaser",
                lastUpdated: data.location.lastUpdated
              })
            }
          }
        })

        console.log(`[useLiveLocations] Found ${locationMarkers.length} active locations`)
        setMarkers(locationMarkers)
        setIsLoading(false)
      },
      (err) => {
        console.error("[useLiveLocations] Error fetching locations:", err)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { markers, isLoading, error }
}
