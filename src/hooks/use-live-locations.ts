"use client"

import { useState } from "react"

export interface LocationMarker {
  uid: string
  name: string
  lat: number
  lng: number
}

export function useLiveLocations() {
  const [markers] = useState<LocationMarker[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  return { markers, isLoading, error }
}
