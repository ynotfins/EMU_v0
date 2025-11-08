"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { geocodeCache, userLocationCache, locationPermission } from "@/lib/utils/offline-cache"

interface Location {
  lat: number
  lng: number
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

async function geocodeAddress(address: string): Promise<Location | null> {
  const cleanAddress = address.trim().replace(/^[,\s]+$/, "")
  if (!cleanAddress || cleanAddress.length < 3) {
    return null
  }

  const cached = geocodeCache.get(cleanAddress)
  if (cached) {
    return { lat: cached.lat, lng: cached.lng }
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          cleanAddress
        )}&key=${apiKey}`
      )
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        geocodeCache.set(cleanAddress, lat, lng)
        return { lat, lng }
      }
    } catch (error) {
      console.error("[geocodeAddress] Google Maps fetch error:", error)
    }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cleanAddress
      )}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "EMU-Alerts-App/1.0",
        },
      }
    )
    const data = await response.json()

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      geocodeCache.set(cleanAddress, lat, lng)
      return { lat, lng }
    }
  } catch (error) {
    console.error("[geocodeAddress] Nominatim fetch error:", error)
  }

  return null
}

export function useLocationDistance() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      Promise.resolve().then(() => {
        setError("Geolocation not supported by your browser")
        setPermissionGranted(false)
      })
      return
    }

    if (locationPermission.wasGranted()) {
      Promise.resolve().then(() => setPermissionGranted(true))
    }

    const cachedLoc = userLocationCache.get()
    if (cachedLoc && !userLocationCache.isStale()) {
      Promise.resolve().then(() => {
        setUserLocation({ lat: cachedLoc.lat, lng: cachedLoc.lng })
        setPermissionGranted(true)
        setError(null)
      })
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude
        const newLng = position.coords.longitude
        const accuracy = position.coords.accuracy

        const didUpdate = userLocationCache.update(newLat, newLng, accuracy, "gps")

        if (didUpdate) {
          setUserLocation({ lat: newLat, lng: newLng })
        }

        if (!locationPermission.wasGranted()) {
          locationPermission.setGranted()
        }

        setPermissionGranted(true)
        setError(null)
      },
      (err) => {
        let errorMessage = err.message
        if (err.code === 1) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings."
        } else if (err.code === 2) {
          errorMessage = "Location unavailable. Please check your device's location settings."
        } else if (err.code === 3) {
          errorMessage =
            "Location request timed out. This may be due to poor GPS signal or browser restrictions."
        }

        if (
          typeof window !== "undefined" &&
          window.location.protocol === "http:" &&
          !window.location.hostname.includes("localhost")
        ) {
          errorMessage += " Note: Location access requires HTTPS on most mobile browsers."
        }

        setError(errorMessage)
        setPermissionGranted(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 60000,
        maximumAge: 300000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  async function getIncidentDistance(
    incidentId: string,
    address: string,
    incidentLat?: number,
    incidentLng?: number
  ): Promise<number | undefined> {
    if (!userLocation) {
      return undefined
    }

    if (incidentLat !== undefined && incidentLng !== undefined) {
      return calculateDistance(userLocation.lat, userLocation.lng, incidentLat, incidentLng)
    }

    const location = await geocodeAddress(address)

    if (!location) {
      return undefined
    }

    try {
      const incidentRef = doc(db, "incidents", incidentId)
      await updateDoc(incidentRef, {
        lat: location.lat,
        lng: location.lng,
        geocodedAt: new Date().toISOString(),
      })
    } catch (cacheError) {
      console.error("[getIncidentDistance] Failed to cache location:", cacheError)
    }

    return calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng)
  }

  function calculateDistanceToPoint(lat: number, lng: number): number | undefined {
    if (!userLocation) return undefined
    return calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
  }

  async function refreshLocation(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude
          const newLng = position.coords.longitude
          const accuracy = position.coords.accuracy

          userLocationCache.forceRefresh(newLat, newLng, accuracy, "gps")

          setUserLocation({ lat: newLat, lng: newLng })
          setPermissionGranted(true)
          setError(null)
          resolve(true)
        },
        () => {
          resolve(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  return {
    userLocation,
    permissionGranted,
    error,
    getIncidentDistance,
    calculateDistanceToPoint,
    refreshLocation,
  }
}
